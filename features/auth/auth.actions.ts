"use server";

import { redirect } from "next/navigation";

import { magicLinkSchema } from "@/features/auth/auth.schema";
import { isAuthRateLimitFailure } from "@/features/auth/auth-rate-limit";
import type { MagicLinkState } from "@/features/auth/auth.types";
import { getAppOrigin } from "@/features/auth/auth-url";
import { createClient } from "@/lib/supabase/server";

const neutralSuccessMessage = "Ако адресата може да се најави, ќе добиеш безбеден линк по email.";
const rateLimitMessage = "Барањето е примено. Почекај малку пред да побараш нов линк.";

export async function requestMagicLink(
  _previousState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const parsed = magicLinkSchema.safeParse({
    email: formData.get("email"),
    captchaToken: formData.get("captchaToken"),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;
    return {
      status: "error",
      message: fieldErrors.email
        ? "Провери ја email адресата и обиди се повторно."
        : "Потврди ја безбедносната проверка и обиди се повторно.",
      fieldErrors: { email: fieldErrors.email },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${getAppOrigin()}/auth/confirm`,
      shouldCreateUser: false,
      captchaToken: parsed.data.captchaToken,
    },
  });

  if (error) {
    console.error("auth_magic_link_request_failed", { code: error.code });

    if (isAuthRateLimitFailure(error)) {
      return { status: "success", message: rateLimitMessage };
    }
  }

  return { status: "success", message: neutralSuccessMessage };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) console.error("auth_sign_out_failed", { code: error.code });
  redirect("/auth/sign-in");
}
