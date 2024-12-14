import LoginForm, { LoginSchema } from "@/components/forms/login-form";
import MFAInputForm from "@/components/forms/mfa-input-form";
import MFASetupForm from "@/components/forms/mfa-setup-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { TLoginRequest, TLoginResponse } from "@/types/auth";
import { useState } from "react";

const Login = () => {
  const [loginResponse, setLoginResponse] = useState<TLoginResponse>();

  const onLoginSubmit = async (values: LoginSchema) => {
    try {
      const { data } = await api.post<TLoginResponse>("/api/auth/login", {
        email: values.email,
        password: values.password,
      } satisfies TLoginRequest);

      setLoginResponse(data);
    } catch (err) {
      console.error("login error =>", err);
    }
  };

  return (
    <div className="h-screen max-w-4xl mx-auto flex items-center justify-center">
      <Card className="w-11/12 md:w-1/2">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <LoginForm onSubmit={onLoginSubmit} />
        </CardContent>
      </Card>

      {loginResponse?.action === "mfa_setup" && (
        <MFASetupForm mfaTempToken={loginResponse.mfa_temp_token} qrBase64Image={loginResponse.totp_qr} />
      )}

      {loginResponse?.action === "mfa_required" && <MFAInputForm mfaTempToken={loginResponse.mfa_temp_token} />}
    </div>
  );
};

export default Login;
