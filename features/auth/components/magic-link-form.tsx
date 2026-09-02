"use client";

import Script from "next/script";
import { useActionState, useCallback, useEffect, useRef, useState } from "react";

import { requestMagicLink } from "@/features/auth/auth.actions";
import { initialMagicLinkState } from "@/features/auth/auth.types";

type TurnstileOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  theme: "light";
};

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_READY_RETRY_MS = 250;
const TURNSTILE_READY_ATTEMPTS = 40;

export function MagicLinkForm() {
  const [state, action, pending] = useActionState(requestMagicLink, initialMagicLinkState);
  const [captchaToken, setCaptchaToken] = useState("");
  const [challengeFailed, setChallengeFailed] = useState(false);
  const challengeRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  const emailError = state.status === "error" ? state.fieldErrors?.email?.[0] : undefined;

  const renderChallenge = useCallback(() => {
    if (!siteKey || !challengeRef.current || !window.turnstile || widgetIdRef.current) return;

    widgetIdRef.current = window.turnstile.render(challengeRef.current, {
      sitekey: siteKey,
      callback: (token) => {
        setCaptchaToken(token);
        setChallengeFailed(false);
      },
      "expired-callback": () => setCaptchaToken(""),
      "error-callback": () => {
        setCaptchaToken("");
        setChallengeFailed(true);
      },
      theme: "light",
    });
  }, [siteKey]);

  useEffect(() => {
    if (!siteKey) return;

    let cancelled = false;
    let attempts = 0;
    let retryId: number | undefined;

    const renderWhenReady = () => {
      if (cancelled || widgetIdRef.current) return;

      if (challengeRef.current && window.turnstile) {
        renderChallenge();
        return;
      }

      attempts += 1;
      if (attempts >= TURNSTILE_READY_ATTEMPTS) {
        setChallengeFailed(true);
        return;
      }

      retryId = window.setTimeout(renderWhenReady, TURNSTILE_READY_RETRY_MS);
    };

    renderWhenReady();

    return () => {
      cancelled = true;
      if (retryId !== undefined) window.clearTimeout(retryId);

      const widgetId = widgetIdRef.current;
      if (widgetId && window.turnstile) {
        window.turnstile.remove(widgetId);
        widgetIdRef.current = null;
      }
    };
  }, [renderChallenge, siteKey]);

  useEffect(() => {
    if (state.status === "idle" || !widgetIdRef.current || !window.turnstile) return;
    window.turnstile.reset(widgetIdRef.current);
    setCaptchaToken("");
  }, [state]);

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

      <input name="captchaToken" type="hidden" value={captchaToken} />
      {siteKey ? (
        <>
          <div
            ref={challengeRef}
            aria-label="Безбедносна проверка"
            className="min-h-16 overflow-hidden"
          />
          <Script
            id="cloudflare-turnstile"
            src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
            strategy="afterInteractive"
            onReady={() => {
              setChallengeFailed(false);
              renderChallenge();
            }}
            onError={() => setChallengeFailed(true)}
          />
        </>
      ) : (
        <p role="alert" className="text-sm leading-relaxed text-ink">
          Безбедносната проверка моментално не е достапна.
        </p>
      )}
      {challengeFailed ? (
        <p role="alert" className="text-sm leading-relaxed text-ink">
          Безбедносната проверка не се вчита. Освежи ја страницата и обиди се повторно.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending || !captchaToken}
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
