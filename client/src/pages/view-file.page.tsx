import FileRenderer from "@/components/view-file/file-renderer";
import MasterPasswordPrompt from "@/components/view-file/master-password-prompt";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { FileDecryption } from "@/lib/file-decryption";
import { extractMultipartData } from "@/lib/utils";
import { TDecryptionStages, TFileInfo } from "@/types/file";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const ViewFile = () => {
  const { shareToken } = useParams() as { shareToken: string };

  const [fileInfo, setFileInfo] = useState<TFileInfo>();
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<TDecryptionStages>();
  const [blobUrl, setBlobUrl] = useState<string>();

  const { toast } = useToast();

  useEffect(() => {
    fetchFile(shareToken);
  }, [shareToken]);

  const fetchFile = async (token: string) => {
    try {
      setIsLoading(true);
      setStage("fetching");

      const res = await api.get(`/api/files/shared/${token}`, { responseType: "arraybuffer" });
      const extractedInfo = extractMultipartData(res.data, res.headers["content-type"]);

      setFileInfo(extractedInfo);
      setStage("masterPassword");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
      });

      setStage("decrypted");
      setBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("file error =====>", err);
      setStage(undefined);
    }
  };

  return (
    <>
      {stage === "masterPassword" && <MasterPasswordPrompt onValidated={onMasterPasswordValidated} />}
      {stage === "decrypted" && !!blobUrl && fileInfo && (
        <FileRenderer blobUrl={blobUrl} metadata={fileInfo.metadata} permissions={fileInfo.permissions} />
      )}
    </>
  );
};

export default ViewFile;
