import { validators } from "@/lib/utils";
import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Min allowed characters are 2.")
    .max(255, "Max allowed characters are 255.")
    .regex(validators("name"), "Please enter a valid name"),
  username: z
    .string()
    .min(5, "Min allowed characters are 5.")
    .max(20, "Max allowed characters are 20.")
    .regex(validators("username"), "Please enter a valid username"),
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
  master_password: z
    .string()
    .min(5, "Min allowed characters are 5.")
    .max(20, "Max allowed characters are 20.")
    .regex(validators("password"), "Please enter a valid master password"),
});

export type TRegisterSchema = z.infer<typeof registerSchema>;
