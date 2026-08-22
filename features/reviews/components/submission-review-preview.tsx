import Link from "next/link";

import { ProofArtifact } from "@/components/ui/proof-artifact";
import { StatusMarker } from "@/components/ui/status-marker";
import { CompletedReview } from "@/features/reviews/components/completed-review";
import { ReviewDecisionForm } from "@/features/reviews/components/review-decision-form";
import { ReviewVersionHistory } from "@/features/reviews/components/review-version-history";
import type { ReviewerSubmissionDetail } from "@/features/reviews/reviews.types";
import {
  formatSubmissionDate,
  getEvidenceLinkTypeLabel,
  submissionStatusPresentation,
} from "@/features/submissions/submissions.presentation";

type SubmissionReviewPreviewProps = {
  submission: ReviewerSubmissionDetail;
};

const statusTone = {
  submitted: "active",
  revision_required: "revision",
  approved: "approved",
} as const;

export function SubmissionReviewPreview({ submission }: SubmissionReviewPreviewProps) {
  const status = submissionStatusPresentation[submission.status];

  return (
    <div>
      <Link className="font-semibold text-cobalt underline underline-offset-4" href="/admin">
        ← Назад кон редот
      </Link>

      <header className="mt-6 border-b-2 border-ink pb-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-cobalt">
              Фаза {submission.stagePosition} · Задача {submission.assignmentPosition} · Верзија {submission.version}
            </p>
            <h1 className="mt-3 max-w-4xl font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">
              {submission.assignmentTitle}
            </h1>
          </div>
          <StatusMarker label={status.label} tone={statusTone[submission.status]} />
        </div>
        <p className="mt-4 max-w-3xl leading-relaxed text-stone-700">
          Ова е точната замрзната верзија избрана за преглед. Одлуката се врзува само за неа и не може да се измени по зачувувањето.
        </p>
      </header>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
        <ProofArtifact label={`Замрзнат доказ · Верзија ${submission.version}`}>
          <div className="space-y-7">
            <section aria-labelledby="evidence-text-title">
              <h2 id="evidence-text-title" className="font-display text-xl font-semibold text-ink">Текстуален доказ</h2>
              <p className="mt-4 whitespace-pre-wrap leading-relaxed text-stone-700">
                {submission.evidenceText || "Оваа верзија нема текстуален доказ."}
              </p>
            </section>

            <section className="border-t border-stone-300 pt-6" aria-labelledby="evidence-links-title">
              <h2 id="evidence-links-title" className="font-display text-xl font-semibold text-ink">Линкови</h2>
              {submission.links.length === 0 ? (
                <p className="mt-4 text-stone-700">Оваа верзија нема приложени линкови.</p>
              ) : (
                <ol className="mt-4 divide-y divide-stone-300 border-y border-stone-300">
                  {submission.links.map((link) => (
                    <li key={link.id} className="py-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-stone-600">
                        {getEvidenceLinkTypeLabel(link.type)}
                      </p>
                      <a
                        className="mt-2 inline-block font-semibold text-cobalt underline underline-offset-4"
                        href={link.url}
                        rel="noreferrer noopener"
                        target="_blank"
                      >
                        {link.label}
                      </a>
                      <p className="mt-1 text-sm text-stone-700">{link.url}</p>
                    </li>
                  ))}
                </ol>
              )}
            </section>
          </div>
        </ProofArtifact>

        <aside className="border-y-2 border-ink py-5 xl:sticky xl:top-6" aria-labelledby="submission-context-title">
          <h2 id="submission-context-title" className="font-display text-xl font-semibold text-ink">Контекст</h2>
          <dl className="mt-5 divide-y divide-stone-200 border-y border-stone-300">
            <div className="py-4">
              <dt className="text-xs font-semibold uppercase tracking-widest text-stone-600">Ученик</dt>
              <dd className="mt-2 font-semibold text-ink">{submission.learnerName}</dd>
            </div>
            <div className="py-4">
              <dt className="text-xs font-semibold uppercase tracking-widest text-stone-600">Проект</dt>
              <dd className="mt-2">
                <Link className="font-semibold text-cobalt underline underline-offset-4" href={`/admin/projects/${submission.projectId}`}>
                  {submission.projectTitle}
                </Link>
              </dd>
            </div>
            <div className="py-4">
              <dt className="text-xs font-semibold uppercase tracking-widest text-stone-600">Кохорта</dt>
              <dd className="mt-2 font-semibold text-ink">{submission.cohortName}</dd>
            </div>
            <div className="py-4">
              <dt className="text-xs font-semibold uppercase tracking-widest text-stone-600">Испратено</dt>
              <dd className="mt-2 text-sm tabular-nums text-stone-700">
                <time dateTime={submission.submittedAt}>{formatSubmissionDate(submission.submittedAt)}</time>
              </dd>
            </div>
          </dl>
        </aside>
      </div>

      {submission.review ? (
        <CompletedReview review={submission.review} criteria={submission.criteria} />
      ) : submission.status === "submitted" ? (
        <ReviewDecisionForm
          submissionId={submission.id}
          version={submission.version}
          criteria={submission.criteria}
        />
      ) : (
        <section className="mt-12 border-l-4 border-coral bg-stone-100 p-5" aria-labelledby="review-state-title">
          <h2 id="review-state-title" className="font-display text-xl font-semibold text-ink">Одлуката не е достапна</h2>
          <p className="mt-2 leading-relaxed text-stone-700">Оваа верзија веќе не е во состојба за преглед.</p>
        </section>
      )}

      <ReviewVersionHistory history={submission.history} selectedId={submission.id} />
    </div>
  );
}
