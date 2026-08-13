"use client";

import { useActionState } from "react";

import { requestMagicLink } from "@/features/auth/auth.actions";
import { initialMagicLinkState } from "@/features/auth/auth.types";

export function MagicLinkForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initialMagicLinkState);
  const emailError = state.status === "error" ? state.fieldErrors?.email?.[0] : undefined;

  return (
    <form action={action} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="text-sm font-semibold text-ink">
          Email адреса
        </label>
        <p id="email-help" className="mt-1 text-sm leading-relaxed text-stone-700">
          Ќе испратиме еднократен линк. Не е потребна лозинка.
        </p>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-describedby={emailError ? "email-help email-error" : "email-help"}
          aria-invalid={Boolean(emailError)}
          className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3.5 py-3 text-ink placeholder:text-stone-600 focus:border-cobalt focus:outline-none focus:ring-3 focus:ring-cobalt/20 aria-invalid:border-coral aria-invalid:ring-coral/20"
          placeholder="ime@primer.mk"
        />
        {emailError ? (
          <p id="email-error" className="mt-2 text-sm font-medium text-ink">
            {emailError}
          </p>
        ) : null}
      </div>

      <button
        type="submit"
        disabled={pending}
        className="pressable inline-flex min-h-11 w-full items-center justify-center rounded-sm border-2 border-ink bg-launch px-5 py-2.5 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Испраќаме…" : "Испрати magic link"}
      </button>

      <p aria-live="polite" className="min-h-6 text-sm leading-relaxed text-stone-700">
        {state.status === "idle" ? "" : state.message}
      </p>
    </form>
  );
}
