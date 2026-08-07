import { z } from "zod";

export const magicLinkSchema = z.object({
  email: z
    .email("Внеси валидна email адреса.")
    .trim()
    .transform((email) => email.toLowerCase()),
});
