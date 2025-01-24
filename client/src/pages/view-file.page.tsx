import FileRenderer from "@/components/view-file/file-renderer";
import MasterPasswordPrompt from "@/components/view-file/master-password-prompt";
import NoAccessModal from "@/components/view-file/no-access-modal";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { FileDecryption } from "@/lib/file-decryption";
import { extractMultipartData } from "@/lib/utils";
import { TDecryptionStages, TFileInfo } from "@/types/file";
import { AxiosError } from "axios";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ViewFile = () => {
  const { shareToken } = useParams() as { shareToken: string };

  const [fileInfo, setFileInfo] = useState<TFileInfo>();
  const [stage, setStage] = useState<TDecryptionStages>();
  const [blobUrl, setBlobUrl] = useState<string>();
  const [customErrorMsg, setCustomErrorMsg] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    fetchFile(shareToken);
  }, [shareToken]);

  const fetchFile = async (token: string) => {
    try {
      setStage("fetching");

      const res = await api.get(`/api/files/shared/${token}`, { responseType: "arraybuffer" });
      const extractedInfo = extractMultipartData(res.data, res.headers["content-type"]);

      setFileInfo(extractedInfo);
      setStage("masterPassword");
    } catch (err: any) {
      if (err instanceof AxiosError && err.response?.status === 403) {
        setStage("noAccess");
      } else {
        setStage("errored");
      }

      setCustomErrorMsg(err.message);

      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const onMasterPasswordValidated = async (masterPassword: string, encPrivateKey: string) => {
    if (!fileInfo) return;

    try {
      setStage("decrypting");

      const blob = await new FileDecryption().decryptFile({
        decryptedFileMimeType: fileInfo.metadata.mimetype,
        encryptedFile: fileInfo.encryptedFile,
        encryptedFileEncryptionKey: fileInfo.permissions.encrypted_file_key,
        encryptedPrivateKey: encPrivateKey,
        masterPassword,
        fileHash: fileInfo.metadata.hash,
      });

      setStage("decrypted");
      setBlobUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      console.error("file error =====>", err);
      setStage("errored");

      if (err.message === "FILE_INTEGRITY_FAILED") {
        setCustomErrorMsg("File integrity failed. Please try again.");
      }
    }
  };

  return (
    <>
      {stage === "fetching" && (
        <div className="absolute top-1/2 left-1/2">
          <div className="flex items-center gap-4">
            <Loader2 className="animate-spin w-8 h-8" />
            <p>Loading</p>
          </div>
        </div>
      )}
      {stage === "noAccess" && <NoAccessModal />}
      {stage === "masterPassword" && <MasterPasswordPrompt onValidated={onMasterPasswordValidated} />}
      {stage === "decrypted" && !!blobUrl && fileInfo && (
        <FileRenderer blobUrl={blobUrl} metadata={fileInfo.metadata} permissions={fileInfo.permissions} />
      )}
      {stage === "errored" && (
        <p className="w-full text-center p-8 text-red-500 font-medium text-lg">
          {customErrorMsg ? customErrorMsg : "Couldn't decrypt the file. Something went wrong. Please try again later."}
        </p>
      )}
    </>
  );
};

export default ViewFile;
