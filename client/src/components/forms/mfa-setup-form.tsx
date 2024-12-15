import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import InputOTPForm from "./input-otp-form";
import { useEffect, useState } from "react";

interface IMFASetupFormProps {
  qrBase64Image: string;
  mfaTempToken: string;
  tokenExpAt: string;
  modalCloseCallback: () => void;
}

const MFASetupForm: React.FC<IMFASetupFormProps> = ({
  tokenExpAt,
  qrBase64Image,
  mfaTempToken,
  modalCloseCallback,
}) => {
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
      <DialogContent aria-describedby="Setup MFA Dialog">
        <DialogHeader>
          <DialogTitle>Setup MFA</DialogTitle>
          <DialogDescription>
            Scan this QR code using an authenticator app like Google Authenticator and enter the code below to complete
            MFA registration.
          </DialogDescription>
        </DialogHeader>
        <div className="md:flex gap-2">
          <img src={qrBase64Image} alt="MFA QR Code" className="mx-auto md:mx-0 w-48 h-48" />
          <InputOTPForm mfaTempToken={mfaTempToken} tokenExpAt={tokenExpAt} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MFASetupForm;
