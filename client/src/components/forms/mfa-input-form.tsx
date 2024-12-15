import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InputOTPForm from "./input-otp-form";
import { useEffect, useState } from "react";

interface IMFAInputFormProps {
  mfaTempToken: string;
  tokenExpAt: string;
  modalCloseCallback: () => void;
}

const MFAInputForm: React.FC<IMFAInputFormProps> = ({ mfaTempToken, tokenExpAt, modalCloseCallback }) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    modalCloseCallback();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent aria-describedby="MFA Authentication Dialog">
        <DialogHeader>
          <DialogTitle>MFA Authentication</DialogTitle>
        </DialogHeader>
        <InputOTPForm mfaTempToken={mfaTempToken} tokenExpAt={tokenExpAt} />
      </DialogContent>
    </Dialog>
  );
};

export default MFAInputForm;
