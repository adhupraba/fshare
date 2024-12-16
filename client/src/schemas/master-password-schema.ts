import { validators } from "@/lib/utils";
import { z } from "zod";

export const masterPasswordSchema = z.object({
  master_password: z
    .string()
    .min(5, "Min allowed characters are 5.")
    .max(20, "Max allowed characters are 20.")
    .regex(validators("password"), "Please enter a valid master password"),
});

export type TMasterPasswordSchema = z.infer<typeof masterPasswordSchema>;
