import Link from "next/link";

import type { ProjectJourney as ProjectJourneyModel } from "@/features/journey/journey.types";

const markerClasses = {
  locked: "border-stone-300 bg-stone-100 text-stone-700",
  available: "border-ink bg-white text-ink",
  submitted: "border-cobalt bg-white text-cobalt",
  revision_required: "border-coral bg-white text-ink",
  approved: "border-ink bg-acid text-ink",
} as const;

export function ProjectJourney({ journey }: Readonly<{ journey: ProjectJourneyModel }>) {
  return (
    <section className="rounded-md border border-stone-300 bg-white p-5 text-ink md:p-6" aria-labelledby="journey-heading">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Проектна патека</p>
          <h2 id="journey-heading" className="mt-3 font-display text-2xl font-semibold md:text-3xl">Од идеја до јавен производ</h2>
        </div>
        <p className="text-sm font-semibold text-stone-700">{journey.approvedCount} од {journey.taskCount} задачи се одобрени</p>
      </div>

      <ol className="mt-6 grid gap-0 lg:grid-cols-6" aria-label="Шест фази на проектната патека">
        {journey.stages.map((stage) => (
          <li key={stage.position} className="relative border-l border-stone-300 pb-6 pl-6 last:pb-0 lg:border-l-0 lg:border-t lg:px-2 lg:pb-0 lg:pt-6">
            <span aria-hidden="true" className={`absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold lg:-top-3 lg:left-2 ${markerClasses[stage.state]}`}>
              {stage.position}
            </span>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-700">Фаза {stage.position}</p>
            <h3 className="mt-2 font-display text-sm font-semibold leading-snug">{stage.title}</h3>
            <p className="mt-2 text-xs font-semibold text-stone-700">{stage.isCurrent ? `Тековна фаза · ${stage.stateLabel}` : stage.stateLabel}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 border-t border-stone-200 pt-6">
        <h3 className="font-display text-xl font-semibold">Десет задачи</h3>
        <ol className="mt-4 divide-y divide-stone-200">
          {journey.stages.flatMap((stage) => stage.tasks).map((task) => (
            <li key={task.slug} className="grid gap-3 py-4 sm:grid-cols-[3rem_1fr_auto] sm:items-start">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold ${markerClasses[task.state]}`} aria-hidden="true">
                {String(task.position).padStart(2, "0")}
              </span>
              <div>
                <Link className="font-semibold text-ink underline decoration-stone-300 underline-offset-4 hover:decoration-cobalt" href={`/app/assignments/${task.slug}`}>
                  {task.title}
                </Link>
                {task.unlockCondition ? <p className="mt-2 text-sm leading-relaxed text-stone-700">{task.unlockCondition}</p> : null}
              </div>
              <p className="text-sm font-semibold text-stone-700 sm:text-right">{task.isCurrent ? `Тековна задача · ${task.stateLabel}` : task.stateLabel}</p>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 border-t border-stone-200 pt-6" aria-labelledby="live-endpoint-heading">
        <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Финална дестинација</p>
        <h3 id="live-endpoint-heading" className="mt-2 font-display text-xl font-semibold">Јавен URL на проектот</h3>
        {journey.endpoint.kind === "live" ? (
          <a className="mt-3 inline-flex min-h-11 items-center font-semibold text-cobalt underline underline-offset-4" href={journey.endpoint.url} target="_blank" rel="noreferrer noopener">
            Отвори го живиот проект <span className="sr-only">во нов прозорец</span>
          </a>
        ) : journey.endpoint.kind === "locked" ? (
          <div className="mt-3 rounded-md border border-stone-300 bg-stone-100 p-4">
            <p className="font-semibold">Заклучено</p>
            <p className="mt-1 text-sm leading-relaxed text-stone-700">{journey.endpoint.unlockCondition}</p>
          </div>
        ) : (
          <p className="mt-3 rounded-md border border-coral bg-stone-100 p-4 text-sm leading-relaxed" role="alert">{journey.endpoint.message}</p>
        )}
      </div>
    </section>
  );
}
