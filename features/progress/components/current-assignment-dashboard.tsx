import Link from "next/link";

import { CurriculumMarkdown } from "@/features/curriculum/components/curriculum-markdown";
import type { CurrentAssignmentDashboard as DashboardModel } from "@/features/progress/dashboard.types";

type CurrentAssignmentDashboardProps = {
  projectTitle: string;
  curriculumVersion: string;
  dashboard: DashboardModel;
};

export function CurrentAssignmentDashboard({
  projectTitle,
  curriculumVersion,
  dashboard,
}: CurrentAssignmentDashboardProps) {
  if (dashboard.kind === "empty") {
    return <DashboardTerminal title="Патеката не е подготвена" message="Во активниот проект нема задачи. Обиди се повторно или побарај помош." />;
  }

  if (dashboard.kind === "complete") {
    return <DashboardTerminal title="Сите задачи се одобрени" message="Патеката е завршена со прифатен доказ за секој чекор." />;
  }

  if (dashboard.kind === "locked") {
    return (
      <DashboardTerminal
        title={dashboard.statusLabel}
        message={dashboard.unlockCondition}
        meta={`Задача ${String(dashboard.assignment.position).padStart(2, "0")} · ${dashboard.assignment.title}`}
      />
    );
  }

  const statusClass = {
    available: "border-ink bg-white text-ink",
    submitted: "border-cobalt bg-cobalt text-white",
    revision_required: "border-coral bg-white text-ink",
  }[dashboard.state];

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,46rem)_minmax(18rem,1fr)]">
      <section className="rounded-md border border-stone-300 bg-white p-5 md:p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">
          Фаза {String(dashboard.assignment.stage.position).padStart(2, "0")} · {dashboard.assignment.stage.title}
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">{dashboard.assignment.title}</h1>
        <p className="mt-3 text-sm font-semibold text-stone-700">{projectTitle} · Задача {String(dashboard.assignment.position).padStart(2, "0")}</p>

        <div className={`mt-6 rounded-sm border px-3 py-2 text-sm font-semibold ${statusClass}`}>{dashboard.statusLabel}</div>
        <p className="mt-4 leading-relaxed text-stone-700">{dashboard.statusDescription}</p>

        <section className="mt-8 border-t border-stone-200 pt-6" aria-labelledby="dashboard-proof">
          <h2 id="dashboard-proof" className="font-display text-xl font-semibold text-ink">Потребен доказ</h2>
          <div className="mt-4"><CurriculumMarkdown>{dashboard.assignment.proofPromptMarkdown}</CurriculumMarkdown></div>
        </section>

        <section className="mt-8 rounded-md border border-stone-300 bg-stone-100 p-4" aria-labelledby="dashboard-feedback">
          <h2 id="dashboard-feedback" className="font-display text-lg font-semibold text-ink">Последна повратна информација</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">{dashboard.feedbackMessage}</p>
        </section>

        <Link className="mt-6 inline-flex min-h-11 items-center justify-center rounded-sm border-2 border-ink bg-launch px-5 py-2.5 font-semibold text-ink transition-transform hover:-translate-y-0.5 motion-reduce:transform-none" href={`/app/assignments/${dashboard.assignment.slug}`}>
          {dashboard.actionLabel}
        </Link>
      </section>

      <aside className="rounded-md border border-stone-300 bg-stone-100 p-5 lg:sticky lg:top-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Патека {curriculumVersion}</p>
        <p className="mt-3 font-display text-2xl font-semibold text-ink">{dashboard.progress.approved} од {dashboard.progress.total} задачи се одобрени</p>
        <div className="mt-6 border-t border-stone-200 pt-5">
          <h2 className="font-display text-lg font-semibold text-ink">Точен услов за следниот чекор</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-700">{dashboard.unlockCondition}</p>
        </div>
      </aside>
    </div>
  );
}

function DashboardTerminal({ title, message, meta }: { title: string; message: string; meta?: string }) {
  return (
    <section className="mx-auto max-w-3xl rounded-md border border-stone-300 bg-white p-5 md:p-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Тековна задача</p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink">{title}</h1>
      {meta ? <p className="mt-3 text-sm font-semibold text-stone-700">{meta}</p> : null}
      <p className="mt-4 text-lg leading-relaxed text-stone-700">{message}</p>
      <Link className="mt-6 inline-flex min-h-11 items-center font-semibold text-cobalt underline decoration-2 underline-offset-4" href="/app/project">Провери го проектот</Link>
    </section>
  );
}
