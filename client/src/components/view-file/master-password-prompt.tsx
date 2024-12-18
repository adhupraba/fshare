import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import MasterPasswordForm from "../forms/master-password-form";

interface IMasterPasswordPromptProps {
  onValidated: (masterPassword: string, encPrivateKey: string) => void;
}

const MasterPasswordPrompt: React.FC<IMasterPasswordPromptProps> = ({ onValidated }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const handleValidated = (masterPassword: string, encPrivateKey: string) => {
    setIsOpen(false);
    onValidated(masterPassword, encPrivateKey);
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent aria-describedby="Master Password Validate Dialog">
        <DialogHeader>
          <DialogTitle>Enter Master Password</DialogTitle>
          <DialogDescription>
            Enter your master password so that you can decrypt the file that you have been shared with.
          </DialogDescription>
        </DialogHeader>

        <MasterPasswordForm callback={handleValidated} />
      </DialogContent>
    </Dialog>
  );
};

export default MasterPasswordPrompt;
