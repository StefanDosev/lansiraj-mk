"use client";

import { useActionState, useEffect, useRef, useState } from "react";

import {
  saveEvidenceDraft,
  submitEvidence,
} from "@/features/submissions/submissions.actions";
import {
  evidenceLinkTypeOptions,
  type EvidenceDraft,
  type EvidenceDraftLink,
  type EvidenceDraftState,
  type EvidenceSubmissionState,
} from "@/features/submissions/submissions.types";

const inputClass = "mt-2 w-full rounded-md border border-stone-300 bg-white px-3.5 py-3 text-ink placeholder:text-stone-600 focus:border-cobalt focus:outline-none focus:ring-3 focus:ring-cobalt/20 aria-invalid:border-coral aria-invalid:ring-coral/20";

type DraftLinkRow = EvidenceDraftLink & { key: number };

function withKeys(links: EvidenceDraftLink[], nextKey: { current: number }): DraftLinkRow[] {
  return links.map((link) => ({ ...link, key: nextKey.current++ }));
}

export function EvidenceDraftForm({ draft }: { draft: EvidenceDraft }) {
  const initialState: EvidenceDraftState = {
    status: "idle",
    values: {
      projectAssignmentId: draft.projectAssignmentId,
      evidenceText: draft.evidenceText,
      links: draft.links,
      expectedUpdatedAt: draft.expectedUpdatedAt,
    },
  };
  const initialSubmissionState: EvidenceSubmissionState = {
    status: "idle",
    values: {
      projectAssignmentId: draft.projectAssignmentId,
      expectedUpdatedAt: draft.expectedUpdatedAt,
      confirmation: "",
    },
  };
  const [state, saveAction, savePending] = useActionState(saveEvidenceDraft, initialState);
  const [submissionState, submitAction, submitPending] = useActionState(
    submitEvidence,
    initialSubmissionState,
  );
  const nextKey = useRef(draft.links.length);
  const [links, setLinks] = useState<DraftLinkRow[]>(() =>
    draft.links.map((link, index) => ({ ...link, key: index })),
  );
  const statusRef = useRef<HTMLDivElement>(null);
  const submissionStatusRef = useRef<HTMLDivElement>(null);
  const [dirty, setDirty] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (state.status !== "idle") {
      setLinks(withKeys(state.values.links, nextKey));
      setDirty(state.status !== "success");
      if (state.status === "success") setConfirmed(false);
      statusRef.current?.focus();
    }
  }, [state]);

  useEffect(() => {
    if (submissionState.status !== "idle") {
      submissionStatusRef.current?.focus();
    }
  }, [submissionState]);

  const updateLink = (key: number, field: keyof EvidenceDraftLink, value: string) => {
    setDirty(true);
    setLinks((current) => current.map((link) => link.key === key ? { ...link, [field]: value } : link));
  };

  const addLink = () => {
    if (links.length >= 10) return;
    setDirty(true);
    setLinks((current) => [
      ...current,
      { key: nextKey.current++, type: "research", label: "", url: "" },
    ]);
  };

  const hasSavedProof = state.values.evidenceText.trim().length > 0
    || state.values.links.length > 0;
  const readyToConfirm = Boolean(state.values.expectedUpdatedAt) && hasSavedProof && !dirty;

  return (
    <section className="mt-8 border-t border-stone-200 pt-6" aria-labelledby="evidence-draft-title">
      <h2 id="evidence-draft-title" className="font-display text-2xl font-semibold text-ink">
        Draft за доказ
      </h2>
      <p className="mt-3 leading-relaxed text-stone-700">
        Зачувај работен текст и линкови додека го подготвуваш доказот. Зачувувањето не го испраќа доказот на проверка.
      </p>

      <form action={saveAction} className="mt-6 space-y-6" noValidate>
        <input type="hidden" name="projectAssignmentId" value={state.values.projectAssignmentId} />
        <input type="hidden" name="expectedUpdatedAt" value={state.values.expectedUpdatedAt} />

        {state.status !== "idle" ? (
          <div
            ref={statusRef}
            role={state.status === "error" ? "alert" : "status"}
            tabIndex={-1}
            className={`rounded-md border bg-white p-4 text-ink ${state.status === "error" ? "border-coral" : "border-cobalt"}`}
          >
            <p className="font-semibold">{state.status === "error" ? "Draft-от не е зачуван" : "Зачувано"}</p>
            <p className="mt-1 text-sm leading-relaxed">{state.message}</p>
          </div>
        ) : null}

        <div>
          <label htmlFor="evidenceText" className="text-sm font-semibold text-ink">Текстуален доказ</label>
          <p id="evidenceText-help" className="mt-1 text-sm leading-relaxed text-stone-700">
            Запиши што направи, што научи и каде доказот ги исполнува критериумите. Може да го оставиш празно додека работиш.
          </p>
          <textarea
            id="evidenceText"
            name="evidenceText"
            rows={9}
            maxLength={10000}
            defaultValue={state.values.evidenceText}
            onChange={() => setDirty(true)}
            aria-invalid={Boolean(state.status === "error" && state.fieldErrors?.evidenceText)}
            aria-describedby={state.status === "error" && state.fieldErrors?.evidenceText ? "evidenceText-help evidenceText-error" : "evidenceText-help"}
            className={inputClass}
          />
          {state.status === "error" && state.fieldErrors?.evidenceText ? (
            <p id="evidenceText-error" className="mt-2 text-sm font-medium text-ink">{state.fieldErrors.evidenceText[0]}</p>
          ) : null}
        </div>

        <fieldset className="space-y-4 border-t border-stone-200 pt-6">
          <legend className="font-display text-xl font-semibold text-ink">Линкови за доказ</legend>
          <p className="text-sm leading-relaxed text-stone-700">
            Додај до 10 јавни или безбедно споделени HTTPS линкови. Секој ред мора да има вид, ознака и URL.
          </p>

          {links.length === 0 ? (
            <p className="rounded-md border border-stone-300 bg-stone-100 p-4 text-sm leading-relaxed text-stone-700">
              Сè уште нема додадени линкови. Линковите се изборни за draft.
            </p>
          ) : null}

          {links.map((link, index) => {
            const errors = state.status === "error" ? state.fieldErrors?.links?.[index] : undefined;
            const prefix = `evidence-link-${index}`;
            return (
              <fieldset key={link.key} className="rounded-md border border-stone-300 p-4">
                <legend className="px-1 text-sm font-semibold text-ink">Линк {index + 1}</legend>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor={`${prefix}-type`} className="text-sm font-semibold text-ink">Вид</label>
                    <select id={`${prefix}-type`} name="linkType" value={link.type} onChange={(event) => updateLink(link.key, "type", event.target.value)} aria-invalid={Boolean(errors?.type)} aria-describedby={errors?.type ? `${prefix}-type-error` : undefined} className={inputClass}>
                      {evidenceLinkTypeOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                    {errors?.type ? <p id={`${prefix}-type-error`} className="mt-2 text-sm font-medium text-ink">{errors.type[0]}</p> : null}
                  </div>
                  <div>
                    <label htmlFor={`${prefix}-label`} className="text-sm font-semibold text-ink">Ознака</label>
                    <input id={`${prefix}-label`} name="linkLabel" value={link.label} onChange={(event) => updateLink(link.key, "label", event.target.value)} maxLength={80} aria-invalid={Boolean(errors?.label)} aria-describedby={errors?.label ? `${prefix}-label-error` : undefined} className={inputClass} placeholder="Пр. Белешки од интервјуа" />
                    {errors?.label ? <p id={`${prefix}-label-error`} className="mt-2 text-sm font-medium text-ink">{errors.label[0]}</p> : null}
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor={`${prefix}-url`} className="text-sm font-semibold text-ink">HTTPS URL</label>
                  <input id={`${prefix}-url`} name="linkUrl" type="url" inputMode="url" value={link.url} onChange={(event) => updateLink(link.key, "url", event.target.value)} maxLength={2048} aria-invalid={Boolean(errors?.url)} aria-describedby={errors?.url ? `${prefix}-url-error` : undefined} className={inputClass} placeholder="https://…" />
                  {errors?.url ? <p id={`${prefix}-url-error`} className="mt-2 text-sm font-medium text-ink">{errors.url[0]}</p> : null}
                </div>
                <button type="button" onClick={() => { setDirty(true); setLinks((current) => current.filter((item) => item.key !== link.key)); }} className="mt-4 inline-flex min-h-11 items-center rounded-sm border-2 border-ink px-4 py-2 font-semibold text-ink hover:bg-stone-100">
                  Отстрани линк {index + 1}
                </button>
              </fieldset>
            );
          })}

          <button type="button" onClick={addLink} disabled={links.length >= 10} className="inline-flex min-h-11 items-center rounded-sm border-2 border-ink px-4 py-2 font-semibold text-ink hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50">
            Додај линк
          </button>
        </fieldset>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <button type="submit" disabled={savePending || submitPending} className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border-2 border-ink bg-launch px-5 py-2.5 font-semibold text-ink transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none md:w-auto">
            {savePending ? "Зачувуваме…" : "Зачувај draft"}
          </button>
          {dirty ? (
            <p className="text-sm font-semibold text-ink" role="status">Има незачувани промени.</p>
          ) : null}
        </div>
      </form>

      <section className="mt-8 rounded-md border-2 border-cobalt bg-canvas p-5" aria-labelledby="submit-evidence-title">
        <h3 id="submit-evidence-title" className="font-display text-xl font-semibold text-ink">
          Испрати на проверка
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink">
          Се испраќа само последната зачувана верзија. Текстот и линковите ќе се замрзнат додека човечки рецензент не донесе одлука.
        </p>

        {submissionState.status !== "idle" ? (
          <div
            ref={submissionStatusRef}
            role={submissionState.status === "error" ? "alert" : "status"}
            tabIndex={-1}
            className={`mt-4 rounded-md border bg-canvas p-4 text-ink ${submissionState.status === "error" ? "border-coral" : "border-cobalt"}`}
          >
            <p className="font-semibold">{submissionState.status === "error" ? "Доказот не е испратен" : "Испратено"}</p>
            <p className="mt-1 text-sm leading-relaxed">{submissionState.message}</p>
          </div>
        ) : null}

        {!state.values.expectedUpdatedAt ? (
          <p className="mt-4 text-sm font-semibold text-ink">Прво зачувај го draft-от.</p>
        ) : !hasSavedProof ? (
          <p className="mt-4 text-sm font-semibold text-ink">За испраќање е потребен текстуален доказ, барем еден линк, или и двете.</p>
        ) : dirty ? (
          <p className="mt-4 text-sm font-semibold text-ink">Зачувај ги тековните промени пред испраќање.</p>
        ) : null}

        <form action={submitAction} className="mt-5 space-y-4" noValidate>
          <input type="hidden" name="projectAssignmentId" value={state.values.projectAssignmentId} />
          <input type="hidden" name="expectedUpdatedAt" value={state.values.expectedUpdatedAt} />
          <label className="flex min-h-11 items-start gap-3 text-sm font-semibold leading-relaxed text-ink">
            <input
              type="checkbox"
              name="confirmation"
              value="confirmed"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              disabled={!readyToConfirm || savePending || submitPending}
              className="mt-1 size-5 shrink-0 accent-cobalt"
            />
            Разбирам дека доказот ќе се замрзне и ќе биде испратен на човечка проверка.
          </label>
          <button
            type="submit"
            disabled={!readyToConfirm || !confirmed || savePending || submitPending}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-sm border-2 border-ink bg-cobalt px-5 py-2.5 font-semibold text-canvas transition-transform hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transform-none md:w-auto"
          >
            {submitPending ? "Испраќаме…" : "Испрати доказ"}
          </button>
        </form>
      </section>
    </section>
  );
}
