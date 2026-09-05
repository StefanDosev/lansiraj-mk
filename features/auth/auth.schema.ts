import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z
    .email("Внеси валидна email адреса.")
    .trim()
    .transform((email) => email.toLowerCase()),
  captchaToken: z.string().trim().min(1).max(4096),
});
