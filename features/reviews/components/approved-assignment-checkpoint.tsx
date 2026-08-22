import Link from "next/link";

import type { ApprovedAssignmentNextStep } from "@/features/curriculum/approval";
import type { LearnerReviewFeedback } from "@/features/reviews/review-feedback.types";

type ApprovedAssignmentCheckpointProps = {
  review: LearnerReviewFeedback | null;
  nextStep: ApprovedAssignmentNextStep;
};

export function ApprovedAssignmentCheckpoint({
  review,
  nextStep,
}: ApprovedAssignmentCheckpointProps) {
  return (
    <section
      className="mt-8 border-2 border-ink bg-acid p-5 text-ink md:p-6"
      aria-labelledby="approved-assignment-heading"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em]">
        Човечки преглед{review ? ` · Верзија ${review.version}` : ""}
      </p>
      <h2
        id="approved-assignment-heading"
        className="mt-3 font-display text-2xl font-semibold"
      >
        Одобрено — доказот е доволен
      </h2>

      {review ? (
        <>
          <p className="mt-4 whitespace-pre-wrap text-lg leading-relaxed">
            {review.summary}
          </p>
          <div className="mt-6 border-t-2 border-ink pt-5">
            <h3 className="font-display text-lg font-semibold">Што е исполнето</h3>
            <ol className="mt-3 divide-y divide-ink border-y border-ink">
              {review.criteria.map((criterion) => (
                <li key={criterion.criterionId} className="py-4">
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
                    <p className="font-semibold leading-relaxed">
                      <span className="mr-2">{criterion.position}.</span>
                      {criterion.criterion}
                    </p>
                    <p className="text-sm font-semibold">Исполнето</p>
                  </div>
                  {criterion.note ? (
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">
                      {criterion.note}
                    </p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <p className="mt-4 leading-relaxed">
          Одлуката е зачувана, но деталите од прегледот моментално не може да се вчитаат.
        </p>
      )}

      <div className="mt-6 border-t-2 border-ink pt-5">
        {nextStep.kind === "next" ? (
          <Link
            className="pressable inline-flex min-h-12 items-center justify-center border-2 border-ink bg-ink px-5 py-3 font-semibold text-[var(--text-inverse)]"
            href={`/app/assignments/${nextStep.assignment.slug}`}
          >
            Продолжи кон Задача {String(nextStep.assignment.position).padStart(2, "0")}
          </Link>
        ) : nextStep.kind === "complete" ? (
          <Link
            className="pressable inline-flex min-h-12 items-center justify-center border-2 border-ink bg-ink px-5 py-3 font-semibold text-[var(--text-inverse)]"
            href="/app/project"
          >
            Види го завршениот проект
          </Link>
        ) : (
          <div role="alert">
            <p className="font-semibold">Следниот чекор сè уште не е достапен.</p>
            <p className="mt-2 text-sm leading-relaxed">
              Освежи ја страницата. Ако Задача {String(nextStep.assignment.position).padStart(2, "0")} остане заклучена, побарај помош.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
