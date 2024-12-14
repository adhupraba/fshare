import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import api from "@/lib/api";
import { TMFAConfirmRequest, TMFAConfirmResponse } from "@/types/auth";
import { store } from "@/store";
import { setTokens, setUser } from "@/reducers/auth-reducer";

interface IInputOTPFormProps {
  mfaTempToken: string;
}

const otpSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type OTPSchema = z.infer<typeof otpSchema>;

const InputOTPForm: React.FC<IInputOTPFormProps> = ({ mfaTempToken }) => {
  const form = useForm<OTPSchema>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      pin: "",
    },
  });

  const onSubmit = async (values: OTPSchema) => {
    try {
      const { data } = await api.post<TMFAConfirmResponse>("/api/auth/mfa/confirm", {
        mfa_temp_token: mfaTempToken,
        totp_code: values.pin,
      } satisfies TMFAConfirmRequest);

      store.dispatch(setTokens({ access: data.access, refresh: data.refresh }));
      store.dispatch(setUser({ user: data.user }));
    } catch (err) {
      console.error("mfa setup error =>", err);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-2/3 space-y-6">
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>MFA Code</FormLabel>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>Please enter the MFA code from your authenticator app.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

export default InputOTPForm;
