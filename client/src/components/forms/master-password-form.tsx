import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { TMasterPasswordValidateRequest, TMasterPasswordValidateResponse } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { masterPasswordSchema, TMasterPasswordSchema } from "@/schemas/master-password-schema";
import PasswordRequirements from "../password-requirements";

interface IMasterPasswordFormProps {
  callback: (masterPassword: string, encPrivateKey: string) => void;
}

const MasterPasswordForm: React.FC<IMasterPasswordFormProps> = ({ callback }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const form = useForm<TMasterPasswordSchema>({
    resolver: zodResolver(masterPasswordSchema),
    defaultValues: {
      master_password: "",
    },
  });

  const onMasterPasswordSubmit = async (values: TMasterPasswordSchema) => {
    try {
      setIsLoading(true);

      const { data } = await api.post<TMasterPasswordValidateResponse>("/api/auth/get-enc-private-key", {
        master_password: values.master_password,
      } satisfies TMasterPasswordValidateRequest);

      callback(values.master_password, data.enc_private_key);
    } catch (err: any) {
      console.error("onMasterPasswordSubmit error =>", err);

      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onMasterPasswordSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="master_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Master Password</FormLabel>
              <FormControl>
                <Input placeholder="Master Password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="py-3">
          <PasswordRequirements />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          Validate {isLoading && <Loader2 className="animate-spin w-3 h-3" />}
        </Button>
      </form>
    </Form>
  );
};

export default MasterPasswordForm;
