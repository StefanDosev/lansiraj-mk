"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, type ReactNode } from "react";
import { completeOnboarding } from "@/features/onboarding/onboarding.actions";
import type { OnboardingField, OnboardingState, OnboardingValues } from "@/features/onboarding/onboarding.types";

type FormProps = { initialValues: OnboardingValues; minimumDate: string; maximumDate: string };
type FieldProps = { name: OnboardingField; label: string; help: string; error?: string; children: ReactNode };

const inputClass = "mt-2 w-full rounded-md border border-stone-300 bg-white px-3.5 py-3 text-ink placeholder:text-stone-600 focus:border-cobalt focus:outline-none focus:ring-3 focus:ring-cobalt/20 aria-invalid:border-coral aria-invalid:ring-coral/20";

function Field({ name, label, help, error, children }: FieldProps) {
  return <div><label htmlFor={name} className="text-sm font-semibold text-ink">{label}</label><p id={`${name}-help`} className="mt-1 text-sm leading-relaxed text-stone-700">{help}</p>{children}{error ? <p id={`${name}-error`} className="mt-2 text-sm font-medium text-ink">{error}</p> : null}</div>;
}

export function OnboardingForm({ initialValues, minimumDate, maximumDate }: FormProps) {
  const initialState: OnboardingState = { status: "idle", values: initialValues };
  const [state, action, pending] = useActionState(completeOnboarding, initialState);
  const errorSummaryRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (state.status === "error") errorSummaryRef.current?.focus();
  }, [state]);
  const error = (name: OnboardingField) => state.status === "error" ? state.fieldErrors?.[name]?.[0] : undefined;
  const describedBy = (name: OnboardingField) => error(name) ? `${name}-help ${name}-error` : `${name}-help`;

  return (
    <form action={action} className="space-y-8" noValidate>
      {state.status === "error" ? <div id="onboarding-error-summary" ref={errorSummaryRef} role="alert" tabIndex={-1} className="border-l-4 border-coral bg-stone-100 p-4 text-ink"><p className="font-semibold">Податоците не се зачувани</p><p className="mt-1 text-sm leading-relaxed">{state.message}</p></div> : null}
      <fieldset className="space-y-5">
        <legend className="font-display text-xl font-semibold text-ink">За тебе</legend>
        <Field name="displayName" label="Име за приказ" help="Името што ќе го гледа reviewer-от." error={error("displayName")}><input id="displayName" name="displayName" autoComplete="name" defaultValue={state.values.displayName} aria-invalid={Boolean(error("displayName"))} aria-describedby={describedBy("displayName")} className={inputClass} /></Field>
      </fieldset>
      <fieldset className="space-y-5 border-t-2 border-ink pt-8">
        <legend className="font-display text-xl font-semibold text-ink">Ограничи го проектот</legend>
        <Field name="projectTitle" label="Работен наслов" help="Кратко име за идејата; можеш да го подобриш подоцна." error={error("projectTitle")}><input id="projectTitle" name="projectTitle" defaultValue={state.values.projectTitle} aria-invalid={Boolean(error("projectTitle"))} aria-describedby={describedBy("projectTitle")} className={inputClass} /></Field>
        <Field name="targetUser" label="За кого е проектот?" help="Опиши еден конкретен тип корисник, не широка публика." error={error("targetUser")}><textarea id="targetUser" name="targetUser" rows={3} defaultValue={state.values.targetUser} aria-invalid={Boolean(error("targetUser"))} aria-describedby={describedBy("targetUser")} className={inputClass} /></Field>
        <Field name="problemStatement" label="Кој болен проблем го решава?" help="Опиши ја ситуацијата и зошто проблемот е важен за тој корисник." error={error("problemStatement")}><textarea id="problemStatement" name="problemStatement" rows={4} defaultValue={state.values.problemStatement} aria-invalid={Boolean(error("problemStatement"))} aria-describedby={describedBy("problemStatement")} className={inputClass} /></Field>
        <Field name="coreAction" label="Една главна акција" help="Што е единственото најважно нешто што корисникот ќе може да го направи?" error={error("coreAction")}><textarea id="coreAction" name="coreAction" rows={3} defaultValue={state.values.coreAction} aria-invalid={Boolean(error("coreAction"))} aria-describedby={describedBy("coreAction")} className={inputClass} /></Field>
        <Field name="nonFeatures" label="Што нема да градиш?" help="Напиши една non-feature по ред. Ова е твојата заштита од преголем scope." error={error("nonFeatures")}><textarea id="nonFeatures" name="nonFeatures" rows={5} defaultValue={state.values.nonFeatures} aria-invalid={Boolean(error("nonFeatures"))} aria-describedby={describedBy("nonFeatures")} className={inputClass} placeholder={"Мобилна апликација\nПлаќања\nChat"} /></Field>
      </fieldset>
      <fieldset className="space-y-5 border-t-2 border-ink pt-8">
        <legend className="font-display text-xl font-semibold text-ink">Време за работа</legend>
        <div className="grid gap-5 md:grid-cols-2">
          <Field name="weeklyHours" label="Часови неделно" help="Од 1 до 20; препорачани се 5–10." error={error("weeklyHours")}><input id="weeklyHours" name="weeklyHours" type="number" min="1" max="20" step="1" inputMode="numeric" defaultValue={state.values.weeklyHours} aria-invalid={Boolean(error("weeklyHours"))} aria-describedby={describedBy("weeklyHours")} className={inputClass} /></Field>
          <Field name="targetLaunchDate" label="Целен датум за лансирање" help="Избери реален датум во следните 12 недели." error={error("targetLaunchDate")}><input id="targetLaunchDate" name="targetLaunchDate" type="date" min={minimumDate} max={maximumDate} defaultValue={state.values.targetLaunchDate} aria-invalid={Boolean(error("targetLaunchDate"))} aria-describedby={describedBy("targetLaunchDate")} className={inputClass} /></Field>
        </div>
      </fieldset>
      <aside className="border-l-4 border-cobalt bg-stone-100 p-4 text-sm leading-relaxed text-stone-700"><h2 className="font-semibold text-ink">Пред да продолжиш</h2><p className="mt-2">Овие податоци ќе ги гледа Стефан за рачен преглед. Не внесувај лозинки, API keys, приватни tokens или лични податоци од интервјуирани лица.</p><Link className="mt-2 inline-flex min-h-11 items-center font-semibold text-cobalt underline decoration-2 underline-offset-4" href="/privacy">Како ги користиме и чуваме податоците</Link></aside>
      <button type="submit" disabled={pending} className="pressable inline-flex min-h-11 w-full items-center justify-center rounded-sm border-2 border-ink bg-launch px-5 py-2.5 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50 md:w-auto">{pending ? "Зачувуваме…" : "Зачувај и продолжи"}</button>
    </form>
  );
}
