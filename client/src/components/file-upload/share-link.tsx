import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Check, Copy } from "lucide-react";

interface IShareLinkProps {
  url: string;
}

const ShareLink: React.FC<IShareLinkProps> = ({ url }) => {
  const [copied, setCopied] = useState(false);

  const onCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <div className="flex items-center mt-2 gap-x-2">
      <Input
        readOnly
        className="bg-zinc-300/50 border-0 text-black focus-visible:ring-0 focus-visible:ring-offset-0"
        value={url}
      />
      <Button onClick={onCopy} size="icon">
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
      </Button>
    </div>
  );
};

export default ShareLink;
