"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import { submitReviewDecision } from "@/features/reviews/reviews.actions";
import type {
  ReviewCriterionOutcome,
  ReviewDecision,
  ReviewSubmissionState,
  ReviewerAcceptanceCriterion,
} from "@/features/reviews/reviews.types";

const inputClass =
  "mt-2 w-full rounded-md border border-stone-300 bg-white px-3.5 py-3 text-ink placeholder:text-stone-600 focus:border-cobalt focus:outline-none focus:ring-3 focus:ring-cobalt/20 aria-invalid:border-coral aria-invalid:ring-coral/20";

type ReviewDecisionFormProps = {
  submissionId: string;
  version: number;
  criteria: ReviewerAcceptanceCriterion[];
};

export function ReviewDecisionForm({
  submissionId,
  version,
  criteria,
}: ReviewDecisionFormProps) {
  const initialState: ReviewSubmissionState = {
    status: "idle",
    values: {
      submissionId,
      decision: "",
      summary: "",
      priorityCorrection: "",
      confirmation: "",
      criteria: criteria.map((criterion) => ({
        criterionId: criterion.id,
        outcome: "",
        note: "",
      })),
    },
  };
  const [state, action, pending] = useActionState(submitReviewDecision, initialState);
  const [decision, setDecision] = useState<ReviewDecision | "">(state.values.decision);
  const [outcomes, setOutcomes] = useState<Record<string, ReviewCriterionOutcome | "">>(
    () => Object.fromEntries(state.values.criteria.map((criterion) => [criterion.criterionId, criterion.outcome])),
  );
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state.status === "error") {
      statusRef.current?.focus();
    }
  }, [state]);

  const fieldError = (field: "decision" | "summary" | "priorityCorrection" | "confirmation") =>
    state.status === "error" ? state.fieldErrors?.[field]?.[0] : undefined;

  return (
    <section className="mt-12 border-t-2 border-ink pt-8" aria-labelledby="review-decision-title">
      <p className="text-xs font-semibold uppercase tracking-widest text-cobalt">Човечка одлука</p>
      <h2 id="review-decision-title" className="mt-3 font-display text-3xl font-semibold text-ink">
        Прегледај ја верзија {version}
      </h2>
      <p className="mt-3 max-w-3xl leading-relaxed text-stone-700">
        Оцени го секој критериум. Одобрувањето ја отклучува следната задача, а барањето ревизија ја враќа оваа задача со конкретни насоки.
      </p>

      <form action={action} className="mt-7 space-y-9" noValidate>
        <input type="hidden" name="submissionId" value={submissionId} />

        {state.status === "error" ? (
          <div
            ref={statusRef}
            role="alert"
            tabIndex={-1}
            className="border-l-4 border-coral bg-stone-100 p-4 text-ink"
          >
            <p className="font-semibold">Одлуката не е зачувана</p>
            <p className="mt-1 text-sm leading-relaxed">{state.message}</p>
          </div>
        ) : null}

        <fieldset>
          <legend className="font-display text-2xl font-semibold text-ink">Критериуми за прифаќање</legend>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Секој критериум мора да има исход. Белешка е задолжителна кога е потребна корекција.
          </p>

          <ol className="mt-6 divide-y divide-stone-300 border-y-2 border-ink">
            {criteria.map((criterion, index) => {
              const errors = state.status === "error" ? state.fieldErrors?.criteria?.[index] : undefined;
              const savedValue = state.values.criteria[index];
              const prefix = `review-criterion-${criterion.id}`;

              return (
                <li key={criterion.id} className="py-6">
                  <input type="hidden" name="criterionId" value={criterion.id} />
                  <fieldset aria-describedby={errors?.outcome ? `${prefix}-outcome-error` : undefined}>
                    <legend className="max-w-3xl font-semibold leading-relaxed text-ink">
                      <span className="mr-2 text-cobalt">{criterion.position}.</span>
                      {criterion.criterion}
                    </legend>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {([
                        ["pass", "Исполнето", "Доказот го исполнува критериумот."],
                        ["revise", "Потребна корекција", "Ученикот треба да го подобри овој дел."],
                      ] as const).map(([value, label, description]) => (
                        <label key={value} className="flex min-h-11 cursor-pointer items-start gap-3 border border-stone-300 bg-white p-4 has-checked:border-cobalt has-checked:ring-2 has-checked:ring-cobalt/20">
                          <input
                            type="radio"
                            name={`criterionOutcome:${criterion.id}`}
                            value={value}
                            checked={outcomes[criterion.id] === value}
                            onChange={() => setOutcomes((current) => ({ ...current, [criterion.id]: value }))}
                            className="mt-1 size-5 shrink-0 accent-cobalt"
                          />
                          <span>
                            <span className="block font-semibold text-ink">{label}</span>
                            <span className="mt-1 block text-sm leading-relaxed text-stone-700">{description}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors?.outcome ? (
                      <p id={`${prefix}-outcome-error`} className="mt-2 text-sm font-medium text-ink">{errors.outcome[0]}</p>
                    ) : null}
                  </fieldset>

                  <label htmlFor={`${prefix}-note`} className="mt-5 block text-sm font-semibold text-ink">
                    Белешка за критериумот
                  </label>
                  <p id={`${prefix}-note-help`} className="mt-1 text-sm leading-relaxed text-stone-700">
                    Задолжителна за корекција; изборна кога критериумот е исполнет.
                  </p>
                  <textarea
                    id={`${prefix}-note`}
                    name={`criterionNote:${criterion.id}`}
                    rows={3}
                    maxLength={2000}
                    defaultValue={savedValue?.note ?? ""}
                    aria-invalid={Boolean(errors?.note)}
                    aria-describedby={errors?.note ? `${prefix}-note-help ${prefix}-note-error` : `${prefix}-note-help`}
                    className={inputClass}
                  />
                  {errors?.note ? (
                    <p id={`${prefix}-note-error`} className="mt-2 text-sm font-medium text-ink">{errors.note[0]}</p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </fieldset>

        <fieldset className="border-2 border-cobalt bg-canvas p-5 md:p-7">
          <legend className="px-2 font-display text-2xl font-semibold text-ink">Конечна одлука</legend>
          <div className="mt-3 grid gap-3 sm:grid-cols-2" aria-describedby={fieldError("decision") ? "review-decision-error" : undefined}>
            {([
              ["approved", "Одобри", "Сите критериуми мора да бидат исполнети."],
              ["revision_required", "Побарај ревизија", "Најмалку еден критериум бара корекција."],
            ] as const).map(([value, label, description]) => (
              <label key={value} className="flex min-h-11 cursor-pointer items-start gap-3 border border-stone-300 bg-white p-4 has-checked:border-cobalt has-checked:ring-2 has-checked:ring-cobalt/20">
                <input
                  type="radio"
                  name="decision"
                  value={value}
                  checked={decision === value}
                  onChange={() => setDecision(value)}
                  className="mt-1 size-5 shrink-0 accent-cobalt"
                />
                <span>
                  <span className="block font-semibold text-ink">{label}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-stone-700">{description}</span>
                </span>
              </label>
            ))}
          </div>
          {fieldError("decision") ? <p id="review-decision-error" className="mt-2 text-sm font-medium text-ink">{fieldError("decision")}</p> : null}

          <label htmlFor="review-summary" className="mt-6 block text-sm font-semibold text-ink">Резиме за ученикот</label>
          <p id="review-summary-help" className="mt-1 text-sm leading-relaxed text-stone-700">Кратко објасни ја одлуката и следниот чекор.</p>
          <textarea id="review-summary" name="summary" rows={5} maxLength={3000} defaultValue={state.values.summary} aria-invalid={Boolean(fieldError("summary"))} aria-describedby={fieldError("summary") ? "review-summary-help review-summary-error" : "review-summary-help"} className={inputClass} />
          {fieldError("summary") ? <p id="review-summary-error" className="mt-2 text-sm font-medium text-ink">{fieldError("summary")}</p> : null}

          <div className={decision === "revision_required" ? "mt-6" : "mt-6 opacity-60"}>
            <label htmlFor="priority-correction" className="block text-sm font-semibold text-ink">Најважна корекција</label>
            <p id="priority-correction-help" className="mt-1 text-sm leading-relaxed text-stone-700">Задолжителна само кога бараш ревизија.</p>
            <textarea id="priority-correction" name="priorityCorrection" rows={3} maxLength={2000} defaultValue={state.values.priorityCorrection} disabled={decision === "approved"} aria-invalid={Boolean(fieldError("priorityCorrection"))} aria-describedby={fieldError("priorityCorrection") ? "priority-correction-help priority-correction-error" : "priority-correction-help"} className={inputClass} />
            {fieldError("priorityCorrection") ? <p id="priority-correction-error" className="mt-2 text-sm font-medium text-ink">{fieldError("priorityCorrection")}</p> : null}
          </div>

          <label className="mt-6 flex min-h-11 items-start gap-3 text-sm font-semibold leading-relaxed text-ink">
            <input type="checkbox" name="confirmation" value="confirmed" defaultChecked={state.values.confirmation === "confirmed"} className="mt-1 size-5 shrink-0 accent-cobalt" />
            Потврдувам дека одлуката е конечна и се однесува на верзија {version}.
          </label>
          {fieldError("confirmation") ? <p className="mt-2 text-sm font-medium text-ink">{fieldError("confirmation")}</p> : null}

          <button type="submit" disabled={pending} className="pressable mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-sm border-2 border-ink bg-launch px-5 py-3 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto">
            {pending ? "Ја зачувуваме одлуката…" : "Зачувај конечна одлука"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
