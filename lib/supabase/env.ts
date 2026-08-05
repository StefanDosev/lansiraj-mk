type SupabaseEnvironment = {
  url: string | undefined;
  publishableKey: string | undefined;
};

export type SupabaseConfig = {
  url: string;
  publishableKey: string;
};

export function validateSupabaseEnvironment({
  url,
  publishableKey,
}: SupabaseEnvironment): SupabaseConfig {
  if (!url?.trim()) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL.");
  }

  if (!publishableKey?.trim()) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.");
  }

  try {
    new URL(url);
  } catch {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL must be a valid URL.");
  }

  return {
    url,
    publishableKey,
  };
}

export function getSupabaseConfig(): SupabaseConfig {
  return validateSupabaseEnvironment({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
