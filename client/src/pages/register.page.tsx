import MFASetupForm from "@/components/forms/mfa-setup-form";
import RegisterForm, { RegisterSchema } from "@/components/forms/register-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";
import { TRegisterRequest, TRegisterResponse } from "@/types/auth";
import { useState } from "react";

const Regsiter = () => {
  const [registerResponse, setRegisterResponse] = useState<TRegisterResponse>();

  const onRegisterSubmit = async (values: RegisterSchema) => {
    try {
      const { data } = await api.post<TRegisterResponse>("/api/auth/login", {
        name: values.name,
        email: values.email,
        password: values.password,
        master_password: values.master_password,
      } satisfies TRegisterRequest);

      setRegisterResponse(data);
    } catch (err) {
      console.error("register error =>", err);
    }
  };

  return (
    <div className="h-screen max-w-4xl mx-auto flex items-center justify-center">
      <Card className="w-11/12 md:w-1/2">
        <CardHeader>
          <CardTitle>Register</CardTitle>
        </CardHeader>
        <CardContent>
          <RegisterForm onSubmit={onRegisterSubmit} />
        </CardContent>
      </Card>

      {!!registerResponse?.totp_qr && (
        <MFASetupForm mfaTempToken={registerResponse.mfa_temp_token} qrBase64Image={registerResponse.totp_qr} />
      )}
    </div>
  );
};

export default Regsiter;
