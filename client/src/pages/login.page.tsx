import LoginForm from "@/components/forms/login-form";
import MFAInputForm from "@/components/forms/mfa-input-form";
import MFASetupForm from "@/components/forms/mfa-setup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TLoginResponse } from "@/types/auth";
import { useState } from "react";

const Login = () => {
  const [loginResponse, setLoginResponse] = useState<TLoginResponse>();

  const onSubmit = (data: TLoginResponse) => {
    setLoginResponse(data);
  };

  const handleCloseModal = () => {
    setLoginResponse(undefined);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 grid place-items-center">
      <Card className="w-11/12 md:w-2/3">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm callback={onSubmit} />
        </CardContent>
      </Card>

      {loginResponse?.action === "mfa_setup" && (
        <MFASetupForm
          tokenExpAt={loginResponse.token_exp_at}
          mfaTempToken={loginResponse.mfa_temp_token}
          qrBase64Image={loginResponse.totp_qr}
          modalCloseCallback={handleCloseModal}
        />
      )}

      {loginResponse?.action === "mfa_required" && (
        <MFAInputForm
          tokenExpAt={loginResponse.token_exp_at}
          mfaTempToken={loginResponse.mfa_temp_token}
          modalCloseCallback={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Login;
