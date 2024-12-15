import { useToast } from "@/hooks/use-toast";
import { bytesToMB, validators } from "@/lib/utils";
import { useRef } from "react";

interface IDropzoneProps {
  onSelectFile: (file: File) => void;
  isUploading: boolean;
}

const Dropzone: React.FC<IDropzoneProps> = ({ isUploading, onSelectFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (isUploading) return;

    const file = event.target.files?.[0];

    if (!file) return;

    processFile(file);
  };

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();

    if (isUploading) return;

    const droppedFile = Array.from(event.dataTransfer.files)?.[0];

    if (!droppedFile) return;

    processFile(droppedFile);
  };

  const processFile = (file: File) => {
    let hasError = false;
    let message = "";

    const mimetypeValidator = validators("file");

    if (!mimetypeValidator.test(file.type)) {
      message = `Only image, video, audio and pdf files are allowed at the moment`;
      hasError = true;
    } else if (bytesToMB(file.size) > 5) {
      message = "File size cannot exceed 5 MB";
      hasError = true;
    }

    if (!hasError) {
      onSelectFile(file);
    } else {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleClickToSelect = () => {
    if (isUploading) return;

    fileInputRef?.current?.click();
  };

  return (
    <div
      className="h-40 cursor-pointer border-4 border-dashed border-gray-500 bg-gray-100 rounded-3xl p-4 grid place-items-center mb-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      onClick={handleClickToSelect}
    >
      <p className="text-lg text-center text-muted-foreground">
        Drag 'n' drop some files here, or click to select files
      </p>
      <input
        type="file"
        disabled={isUploading}
        accept="image/*,video/*,audio/*,.pdf"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        onClick={(event) => {
          (event.target as any).value = null;
        }}
      />
    </div>
  );
};

export default Dropzone;
