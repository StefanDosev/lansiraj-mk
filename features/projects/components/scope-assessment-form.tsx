"use client";

import { useActionState, useEffect, useRef } from "react";
import { assessProjectScope } from "@/features/projects/projects.actions";
import type { ProjectScopeAssessment, ScopeAssessmentState } from "@/features/projects/projects.types";

export function ScopeAssessmentForm({ projectId, assessment }: { projectId: string; assessment: ProjectScopeAssessment | null }) {
  const initialState: ScopeAssessmentState = { status: "idle", values: { projectId, readiness: assessment?.readiness ?? "ready", note: assessment?.note ?? "" } };
  const [state, action, pending] = useActionState(assessProjectScope, initialState);
  const statusRef = useRef<HTMLDivElement>(null);
  useEffect(() => { if (state.status === "error") statusRef.current?.focus(); }, [state.status]);
  const readinessError = state.status === "error" ? state.fieldErrors?.readiness?.[0] : undefined;
  const noteError = state.status === "error" ? state.fieldErrors?.note?.[0] : undefined;

  return (
    <form action={action} className="border-2 border-ink bg-ink p-5 proof-shadow md:p-6" noValidate>
      <input type="hidden" name="projectId" value={projectId} />
      <h2 className="font-display text-xl font-semibold text-white">Процени го опсегот</h2>
      <p className="mt-2 text-sm leading-relaxed text-stone-300">Последната проценка го заменува тековниот статус.</p>
      {state.status !== "idle" ? <div ref={statusRef} role={state.status === "error" ? "alert" : "status"} tabIndex={state.status === "error" ? -1 : undefined} className={`mt-5 border-l-4 bg-stone-900 p-4 text-sm ${state.status === "error" ? "border-coral text-white" : "border-acid text-white"}`}>{state.message}</div> : null}
      <fieldset className="mt-6 space-y-3">
        <legend className="font-semibold text-white">Одлука</legend>
        {(["ready", "needs_reduction"] as const).map((readiness) => <label key={readiness} className="flex min-h-11 cursor-pointer items-center gap-3 border border-stone-700 px-4 py-3 text-white has-checked:border-acid has-checked:bg-stone-900"><input type="radio" name="readiness" value={readiness} defaultChecked={state.values.readiness === readiness} className="h-5 w-5 accent-acid" /><span>{readiness === "ready" ? "Подготвен опсег" : "Потребно е намалување"}</span></label>)}
        {readinessError ? <p className="text-sm text-white">{readinessError}</p> : null}
      </fieldset>
      <div className="mt-6">
        <label htmlFor="scope-note" className="font-semibold text-white">Белешка</label>
        <p id="scope-note-help" className="mt-1 text-sm leading-relaxed text-stone-300">Задолжителна е кога бараш намалување; најмногу 600 знаци.</p>
        <textarea id="scope-note" name="note" rows={5} maxLength={600} defaultValue={state.values.note} aria-invalid={Boolean(noteError)} aria-describedby={noteError ? "scope-note-help scope-note-error" : "scope-note-help"} className="mt-2 w-full rounded-md border border-stone-700 bg-white px-3.5 py-3 text-ink focus:border-cobalt focus:outline-none focus:ring-3 focus:ring-cobalt/30 aria-invalid:border-coral" />
        {noteError ? <p id="scope-note-error" className="mt-2 text-sm text-white">{noteError}</p> : null}
      </div>
      <button type="submit" disabled={pending} className="pressable mt-6 inline-flex min-h-11 items-center justify-center rounded-sm border-2 border-white bg-acid px-5 py-2.5 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Зачувуваме…" : "Зачувај проценка"}</button>
    </form>
  );
}
