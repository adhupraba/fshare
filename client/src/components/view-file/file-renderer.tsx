import { getFileType } from "@/lib/utils";
import { TFileMetadata, TFilePermissions } from "@/types/file";
import { Download, Eye, FileWarningIcon, Loader2 } from "lucide-react";
import { useEffect, lazy, Suspense } from "react";
import { Button } from "../ui/button";

const PdfViewer = lazy(() => import("./pdf-viewer"));

interface IFileRendererProps {
  blobUrl: string;
  metadata: TFileMetadata;
  permissions: TFilePermissions;
}

const FileRenderer: React.FC<IFileRendererProps> = ({ blobUrl, metadata, permissions }) => {
  const fileType = getFileType(metadata.mimetype);

  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    if (!permissions.can_download) {
      timeout = setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
      }, 500);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [permissions]);

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = metadata.name;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!fileType) {
    return (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="max-w-4xl">
          <div className="flex flex-col items-center gap-3">
            <FileWarningIcon className="w-20 h-20  font-bold text-muted-foreground" />
            <h2 className="text-4xl text-center font-bold text-muted-foreground">Invalid file type.</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-start items-center pt-12">
      <div className="w-full mb-4 flex flex-col-reverse gap-3 md:flex-row md:justify-between md:items-start">
        <div>
          <span>
            Shared by <span className="font-bold">{metadata.owner.name}</span>
          </span>
          <p className="text-sm">Expires at: {new Date(permissions.expires_at).toLocaleTimeString()}</p>
        </div>

        <h1 className="text-3xl font-bold max-w-md truncate">{metadata.name}</h1>

        {permissions.can_download ? (
          <Button onClick={downloadFile}>
            <Download />
          </Button>
        ) : (
          <div className="flex items-center justify-start gap-2">
            <Eye className="w-4 h-4 md:w-8 md:h-8" />
            <span>Viewing</span>
          </div>
        )}
      </div>

      {fileType === "audio" && (
        <audio
          src={blobUrl}
          controls
          controlsList="nodownload"
          className="w-full"
          onContextMenu={(e) => e.preventDefault()}
        />
      )}

      {fileType === "video" && (
        <video
          src={blobUrl}
          className="w-full"
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()}
        />
      )}

      {fileType === "image" && <img src={blobUrl} className="w-full" onContextMenu={(e) => e.preventDefault()} />}

      {fileType === "pdf" && (
        <Suspense fallback={<Loader2 className="animate-spin w-8 h-8 grid place-content-center" />}>
          <PdfViewer pdfUrl={blobUrl} />
        </Suspense>
      )}
    </div>
  );
};

export default FileRenderer;
