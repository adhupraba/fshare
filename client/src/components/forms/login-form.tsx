import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";
import { loginSchema, TLoginSchema } from "@/schemas/login-schema";
import { TLoginRequest, TLoginResponse } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ILoginFormProps {
  callback: (data: TLoginResponse) => void;
}

const LoginForm: React.FC<ILoginFormProps> = ({ callback }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { toast } = useToast();
  const form = useForm<TLoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLoginSubmit = async (values: TLoginSchema) => {
    try {
      setIsLoading(true);

      const { data } = await api.post<TLoginResponse>("/api/auth/login", {
        email: values.email,
        password: values.password,
      } satisfies TLoginRequest);

      callback(data);
    } catch (err: any) {
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
      <form onSubmit={form.handleSubmit(onLoginSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="eg: john@doe.com" type="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="Password" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-muted-foreground text-sm space-y-2">
          <p>Password should contain:</p>
          <ul className="px-5 list-disc list-outside inline-block text-left">
            <li>Atleast one lower case character</li>
            <li>Atleast one upper case character</li>
            <li>Atleast one number</li>
            <li>Atleast one special character from {"!@#$%^&*(),.?:{}|<>"}</li>
            <li>5 to 20 characters</li>
          </ul>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          Login {isLoading && <Loader2 className="animate-spin w-3 h-3" />}
        </Button>

        <p>
          New User?{" "}
          <Link to="/register" className="text-blue-500">
            Register
          </Link>
        </p>
      </form>
    </Form>
  );
};

export default LoginForm;
