import { formatSubmissionDate } from "@/features/submissions/submissions.presentation";
import { StatusMarker } from "@/components/ui/status-marker";
import type {
  ReviewerAcceptanceCriterion,
  ReviewerCompletedReview,
} from "@/features/reviews/reviews.types";

export function CompletedReview({
  review,
  criteria,
}: {
  review: ReviewerCompletedReview;
  criteria: ReviewerAcceptanceCriterion[];
}) {
  const outcomes = new Map(review.criteria.map((criterion) => [criterion.criterionId, criterion]));

  return (
    <section className="mt-12 border-t-2 border-ink pt-8" aria-labelledby="completed-review-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cobalt">Завршен преглед</p>
          <h2 id="completed-review-title" className="mt-3 font-display text-3xl font-semibold text-ink">
            {review.decision === "approved" ? "Задачата е одобрена" : "Побарана е ревизија"}
          </h2>
        </div>
        <time className="text-sm tabular-nums text-stone-700" dateTime={review.createdAt}>
          {formatSubmissionDate(review.createdAt)}
        </time>
      </div>

      <div className="mt-6 border-l-4 border-cobalt bg-stone-100 p-5">
        <h3 className="font-semibold text-ink">Резиме</h3>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-stone-700">{review.summary}</p>
        {review.priorityCorrection ? (
          <div className="mt-5 border-t border-stone-300 pt-5">
            <h3 className="font-semibold text-ink">Најважна корекција</h3>
            <p className="mt-2 whitespace-pre-wrap leading-relaxed text-stone-700">
              {review.priorityCorrection}
            </p>
          </div>
        ) : null}
      </div>

      <ol className="mt-6 divide-y divide-stone-300 border-y-2 border-ink">
        {criteria.map((criterion) => {
          const outcome = outcomes.get(criterion.id);
          if (!outcome) return null;

          return (
            <li key={criterion.id} className="py-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <p className="max-w-3xl font-semibold leading-relaxed text-ink">
                  <span className="mr-2 text-cobalt">{criterion.position}.</span>
                  {criterion.criterion}
                </p>
                <StatusMarker
                  label={outcome.outcome === "pass" ? "Исполнето" : "Потребна корекција"}
                  tone={outcome.outcome === "pass" ? "approved" : "revision"}
                />
              </div>
              {outcome.note ? (
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-stone-700">{outcome.note}</p>
              ) : null}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
