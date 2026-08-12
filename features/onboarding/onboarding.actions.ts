"use server";

import { redirect } from "next/navigation";
import { createOnboardingSchema } from "@/features/onboarding/onboarding.schema";
import type { OnboardingState, OnboardingValues } from "@/features/onboarding/onboarding.types";
import { createClient } from "@/lib/supabase/server";

function valuesFromFormData(formData: FormData): OnboardingValues {
  const read = (name: string) => String(formData.get(name) ?? "");
  return { displayName: read("displayName"), projectTitle: read("projectTitle"), targetUser: read("targetUser"), problemStatement: read("problemStatement"), coreAction: read("coreAction"), nonFeatures: read("nonFeatures"), weeklyHours: read("weeklyHours"), targetLaunchDate: read("targetLaunchDate") };
}

export async function completeOnboarding(_previousState: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const values = valuesFromFormData(formData);
  const parsed = createOnboardingSchema().safeParse(values);
  if (!parsed.success) return { status: "error", message: "Провери ги означените полиња и обиди се повторно.", values, fieldErrors: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  if (claimsError || !claimsData?.claims?.sub) return { status: "error", message: "Сесијата истече. Најави се повторно.", values };

  const { error } = await supabase.rpc("complete_onboarding", {
    p_display_name: parsed.data.displayName,
    p_project_title: parsed.data.projectTitle,
    p_target_user: parsed.data.targetUser,
    p_problem_statement: parsed.data.problemStatement,
    p_core_action: parsed.data.coreAction,
    p_non_features: parsed.data.nonFeatures,
    p_weekly_hours: parsed.data.weeklyHours,
    p_target_launch_date: parsed.data.targetLaunchDate,
  });
  if (error) {
    console.error("onboarding_completion_failed", { code: error.code });
    return { status: "error", message: error.code === "PT409" ? "Onboarding веќе е завршен. Освежи ја страницата за да продолжиш." : "Не успеавме да ги зачуваме податоците. Обиди се повторно.", values };
  }
  redirect("/app");
}
