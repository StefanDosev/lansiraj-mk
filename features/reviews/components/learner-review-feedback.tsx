import { StatusMarker } from "@/components/ui/status-marker";
import type { LearnerReviewFeedback } from "@/features/reviews/review-feedback.types";
import { formatSubmissionDate } from "@/features/submissions/submissions.presentation";

export function ActiveRevisionFeedback({
  feedback,
}: {
  feedback: LearnerReviewFeedback | null;
}) {
  if (!feedback || feedback.decision !== "revision_required") {
    return (
      <section className="mt-8 border-2 border-coral bg-white p-5" aria-labelledby="revision-feedback-missing">
        <h2 id="revision-feedback-missing" className="font-display text-xl font-semibold text-ink">
          Повратната информација не е достапна
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-stone-700">
          Задачата е вратена на корекција, но деталите не може да се вчитаат. Освежи ја страницата пред да го менуваш доказот.
        </p>
      </section>
    );
  }

  const revisedCriteria = feedback.criteria.filter((criterion) => criterion.outcome === "revise");

  return (
    <section className="mt-8 border-2 border-coral bg-white p-5 md:p-6" aria-labelledby="active-revision-title">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-stone-600">Вратено од човечки преглед</p>
          <h2 id="active-revision-title" className="mt-2 font-display text-2xl font-semibold text-ink">
            Поправи ја верзија {feedback.version}
          </h2>
        </div>
        <StatusMarker label="Потребна е корекција" tone="revision" />
      </div>

      <div className="mt-6 border-l-4 border-coral bg-stone-100 p-4 md:p-5">
        <h3 className="font-semibold text-ink">Најважна корекција</h3>
        <p className="mt-2 whitespace-pre-wrap text-lg leading-relaxed text-ink">
          {feedback.priorityCorrection ?? "Прегледај ги забелешките по критериум пред повторно испраќање."}
        </p>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold text-ink">Зошто е побарана ревизија</h3>
        <p className="mt-2 whitespace-pre-wrap leading-relaxed text-stone-700">{feedback.summary}</p>
      </div>

      <div className="mt-6 border-t border-stone-300 pt-5">
        <h3 className="font-semibold text-ink">Критериуми што бараат корекција</h3>
        <ol className="mt-3 divide-y divide-stone-300 border-y border-stone-300">
          {revisedCriteria.map((criterion) => (
            <li key={criterion.criterionId} className="py-4">
              <p className="font-semibold leading-relaxed text-ink">
                <span className="mr-2 text-ink">{criterion.position}.</span>
                {criterion.criterion}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                {criterion.note}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <p className="mt-5 text-sm tabular-nums text-stone-700">
        Одлука за верзија {feedback.version} · {formatSubmissionDate(feedback.createdAt)}
      </p>
    </section>
  );
}

export function HistoricalReviewFeedback({ review }: { review: LearnerReviewFeedback }) {
  return (
    <section className="mt-5 border-t border-stone-200 pt-5" aria-labelledby={`history-review-${review.id}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 id={`history-review-${review.id}`} className="font-semibold text-ink">Човечка одлука</h4>
          <p className="mt-1 text-sm tabular-nums text-stone-700">{formatSubmissionDate(review.createdAt)}</p>
        </div>
        <StatusMarker
          label={review.decision === "approved" ? "Одобрено" : "Потребна е корекција"}
          tone={review.decision === "approved" ? "approved" : "revision"}
        />
      </div>

      <p className="mt-4 whitespace-pre-wrap leading-relaxed text-stone-700">{review.summary}</p>
      {review.priorityCorrection ? (
        <div className="mt-4 border-l-4 border-coral bg-stone-100 p-4">
          <p className="font-semibold text-ink">Најважна корекција</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{review.priorityCorrection}</p>
        </div>
      ) : null}

      <ol className="mt-4 divide-y divide-stone-300 border-y border-stone-300">
        {review.criteria.map((criterion) => (
          <li key={criterion.criterionId} className="py-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <p className="max-w-2xl text-sm font-semibold leading-relaxed text-ink">
                <span className="mr-2 text-cobalt">{criterion.position}.</span>
                {criterion.criterion}
              </p>
              <StatusMarker
                label={criterion.outcome === "pass" ? "Исполнето" : "Потребна корекција"}
                tone={criterion.outcome === "pass" ? "approved" : "revision"}
              />
            </div>
            {criterion.note ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{criterion.note}</p>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
