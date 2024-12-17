import { useState } from "react";
import DisplayFile from "./display-file";
import Dropzone from "./dropzone";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FileEncryption } from "@/lib/file-encryption";
import api from "@/lib/api";
import { TFileUploadResponse, TRecipient, TShareData } from "@/types/file";
import ShareLink from "./share-link";
import Recipients from "./recipients";

const UploadFile = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [recipients, setRecipients] = useState<TRecipient[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [shareData, setShareData] = useState<TShareData>();

  const { toast } = useToast();

  const onSelectFile = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileDelete = () => {
    setSelectedFile(null);
    setShareData(undefined);
  };

  const onAddRecipient = (recipient: TRecipient) => {
    setRecipients((prev) => [...prev, recipient]);
  };

  const onUpdateRecipient = (idx: number, recipient: TRecipient) => {
    setRecipients((prev) => {
      const newPrev = [...prev];
      newPrev[idx] = recipient;
      return newPrev;
    });
  };

  const onDeleteRecipient = (idx: number) => {
    setRecipients((prev) => prev.filter((_, prevIdx) => idx !== prevIdx));
  };

  const handleBeginUpload = async () => {
    if (!selectedFile) return;

    try {
      setIsUploading(true);

      const { encryptedFile, encryptionKey } = await FileEncryption.encrypt(selectedFile);
      const metadata = {
        name: selectedFile.name,
        mimetype: selectedFile.type,
        size: selectedFile.size,
      };

      const formData = new FormData();
      formData.append("file", encryptedFile, `${crypto.randomUUID()}.enc`);
      formData.append("encryption_key_b64", btoa(JSON.stringify(encryptionKey)));
      formData.append("file_metadata", JSON.stringify(metadata));
      formData.append("recipients", JSON.stringify(recipients));

      const { data } = await api.post<TFileUploadResponse>("/api/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const url = `${location.origin}/files/shared/${data.share_token}`;
      setShareData({ url, exp_time: new Date(data.token_exp_at).toLocaleTimeString() });

      toast({
        title: "Success",
        description: data.message,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="pt-12">
      <h2 className="text-2xl font-semibold text-center mb-4">Upload File</h2>
      <Dropzone onSelectFile={onSelectFile} isUploading={isUploading} />
      <DisplayFile file={selectedFile} isUploading={isUploading} handleFileDelete={handleFileDelete} />
      {selectedFile && (
        <>
          <Recipients
            recipients={recipients}
            onAddRecipient={onAddRecipient}
            onDeleteRecipient={onDeleteRecipient}
            onUpdateRecipient={onUpdateRecipient}
          />
          <div className="flex justify-center items-center">
            <Button className="mt-4 w-1/3 mx-auto" disabled={isUploading} onClick={handleBeginUpload}>
              {isUploading ? "Uploading" : "Upload"} {isUploading && <Loader2 className="animate-spin w-3 h-3" />}
            </Button>
          </div>
        </>
      )}
      {!!shareData && <ShareLink shareData={shareData} />}
    </div>
  );
};

export default UploadFile;
