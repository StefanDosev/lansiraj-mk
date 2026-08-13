"use server";

import { revalidatePath } from "next/cache";

import {
  evidenceDraftSchema,
  evidenceSubmissionSchema,
} from "@/features/submissions/submissions.schema";
import type {
  EvidenceDraftFieldErrors,
  EvidenceDraftState,
  EvidenceDraftValues,
  EvidenceLinkType,
  EvidenceSubmissionState,
  EvidenceSubmissionValues,
} from "@/features/submissions/submissions.types";
import { createClient } from "@/lib/supabase/server";

function valuesFromFormData(formData: FormData): EvidenceDraftValues {
  const types = formData.getAll("linkType").map(String);
  const labels = formData.getAll("linkLabel").map(String);
  const urls = formData.getAll("linkUrl").map(String);

  return {
    projectAssignmentId: String(formData.get("projectAssignmentId") ?? ""),
    evidenceText: String(formData.get("evidenceText") ?? ""),
    expectedUpdatedAt: String(formData.get("expectedUpdatedAt") ?? ""),
    links: types.map((type, index) => ({
      type: type as EvidenceLinkType,
      label: labels[index] ?? "",
      url: urls[index] ?? "",
    })),
  };
}

export async function saveEvidenceDraft(
  _previousState: EvidenceDraftState,
  formData: FormData,
): Promise<EvidenceDraftState> {
  const values = valuesFromFormData(formData);
  const parsed = evidenceDraftSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors: EvidenceDraftFieldErrors = {};
    for (const issue of parsed.error.issues) {
      if (issue.path[0] === "evidenceText") {
        fieldErrors.evidenceText = [...(fieldErrors.evidenceText ?? []), issue.message];
      }
      if (issue.path[0] === "links" && typeof issue.path[1] === "number") {
        const index = issue.path[1];
        const field = issue.path[2];
        if (field === "type" || field === "label" || field === "url") {
          fieldErrors.links ??= [];
          fieldErrors.links[index] ??= {};
          fieldErrors.links[index][field] = [issue.message];
        }
      }
    }
    return {
      status: "error",
      values,
      fieldErrors,
      message: "Провери ги означените полиња и обиди се повторно.",
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    return { status: "error", values, message: "Сесијата истече. Најави се повторно." };
  }

  const { data, error } = await supabase.rpc("save_assignment_draft", {
    p_project_assignment_id: parsed.data.projectAssignmentId,
    p_evidence_text: parsed.data.evidenceText,
    p_links: parsed.data.links.map((link, index) => ({
      link_type: link.type,
      label: link.label,
      url: link.url,
      position: index + 1,
    })),
    p_expected_updated_at: parsed.data.expectedUpdatedAt || undefined,
  });

  if (error) {
    console.error("assignment_draft_save_failed", { code: error.code });
    const conflict = error.code === "PT409" && error.message === "draft_conflict";
    return {
      status: "error",
      values,
      conflict,
      message: conflict
        ? "Овој draft е зачуван во друг tab. Копирај ги тековните промени, освежи ја страницата и обиди се повторно."
        : error.code === "PT409"
          ? "Оваа задача повеќе не дозволува промена на draft. Освежи ја страницата."
          : "Draft-от не се зачува. Обиди се повторно без да ја затвораш страницата.",
    };
  }

  const saved = data?.[0];
  if (!saved) {
    return { status: "error", values, message: "Draft-от не се зачува. Обиди се повторно." };
  }

  const nextValues = { ...parsed.data, expectedUpdatedAt: saved.updated_at };
  revalidatePath("/app/assignments/[slug]", "page");
  return { status: "success", values: nextValues, message: "Draft-от е зачуван." };
}

function submissionValuesFromFormData(formData: FormData): EvidenceSubmissionValues {
  return {
    projectAssignmentId: String(formData.get("projectAssignmentId") ?? ""),
    expectedUpdatedAt: String(formData.get("expectedUpdatedAt") ?? ""),
    confirmation: String(formData.get("confirmation") ?? ""),
  };
}

export async function submitEvidence(
  _previousState: EvidenceSubmissionState,
  formData: FormData,
): Promise<EvidenceSubmissionState> {
  const values = submissionValuesFromFormData(formData);
  const parsed = evidenceSubmissionSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      values,
      message: parsed.error.issues[0]?.message
        ?? "Провери ја потврдата и обиди се повторно.",
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

  const { data, error } = await supabase.rpc("submit_assignment", {
    p_project_assignment_id: parsed.data.projectAssignmentId,
    p_expected_draft_updated_at: parsed.data.expectedUpdatedAt,
  });

  if (error) {
    console.error("assignment_submit_failed", { code: error.code });
    const conflict = error.code === "PT409" && error.message === "draft_conflict";
    let message = "Доказот не е испратен. Обиди се повторно без да ја затвориш страницата.";

    if (conflict) {
      message = "Draft-от е променет во друг tab. Освежи ја страницата и провери ја најновата зачувана верзија.";
    } else if (error.code === "PT409" && error.message === "submission_already_pending") {
      message = "Овој доказ веќе е испратен на проверка. Освежи ја страницата за да ја видиш тековната состојба.";
    } else if (error.code === "PT409") {
      message = "Оваа задача повеќе не може да се испрати. Освежи ја страницата за да ја видиш тековната состојба.";
    } else if (error.code === "22023" && error.message === "proof_required") {
      message = "Пред испраќање зачувај текстуален доказ, барем еден линк, или и двете.";
    }

    return { status: "error", values, message, conflict };
  }

  const submitted = data?.[0];
  if (!submitted) {
    return {
      status: "error",
      values,
      message: "Доказот не е испратен. Обиди се повторно.",
    };
  }

  revalidatePath("/app");
  revalidatePath("/app/assignments/[slug]", "page");
  return {
    status: "success",
    values: { ...parsed.data, confirmation: "" },
    message: `Верзија ${submitted.version} е испратена на човечка проверка.`,
  };
}
