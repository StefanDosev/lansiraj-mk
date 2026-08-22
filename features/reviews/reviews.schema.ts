import { z } from "zod";

import {
  reviewCriterionOutcomes,
  reviewDecisions,
} from "@/features/reviews/reviews.types";

export const submissionIdSchema = z.uuid("Испраќањето не е валидно.");

const reviewCriterionSchema = z
  .object({
    criterionId: z.uuid("Критериумот не е валиден."),
    outcome: z.enum(reviewCriterionOutcomes, { error: "Оцени го критериумот." }),
    note: z.string().trim().max(2000, "Белешката може да има најмногу 2.000 знаци."),
  })
  .superRefine((criterion, context) => {
    if (criterion.outcome === "revise" && !criterion.note) {
      context.addIssue({
        code: "custom",
        path: ["note"],
        message: "Објасни што недостига кај овој критериум.",
      });
    }
  });

export const reviewSubmissionSchema = z
  .object({
    submissionId: submissionIdSchema,
    decision: z.enum(reviewDecisions, { error: "Избери конечна одлука." }),
    summary: z
      .string()
      .trim()
      .min(1, "Напиши кратко резиме што помина и што следува.")
      .max(3000, "Резимето може да има најмногу 3.000 знаци."),
    priorityCorrection: z
      .string()
      .trim()
      .max(2000, "Приоритетната корекција може да има најмногу 2.000 знаци."),
    confirmation: z.literal("confirmed", {
      error: "Потврди дека ја прегледа точната верзија и сите критериуми.",
    }),
    criteria: z
      .array(reviewCriterionSchema)
      .min(1, "Оваа задача нема критериуми за проверка.")
      .max(20, "Испратени се премногу критериуми."),
  })
  .superRefine((review, context) => {
    const criterionIds = new Set(review.criteria.map((criterion) => criterion.criterionId));
    if (criterionIds.size !== review.criteria.length) {
      context.addIssue({
        code: "custom",
        path: ["criteria"],
        message: "Секој критериум може да се оцени само еднаш.",
      });
    }

    const hasRevision = review.criteria.some((criterion) => criterion.outcome === "revise");
    if (review.decision === "approved" && hasRevision) {
      context.addIssue({
        code: "custom",
        path: ["decision"],
        message: "Одобрување е можно само кога сите критериуми се поминати.",
      });
    }

    if (review.decision === "revision_required" && !hasRevision) {
      context.addIssue({
        code: "custom",
        path: ["decision"],
        message: "За корекција означи барем еден критериум како потребна корекција.",
      });
    }

    if (review.decision === "revision_required" && !review.priorityCorrection) {
      context.addIssue({
        code: "custom",
        path: ["priorityCorrection"],
        message: "Напиши ја единствената приоритетна корекција.",
      });
    }

    if (review.decision === "approved" && review.priorityCorrection) {
      context.addIssue({
        code: "custom",
        path: ["priorityCorrection"],
        message: "Одобрен доказ нема приоритетна корекција.",
      });
    }
  });
