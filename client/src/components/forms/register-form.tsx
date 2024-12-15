import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import api from "@/lib/api";
import { registerSchema, TRegisterSchema } from "@/schemas/register-schema";
import { TRegisterRequest, TRegisterResponse } from "@/types/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

interface IRegisterFormProps {
  callback: (data: TRegisterResponse) => void;
}

const RegisterForm: React.FC<IRegisterFormProps> = ({ callback }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<TRegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      master_password: "",
    },
  });

  const onRegisterSubmit = async (values: TRegisterSchema) => {
    try {
      setIsLoading(true);

      const { data } = await api.post<TRegisterResponse>("/api/auth/register", {
        name: values.name,
        email: values.email,
        username: values.username,
        password: values.password,
        master_password: values.master_password,
      } satisfies TRegisterRequest);

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
      <form onSubmit={form.handleSubmit(onRegisterSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="eg: John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="eg: john_doe2" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="master_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Master Password</FormLabel>
              <FormControl>
                <Input placeholder="Master Password" type="password" {...field} />
              </FormControl>
              <FormDescription>This is used to encrypt your private keys to increase security.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="text-muted-foreground text-sm space-y-2">
          <p>Password and Master Password should contain:</p>
          <ul className="px-5 list-disc list-outside inline-block">
            <li>Atleast one lower case character</li>
            <li>Atleast one upper case character</li>
            <li>Atleast one number</li>
            <li>Atleast one special character from {"!@#$%^&*(),.?:{}|<>"}</li>
            <li>5 to 20 characters</li>
          </ul>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          Register {isLoading && <Loader2 className="animate-spin w-3 h-3" />}
        </Button>

        <p>
          Existing User?{" "}
          <Link to="/login" className="text-blue-500">
            Login
          </Link>
        </p>
      </form>
    </Form>
  );
};

export default RegisterForm;
