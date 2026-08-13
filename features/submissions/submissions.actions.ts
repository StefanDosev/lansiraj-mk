"use server";

import { revalidatePath } from "next/cache";

import { evidenceDraftSchema } from "@/features/submissions/submissions.schema";
import type {
  EvidenceDraftFieldErrors,
  EvidenceDraftState,
  EvidenceDraftValues,
  EvidenceLinkType,
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
