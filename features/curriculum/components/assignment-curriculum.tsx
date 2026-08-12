import Link from "next/link";

import { CurriculumMarkdown } from "@/features/curriculum/components/curriculum-markdown";
import type { CurriculumAssignment } from "@/features/curriculum/curriculum.types";

const statePresentation: Record<
  CurriculumAssignment["state"],
  { label: string; className: string; description: string }
> = {
  locked: {
    label: "Заклучено",
    className: "border-stone-300 bg-stone-100 text-stone-700",
    description: "Содржината е видлива, но работата ќе стане достапна откако ќе биде одобрен претходниот доказ.",
  },
  available: {
    label: "Подготвено за работа",
    className: "border-ink bg-white text-ink",
    description: "Ова е тековната задача. Формата за доказ ќе биде додадена во следната фаза.",
  },
  submitted: {
    label: "На проверка",
    className: "border-cobalt bg-cobalt text-white",
    description: "Доказот е испратен и чека човечки преглед.",
  },
  revision_required: {
    label: "Потребна е 1 корекција",
    className: "border-coral bg-white text-ink",
    description: "Потребна е корекција пред повторно испраќање на доказот.",
  },
  approved: {
    label: "Одобрено — доказот е доволен",
    className: "border-ink bg-acid text-ink",
    description: "Оваа задача е одобрена.",
  },
};

type AssignmentCurriculumProps = {
  assignment: CurriculumAssignment;
};

export function AssignmentCurriculum({ assignment }: AssignmentCurriculumProps) {
  const state = statePresentation[assignment.state];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,46rem)_minmax(18rem,1fr)]">
      <article className="min-w-0 rounded-md border border-stone-300 bg-white p-5 md:p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">
          Фаза {String(assignment.stage.position).padStart(2, "0")} · {assignment.stage.title}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">
          {assignment.title}
        </h1>
        <p className="mt-3 text-sm font-semibold text-stone-700">
          Задача {String(assignment.position).padStart(2, "0")} · Патека {assignment.curriculumVersion}
        </p>

        <section className="mt-8 border-t border-stone-200 pt-6" aria-labelledby="assignment-guidance">
          <h2 id="assignment-guidance" className="font-display text-2xl font-semibold text-ink">
            Насоки за задачата
          </h2>
          <div className="mt-4">
            <CurriculumMarkdown>{assignment.bodyMarkdown}</CurriculumMarkdown>
          </div>
        </section>

        <section className="mt-8 border-t border-stone-200 pt-6" aria-labelledby="acceptance-criteria">
          <h2 id="acceptance-criteria" className="font-display text-2xl font-semibold text-ink">
            Критериуми за прифаќање
          </h2>
          <p className="mt-3 leading-relaxed text-stone-700">
            Рецензентот ќе го провери доказот според овие критериуми. Ова не се полиња за самостојно одобрување.
          </p>
          <ol className="mt-5 space-y-3">
            {assignment.acceptanceCriteria.map((item) => (
              <li key={item.id} className="flex gap-3 rounded-md border border-stone-300 p-4 text-stone-700">
                <span className="font-semibold tabular-nums text-ink" aria-hidden="true">
                  {String(item.position).padStart(2, "0")}
                </span>
                <span className="leading-relaxed">{item.criterion}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-8 border-t border-stone-200 pt-6" aria-labelledby="proof-requirement">
          <h2 id="proof-requirement" className="font-display text-2xl font-semibold text-ink">
            Потребен доказ
          </h2>
          <div className="mt-4">
            <CurriculumMarkdown>{assignment.proofPromptMarkdown}</CurriculumMarkdown>
          </div>
          <p className="mt-5 rounded-md border border-stone-300 bg-stone-100 p-4 text-sm leading-relaxed text-stone-700">
            Не внесувај API клучеви, лозинки, приватни токени или лични податоци од интервјуирани лица.
          </p>
        </section>
      </article>

      <aside className="rounded-md border border-stone-300 bg-stone-100 p-5 lg:sticky lg:top-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Состојба на задачата</p>
        <p className={`mt-4 rounded-sm border px-3 py-2 text-sm font-semibold ${state.className}`}>{state.label}</p>
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
