import Link from "next/link";

import { StatusMarker } from "@/components/ui/status-marker";
import {
  assignmentStatePresentation,
  cohortStatusPresentation,
  learnerJourneyPresentation,
} from "@/features/reviews/reviews.presentation";
import type { ReviewerCohortSnapshot } from "@/features/reviews/reviews.types";

type CohortSnapshotProps = {
  cohorts: ReviewerCohortSnapshot[];
};

export function CohortSnapshot({ cohorts }: CohortSnapshotProps) {
  return (
    <section aria-labelledby="cohort-snapshot-title">
      <div className="border-b-2 border-ink pb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-cobalt">Кохортен контекст</p>
        <h2 id="cohort-snapshot-title" className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">
          Напредок на учениците
        </h2>
      </div>

      {cohorts.length === 0 ? (
        <div className="border-b border-stone-300 py-10">
          <p className="font-display text-xl font-semibold text-ink">Нема активни или подготвени кохорти.</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-stone-700">
            Архивираните кохорти не се прикажуваат во оперативниот преглед.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {cohorts.map((cohort) => {
            const status = cohortStatusPresentation[cohort.status];
            return (
              <article key={cohort.id} className="border-b-2 border-ink pb-8 pt-6" aria-labelledby={`cohort-${cohort.id}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 id={`cohort-${cohort.id}`} className="font-display text-xl font-semibold text-ink md:text-2xl">
                      {cohort.name}
                    </h3>
                    <p className="mt-2 text-sm text-stone-700">Само активните членства се вклучени во оваа слика.</p>
                  </div>
                  <StatusMarker label={status.label} tone={status.tone} />
                </div>

                <dl className="mt-6 grid border-y border-stone-300 sm:grid-cols-3">
                  <div className="border-b border-stone-200 px-0 py-4 sm:border-b-0 sm:border-r sm:px-4">
                    <dt className="text-xs font-semibold uppercase tracking-widest text-stone-600">Активни ученици</dt>
                    <dd className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">{cohort.activeLearnerCount}</dd>
                  </div>
                  <div className="border-b border-stone-200 px-0 py-4 sm:border-b-0 sm:border-r sm:px-4">
                    <dt className="text-xs font-semibold uppercase tracking-widest text-stone-600">Активни проекти</dt>
                    <dd className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">{cohort.activeProjectCount}</dd>
                  </div>
                  <div className="px-0 py-4 sm:px-4">
                    <dt className="text-xs font-semibold uppercase tracking-widest text-stone-600">Чекаат преглед</dt>
                    <dd className="mt-2 font-display text-2xl font-semibold tabular-nums text-ink">{cohort.pendingReviewCount}</dd>
                  </div>
                </dl>

                {cohort.learners.length === 0 ? (
                  <p className="border-b border-stone-200 py-6 text-stone-700">Во кохортата сè уште нема активни ученици.</p>
                ) : (
                  <ol className="divide-y divide-stone-200 border-b border-stone-300">
                    {cohort.learners.map((learner) => {
                      const journey = learnerJourneyPresentation[learner.journeyState];
                      const assignment = learner.currentAssignment
                        ? assignmentStatePresentation[learner.currentAssignment.state]
                        : null;

                      return (
                        <li key={learner.userId} className="grid gap-5 py-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_auto] lg:items-start">
                          <div>
                            <p className="font-semibold text-ink">{learner.displayName}</p>
                            {learner.project ? (
                              <Link className="mt-1 inline-block font-semibold text-cobalt underline underline-offset-4" href={`/admin/projects/${learner.project.id}`}>
                                {learner.project.title}
                              </Link>
                            ) : (
                              <p className="mt-1 text-sm text-stone-700">Сè уште нема зачуван проект.</p>
                            )}
                          </div>

                          <div>
                            {learner.currentAssignment ? (
                              <>
                                <p className="font-semibold text-ink">{learner.currentAssignment.title}</p>
                                <p className="mt-1 text-sm text-stone-700">
                                  Фаза {learner.currentAssignment.stagePosition} · Задача {learner.currentAssignment.position}
                                </p>
                                {assignment ? <div className="mt-3"><StatusMarker label={assignment.label} tone={assignment.tone} /></div> : null}
                              </>
                            ) : (
                              <StatusMarker label={journey.label} tone={journey.tone} />
                            )}
                          </div>

                          <div className="lg:text-right">
                            <p className="font-semibold tabular-nums text-ink">
                              {learner.approvedCount} од {learner.assignmentCount} одобрени
                            </p>
                            <p className={`mt-2 text-sm font-semibold ${learner.hasPendingReview ? "text-cobalt" : "text-stone-600"}`}>
                              {learner.hasPendingReview ? "Има доказ на проверка" : "Нема доказ на проверка"}
                            </p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
