import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import InputOTPForm from "./input-otp-form";

interface IMFASetupFormProps {
  qrBase64Image: string;
  mfaTempToken: string;
}

const MFASetupForm: React.FC<IMFASetupFormProps> = ({ qrBase64Image, mfaTempToken }) => {
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Setup MFA</AlertDialogTitle>
          <AlertDialogDescription>
            Scan this QR code using an authenticator app like Google Authenticator and enter the code below to complete
            MFA registration.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <img src={qrBase64Image} alt="MFA QR Code" className="w-48 h-48" />
        <InputOTPForm mfaTempToken={mfaTempToken} />
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MFASetupForm;
