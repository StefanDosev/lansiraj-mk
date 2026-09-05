"use server";

import { revalidatePath } from "next/cache";

import { scopeAssessmentSchema } from "@/features/projects/projects.schema";
import type { ScopeAssessmentState, ScopeAssessmentValues, StartProjectState } from "@/features/projects/projects.types";
import { createClient } from "@/lib/supabase/server";

export async function startProject(_previousState: StartProjectState, _formData: FormData): Promise<StartProjectState> {
  void _previousState;
  void _formData;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return { status: "error", message: "Сесијата истече. Најави се повторно." };
  }

  const { error } = await supabase.rpc("start_project");
  if (error) {
    console.error("project_start_failed", { code: error.code });
    return {
      status: "error",
      message: error.code === "PT409"
        ? "Проектот не може безбедно да се започне. Освежи ја страницата и обиди се повторно."
        : "Не успеавме да го започнеме проектот. Обиди се повторно.",
    };
  }

  revalidatePath("/app");
  return { status: "idle" };
}

export async function assessProjectScope(
  _previousState: ScopeAssessmentState,
  formData: FormData,
): Promise<ScopeAssessmentState> {
  const values: ScopeAssessmentValues = {
    projectId: String(formData.get("projectId") ?? ""),
    readiness: String(formData.get("readiness") ?? "") as ScopeAssessmentValues["readiness"],
    note: String(formData.get("note") ?? ""),
  };
  const parsed = scopeAssessmentSchema.safeParse(values);

  if (!parsed.success) {
    return {
      status: "error",
      values,
      message: "Провери ја проценката и обиди се повторно.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) {
    return { status: "error", values, message: "Сесијата истече. Најави се повторно." };
  }

  const { error } = await supabase.rpc("assess_project_scope", {
    p_project_id: parsed.data.projectId,
    p_readiness: parsed.data.readiness,
    p_note: parsed.data.note,
  });

  if (error) {
    console.error("project_scope_assessment_failed", { code: error.code });
    return { status: "error", values, message: "Проценката не се зачува. Обиди се повторно." };
  }

  revalidatePath(`/admin/projects/${parsed.data.projectId}`);
  revalidatePath("/app/project");
  return { status: "success", values: parsed.data, message: "Проценката е зачувана." };
}
