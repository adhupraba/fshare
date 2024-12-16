import { File, FileAudio, FileImage, FileVideo, Trash2 } from "lucide-react";
import { Button } from "../ui/button";

interface IDisplayFileProps {
  file?: File | null;
  isUploading: boolean;
  handleFileDelete: () => void;
}

const DisplayFile: React.FC<IDisplayFileProps> = ({ file, isUploading, handleFileDelete }) => {
  const onDelete = () => {
    if (isUploading) return;

    handleFileDelete();
  };

  return (
    <div className="border-2 border-gray-300 rounded-3xl p-5 max-h-[23rem] overflow-auto">
      {file ? (
        <div className="flex justify-between items-center py-2">
          <div className="flex items-center gap-2">
            <FileIcon file={file} />
            <span className="text-base">{file.name}</span>
          </div>
          <Button onClick={onDelete} variant="ghost">
            <Trash2 className="text-red-500" />
          </Button>
        </div>
      ) : (
        <div className="h-full grid place-items-center">
          <p className="text-lg font-semibold text-gray-500 text-center">No File Selected Yet</p>
        </div>
      )}
    </div>
  );
};

export default DisplayFile;

const FileIcon = ({ file }: { file: File }) => {
  const className = "w-8 h-8";

  if (file.type.includes("image")) {
    return <FileImage className={className} />;
  } else if (file.type.includes("audio")) {
    return <FileAudio className={className} />;
  } else if (file.type.includes("video")) {
    return <FileVideo className={className} />;
  } else {
    return <File className={className} />;
  }
};
