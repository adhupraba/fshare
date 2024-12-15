import { validators } from "@/lib/utils";
import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .min(5, "Min allowed characters are 5.")
    .max(100, "Max allowed characters are 100.")
    .regex(validators("email"), "Please enter a valid email address"),
  password: z
    .string()
    .min(5, "Min allowed characters are 5.")
    .max(20, "Max allowed characters are 20.")
    .regex(validators("password"), "Please enter a valid password"),
});

export type TLoginSchema = z.infer<typeof loginSchema>;
