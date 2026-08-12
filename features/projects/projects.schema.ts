import { z } from "zod";

export const projectIdSchema = z.uuid("Проектот не е валиден.");

export const scopeAssessmentSchema = z
  .object({
    projectId: projectIdSchema,
    readiness: z.enum(["ready", "needs_reduction"], { error: "Избери проценка за опсегот." }),
    note: z.string().trim().max(600, "Белешката може да има најмногу 600 знаци."),
  })
  .superRefine((value, context) => {
    if (value.readiness === "needs_reduction" && value.note.length < 10) {
      context.addIssue({
        code: "custom",
        path: ["note"],
        message: "Напиши конкретна насока со најмалку 10 знаци.",
      });
    }
  });
