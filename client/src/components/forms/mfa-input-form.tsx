import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import InputOTPForm from "./input-otp-form";

interface IMFAInputFormProps {
  mfaTempToken: string;
}

const MFAInputForm: React.FC<IMFAInputFormProps> = ({ mfaTempToken }) => {
  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Setup MFA</AlertDialogTitle>
        </AlertDialogHeader>
        <InputOTPForm mfaTempToken={mfaTempToken} />
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default MFAInputForm;
