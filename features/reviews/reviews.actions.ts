"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { reviewSubmissionSchema } from "@/features/reviews/reviews.schema";
import type {
  ReviewCriterionOutcome,
  ReviewSubmissionFieldErrors,
  ReviewSubmissionState,
  ReviewSubmissionValues,
} from "@/features/reviews/reviews.types";
import { createClient } from "@/lib/supabase/server";

function valuesFromFormData(formData: FormData): ReviewSubmissionValues {
  const criterionIds = formData.getAll("criterionId").map(String);

  return {
    submissionId: String(formData.get("submissionId") ?? ""),
    decision: String(formData.get("decision") ?? "") as ReviewSubmissionValues["decision"],
    summary: String(formData.get("summary") ?? ""),
    priorityCorrection: String(formData.get("priorityCorrection") ?? ""),
    confirmation: String(formData.get("confirmation") ?? ""),
    criteria: criterionIds.map((criterionId) => ({
      criterionId,
      outcome: String(
        formData.get(`criterionOutcome:${criterionId}`) ?? "",
      ) as ReviewCriterionOutcome | "",
      note: String(formData.get(`criterionNote:${criterionId}`) ?? ""),
    })),
  };
}

function fieldErrorsFromIssues(
  issues: ReadonlyArray<{ path: PropertyKey[]; message: string }>,
): ReviewSubmissionFieldErrors {
  const fieldErrors: ReviewSubmissionFieldErrors = {};

  for (const issue of issues) {
    const field = issue.path[0];
    if (
      field === "decision"
      || field === "summary"
      || field === "priorityCorrection"
      || field === "confirmation"
    ) {
      fieldErrors[field] = [...(fieldErrors[field] ?? []), issue.message];
    }

    if (field === "criteria" && typeof issue.path[1] === "number") {
      const index = issue.path[1];
      const criterionField = issue.path[2];
      if (criterionField === "outcome" || criterionField === "note") {
        fieldErrors.criteria ??= [];
        fieldErrors.criteria[index] ??= {};
        fieldErrors.criteria[index][criterionField] = [issue.message];
      }
    }
  }

  return fieldErrors;
}

function reviewErrorMessage(code: string, message: string): { message: string; conflict?: boolean } {
  if (code === "PT409") {
    return {
      conflict: true,
      message: message === "submission_already_reviewed"
        ? "Оваа верзија веќе има конечна одлука. Освежи ја страницата за да ја видиш."
        : "Состојбата на задачата се промени. Освежи ја страницата пред повторен преглед.",
    };
  }

  if (code === "PT403" || code === "PT401") {
    return { message: "Reviewer сесијата не е валидна. Најави се повторно." };
  }

  if (code === "22023") {
    return { message: "Одлуката не е целосна или повеќе не одговара на критериумите. Провери ја формата." };
  }

  return { message: "Одлуката не се зачува. Обиди се повторно без да ја затвориш страницата." };
}

export async function submitReviewDecision(
  _previousState: ReviewSubmissionState,
  formData: FormData,
): Promise<ReviewSubmissionState> {
  const values = valuesFromFormData(formData);
  const parsed = reviewSubmissionSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      values,
      fieldErrors: fieldErrorsFromIssues(parsed.error.issues),
      message: "Провери ги означените полиња пред конечната одлука.",
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    return {
      status: "error",
      values,
      message: "Сесијата истече. Најави се повторно.",
    };
  }

  const { error } = await supabase.rpc("review_submission", {
    p_submission_id: parsed.data.submissionId,
    p_decision: parsed.data.decision,
    p_summary: parsed.data.summary,
    p_priority_correction: parsed.data.priorityCorrection,
    p_criteria: parsed.data.criteria.map((criterion) => ({
      criterion_id: criterion.criterionId,
      outcome: criterion.outcome,
      note: criterion.note || null,
    })),
  });

  if (error) {
    console.error("submission_review_failed", { code: error.code });
    return {
      status: "error",
      values,
      ...reviewErrorMessage(error.code, error.message),
    };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/reviews/${parsed.data.submissionId}`);
  revalidatePath("/app");
  revalidatePath("/app/project");
  revalidatePath("/app/assignments/[slug]", "page");
  redirect(`/admin?reviewed=${parsed.data.decision}`);
}
