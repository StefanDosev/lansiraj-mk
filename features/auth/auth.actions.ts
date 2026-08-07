"use server";

import { redirect } from "next/navigation";

import { magicLinkSchema } from "@/features/auth/auth.schema";
import type { MagicLinkState } from "@/features/auth/auth.types";
import { getAppOrigin } from "@/features/auth/auth-url";
import { createClient } from "@/lib/supabase/server";

const neutralSuccessMessage = "Ако адресата може да се најави, ќе добиеш безбеден линк по email.";

export async function requestMagicLink(
  _previousState: MagicLinkState,
  formData: FormData,
): Promise<MagicLinkState> {
  const parsed = magicLinkSchema.safeParse({ email: formData.get("email") });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Провери ја email адресата и обиди се повторно.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${getAppOrigin()}/auth/callback`,
      shouldCreateUser: true,
    },
  });

  if (error) console.error("auth_magic_link_request_failed", { code: error.code });

  return { status: "success", message: neutralSuccessMessage };
}

export async function signOut() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) console.error("auth_sign_out_failed", { code: error.code });
  redirect("/auth/sign-in");
}
