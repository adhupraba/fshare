import MFASetupForm from "@/components/forms/mfa-setup-form";
import RegisterForm from "@/components/forms/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TRegisterResponse } from "@/types/auth";
import { useState } from "react";

const Regsiter = () => {
  const [registerResponse, setRegisterResponse] = useState<TRegisterResponse>();

  const onSubmit = (data: TRegisterResponse) => {
    setRegisterResponse(data);
  };

  const handleCloseModal = () => {
    setRegisterResponse(undefined);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 grid place-items-center">
      <Card className="w-11/12 md:w-2/3">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm callback={onSubmit} />
        </CardContent>
      </Card>

      {!!registerResponse?.totp_qr && (
        <MFASetupForm
          tokenExpAt={registerResponse.token_exp_at}
          mfaTempToken={registerResponse.mfa_temp_token}
          qrBase64Image={registerResponse.totp_qr}
          modalCloseCallback={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Regsiter;
