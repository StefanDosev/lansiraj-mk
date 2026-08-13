import Link from "next/link";

import { StatusMarker } from "@/components/ui/status-marker";
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

  const statusTone = {
    available: "neutral",
    submitted: "active",
    revision_required: "revision",
  } as const;
  const currentStatusTone = statusTone[dashboard.state];

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,46rem)_minmax(18rem,1fr)]">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">
          Фаза {String(dashboard.assignment.stage.position).padStart(2, "0")} · {dashboard.assignment.stage.title}
        </p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.04] text-ink md:text-5xl">{dashboard.assignment.title}</h1>
        <p className="mt-3 text-sm font-semibold text-stone-700">{projectTitle} · Задача {String(dashboard.assignment.position).padStart(2, "0")}</p>

        <div className="mt-6"><StatusMarker label={dashboard.statusLabel} tone={currentStatusTone} /></div>
        <p className="mt-4 leading-relaxed text-stone-700">{dashboard.statusDescription}</p>

        <section className="mt-8 border-y-2 border-ink bg-white px-5 py-6 md:px-6" aria-labelledby="dashboard-proof">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Точна следна акција</p>
          <h2 id="dashboard-proof" className="mt-3 font-display text-2xl font-semibold text-ink">Потребен доказ</h2>
          <div className="mt-4"><CurriculumMarkdown>{dashboard.assignment.proofPromptMarkdown}</CurriculumMarkdown></div>
        </section>

        <section className="mt-6 border-l-4 border-cobalt bg-stone-100 p-5" aria-labelledby="dashboard-feedback">
          <h2 id="dashboard-feedback" className="font-display text-lg font-semibold text-ink">Последна повратна информација</h2>
          <p className="mt-2 text-sm leading-relaxed text-stone-700">{dashboard.feedbackMessage}</p>
        </section>

        <Link className="pressable mt-6 inline-flex min-h-12 items-center justify-center border-2 border-ink bg-launch px-6 py-3 font-semibold text-ink" href={`/app/assignments/${dashboard.assignment.slug}`}>
          {dashboard.actionLabel}
        </Link>
      </section>

      <aside className="border-2 border-ink bg-white p-5 lg:sticky lg:top-24">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Патека {curriculumVersion}</p>
        <p className="mt-3 font-display text-3xl font-semibold text-ink"><span className="text-cobalt">{dashboard.progress.approved}</span> / {dashboard.progress.total}</p>
        <p className="mt-2 text-sm text-stone-700">{dashboard.progress.approved} од {dashboard.progress.total} задачи се одобрени</p>
        <div className="mt-6 border-t-2 border-ink pt-5">
          <h2 className="font-display text-lg font-semibold text-ink">Точен услов за следниот чекор</h2>
          <p className="mt-3 text-sm leading-relaxed text-stone-700">{dashboard.unlockCondition}</p>
        </div>
      </aside>
    </div>
  );
}

function DashboardTerminal({ title, message, meta }: { title: string; message: string; meta?: string }) {
  return (
    <section className="mx-auto max-w-3xl border-y-2 border-ink bg-white px-5 py-8 md:px-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Тековна задача</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink">{title}</h1>
      {meta ? <p className="mt-3 text-sm font-semibold text-stone-700">{meta}</p> : null}
      <p className="mt-4 text-lg leading-relaxed text-stone-700">{message}</p>
      <Link className="mt-6 inline-flex min-h-11 items-center font-semibold text-cobalt underline decoration-2 underline-offset-4" href="/app/project">Провери го проектот</Link>
    </section>
  );
}
