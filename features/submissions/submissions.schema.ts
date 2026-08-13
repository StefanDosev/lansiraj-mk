import { z } from "zod";

import { evidenceLinkTypes } from "@/features/submissions/submissions.types";

export const evidenceDraftLinkSchema = z.object({
  type: z.enum(evidenceLinkTypes, { error: "Избери вид на линк." }),
  label: z.string().trim().min(1, "Внеси кратка ознака за линкот.").max(80, "Ознаката може да има најмногу 80 знаци."),
  url: z
    .string()
    .trim()
    .max(2048, "Линкот е предолг.")
    .url("Внеси важечки линк.")
    .refine((value) => value.startsWith("https://"), "Користи безбеден https линк."),
});

export const evidenceDraftSchema = z.object({
  projectAssignmentId: z.string().uuid(),
  evidenceText: z.string().max(10000, "Текстот може да има најмногу 10.000 знаци."),
  links: z.array(evidenceDraftLinkSchema).max(10, "Може да додадеш најмногу 10 линкови."),
  expectedUpdatedAt: z.union([z.literal(""), z.string().datetime({ offset: true })]),
});

export const evidenceSubmissionSchema = z.object({
  projectAssignmentId: z.string().uuid(),
  expectedUpdatedAt: z.string().datetime({ offset: true }),
  confirmation: z.literal("confirmed", {
    error: "Потврди дека доказот е подготвен за човечка проверка.",
  }),
});
