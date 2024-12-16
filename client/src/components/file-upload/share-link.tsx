import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Check, Copy } from "lucide-react";
import { TShareData } from "@/types/file";

interface IShareLinkProps {
  shareData: TShareData;
}

const ShareLink: React.FC<IShareLinkProps> = ({ shareData }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(shareData.url);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center mt-2 gap-x-2">
        <Input
          readOnly
          className="bg-zinc-300/50 border-0 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
          value={shareData.url}
        />
        <Button onClick={onCopy} size="icon">
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">This link is valid only until {shareData.exp_time}</p>
    </div>
  );
};

export default ShareLink;
