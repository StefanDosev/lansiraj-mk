import type { CurrentProject } from "@/features/projects/projects.types";

type Props = { project: CurrentProject; audience: "learner" | "reviewer" };

const statusLabels: Record<CurrentProject["status"], string> = {
  draft: "Нацрт", active: "Активен", completed: "Завршен", archived: "Архивиран",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("mk-MK", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}

function ScopeField({ label, children }: Readonly<{ label: string; children: React.ReactNode }>) {
  return <div><dt className="text-sm font-semibold text-stone-700">{label}</dt><dd className="mt-1 whitespace-pre-wrap leading-relaxed text-ink">{children}</dd></div>;
}

export function ProjectScopeSummary({ project, audience }: Props) {
  const assessment = project.scopeAssessment;
  return (
    <div className="space-y-6">
      <section className="rounded-md border border-stone-300 bg-white p-5 text-ink md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-200 pb-5">
          <div><p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Опсег на проектот</p><h1 className="mt-3 font-display text-3xl font-semibold leading-tight">{project.title}</h1></div>
          <span className="rounded-sm border border-stone-300 bg-stone-100 px-3 py-1.5 text-sm font-semibold text-ink">{statusLabels[project.status]}</span>
        </div>
        <dl className="mt-6 grid gap-6 md:grid-cols-2">
          <ScopeField label="За кого е проектот?">{project.targetUser}</ScopeField>
          <ScopeField label="Кој проблем го решава?">{project.problemStatement}</ScopeField>
          <ScopeField label="Една главна акција">{project.coreAction}</ScopeField>
          <ScopeField label="Што нема да се гради?"><ul className="list-disc space-y-1 pl-5">{project.nonFeatures.map((item) => <li key={item}>{item}</li>)}</ul></ScopeField>
          <ScopeField label="Време неделно">{project.weeklyHours} часа</ScopeField>
          <ScopeField label="Целен датум">{formatDate(project.targetLaunchDate)}</ScopeField>
        </dl>
      </section>
      <aside className="rounded-md border border-stone-300 bg-stone-100 p-5 text-ink md:p-6" aria-labelledby="scope-readiness-heading">
        <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Рачна проверка</p>
        <div className="mt-3 flex items-center gap-3">
          <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full border border-ink ${assessment?.readiness === "ready" ? "bg-acid" : assessment?.readiness === "needs_reduction" ? "bg-coral" : "bg-white"}`} />
          <h2 id="scope-readiness-heading" className="font-display text-xl font-semibold">{!assessment ? "Сè уште нема проценка" : assessment.readiness === "ready" ? "Подготвен опсег" : "Потребно е намалување"}</h2>
        </div>
        {assessment?.note ? <p className="mt-3 leading-relaxed text-stone-700">{assessment.note}</p> : null}
        {assessment ? <p className="mt-3 text-sm text-stone-700">Проверено на {new Intl.DateTimeFormat("mk-MK", { dateStyle: "long", timeZone: "Europe/Skopje" }).format(new Date(assessment.reviewedAt))}.</p> : null}
        <p className="mt-4 border-t border-stone-300 pt-4 text-sm leading-relaxed text-stone-700">{audience === "reviewer" ? "Оваа проценка е насока за обемот. Не го менува статусот на проектот и не ги блокира задачите." : "Проценката е насока од reviewer-от. Не го менува статусот на проектот и не ја блокира следната задача."}</p>
      </aside>
    </div>
  );
}
