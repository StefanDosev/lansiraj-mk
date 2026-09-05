import Link from "next/link";
import type { ReactNode } from "react";

import { StatusMarker } from "@/components/ui/status-marker";
import { CurriculumMarkdown } from "@/features/curriculum/components/curriculum-markdown";
import type { CurriculumAssignment } from "@/features/curriculum/curriculum.types";

const statePresentation: Record<
  CurriculumAssignment["state"],
  { label: string; tone: "neutral" | "active" | "revision" | "approved"; description: string }
> = {
  locked: {
    label: "Заклучено",
    tone: "neutral",
    description: "Содржината е видлива, но работата ќе стане достапна откако ќе биде одобрен претходниот доказ.",
  },
  available: {
    label: "Подготвено за работа",
    tone: "neutral",
    description: "Ова е тековната задача. Подготви го и зачувај го draft-от за доказ подолу.",
  },
  submitted: {
    label: "На проверка",
    tone: "active",
    description: "Доказот е испратен и чека човечки преглед.",
  },
  revision_required: {
    label: "Потребна е 1 корекција",
    tone: "revision",
    description: "Потребна е корекција пред повторно испраќање на доказот.",
  },
  approved: {
    label: "Одобрено — доказот е доволен",
    tone: "approved",
    description: "Оваа задача е одобрена.",
  },
};

type AssignmentCurriculumProps = {
  assignment: CurriculumAssignment;
  approvalCheckpoint?: ReactNode;
  revisionFeedback?: ReactNode;
  evidenceEditor?: ReactNode;
  submissionHistory?: ReactNode;
};

export function AssignmentCurriculum({
  assignment,
  approvalCheckpoint,
  revisionFeedback,
  evidenceEditor,
  submissionHistory,
}: AssignmentCurriculumProps) {
  const state = statePresentation[assignment.state];

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,46rem)_minmax(18rem,1fr)]">
      <article className="min-w-0 bg-white p-5 md:p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">
          Фаза {String(assignment.stage.position).padStart(2, "0")} · {assignment.stage.title}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.04] text-ink md:text-5xl">
          {assignment.title}
        </h1>
        <p className="mt-3 text-sm font-semibold text-stone-700">
          Задача {String(assignment.position).padStart(2, "0")} · Патека {assignment.curriculumVersion}
        </p>

        <section className="mt-8 border-t-2 border-ink pt-7" aria-labelledby="assignment-guidance">
          <h2 id="assignment-guidance" className="font-display text-2xl font-semibold text-ink">
            Насоки за задачата
          </h2>
          <div className="mt-4">
            <CurriculumMarkdown>{assignment.bodyMarkdown}</CurriculumMarkdown>
          </div>
        </section>

        <section className="mt-10 border-t-2 border-ink pt-7" aria-labelledby="acceptance-criteria">
          <h2 id="acceptance-criteria" className="font-display text-2xl font-semibold text-ink">
            Критериуми за прифаќање
          </h2>
          <p className="mt-3 leading-relaxed text-stone-700">
            Рецензентот ќе го провери доказот според овие критериуми. Ова не се полиња за самостојно одобрување.
          </p>
          <ol className="mt-5 border-y border-stone-300">
            {assignment.acceptanceCriteria.map((item) => (
              <li key={item.id} className="grid gap-3 border-b border-stone-300 py-4 text-stone-700 last:border-b-0 sm:grid-cols-[3rem_1fr]">
                <span className="font-display text-lg font-semibold tabular-nums text-cobalt" aria-hidden="true">
                  {String(item.position).padStart(2, "0")}
                </span>
                <span className="leading-relaxed">{item.criterion}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 border-2 border-ink bg-launch p-5 proof-shadow md:p-6" aria-labelledby="proof-requirement">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">Evidence request</p>
          <h2 id="proof-requirement" className="font-display text-2xl font-semibold text-ink">
            Потребен доказ
          </h2>
          <div className="mt-4">
            <CurriculumMarkdown>{assignment.proofPromptMarkdown}</CurriculumMarkdown>
          </div>
          <p className="mt-5 border-t border-ink pt-4 text-sm leading-relaxed text-ink">
            Не внесувај API клучеви, лозинки, приватни токени или лични податоци од интервјуирани лица.{" "}
            <Link className="inline-flex min-h-11 items-center font-semibold text-cobalt underline decoration-2 underline-offset-4" href="/privacy">
              Прочитај го известувањето за приватност
            </Link>.
          </p>
        </section>

        {approvalCheckpoint}
        {revisionFeedback}
        {evidenceEditor}
        {submissionHistory}
      </article>

      <aside className="border-2 border-ink bg-stone-100 p-5 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Состојба на задачата</p>
        <div className="mt-4"><StatusMarker label={state.label} tone={state.tone} /></div>
        <p className="mt-4 text-sm leading-relaxed text-stone-700">{state.description}</p>
        <div className="mt-6 border-t border-stone-200 pt-5">
          <h2 className="font-display text-lg font-semibold text-ink">За оваа фаза</h2>
          <div className="mt-3 text-sm">
            <CurriculumMarkdown>{assignment.stage.summaryMarkdown}</CurriculumMarkdown>
          </div>
        </div>
        <Link className="mt-6 inline-flex min-h-11 items-center font-semibold text-cobalt underline decoration-2 underline-offset-4" href="/app">
          Назад кон тековната задача
        </Link>
      </aside>
    </div>
  );
}
