import Link from "next/link";

import {
  formatSubmissionDate,
  getEvidenceLinkTypeLabel,
  submissionStatusPresentation,
} from "@/features/submissions/submissions.presentation";
import type { ImmutableSubmissionVersion } from "@/features/submissions/submissions.types";

export function ReviewVersionHistory({
  history,
  selectedId,
}: {
  history: ImmutableSubmissionVersion[];
  selectedId: string;
}) {
  const otherVersions = history.filter((submission) => submission.id !== selectedId);
  if (otherVersions.length === 0) return null;

  return (
    <section className="mt-12 border-t-2 border-ink pt-8" aria-labelledby="review-history-title">
      <h2 id="review-history-title" className="font-display text-2xl font-semibold text-ink">Други верзии</h2>
      <p className="mt-3 leading-relaxed text-stone-700">
        Избраната верзија останува главен доказ. Овие замрзнати верзии се достапни само како контекст.
      </p>

      <ol className="mt-6 space-y-4 border-l-2 border-stone-300 pl-4">
        {otherVersions.map((submission) => {
          const status = submissionStatusPresentation[submission.status];
          return (
            <li key={submission.id}>
              <details className="border border-stone-300 bg-white">
                <summary className="min-h-11 cursor-pointer p-4 marker:text-cobalt focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cobalt">
                  <span className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      <span className="block font-display text-lg font-semibold text-ink">Верзија {submission.version}</span>
                      <span className="mt-1 block text-sm tabular-nums text-stone-700">{formatSubmissionDate(submission.submittedAt)}</span>
                    </span>
                    <span className={`w-fit border px-3 py-2 text-sm font-semibold ${status.className}`}>{status.label}</span>
                  </span>
                </summary>
                <div className="border-t border-stone-300 p-4 md:p-5">
                  <p className="whitespace-pre-wrap leading-relaxed text-stone-700">
                    {submission.evidenceText || "Оваа верзија нема текстуален доказ."}
                  </p>
                  {submission.links.length > 0 ? (
                    <ul className="mt-5 space-y-3">
                      {submission.links.map((link) => (
                        <li key={link.id} className="border-l-4 border-cobalt bg-stone-100 p-4">
                          <p className="text-xs font-semibold uppercase tracking-widest text-stone-600">{getEvidenceLinkTypeLabel(link.type)}</p>
                          <a className="mt-2 inline-block break-words font-semibold text-cobalt underline underline-offset-4" href={link.url} rel="noreferrer noopener" target="_blank">{link.label}</a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  <Link className="mt-5 inline-flex min-h-11 items-center font-semibold text-cobalt underline underline-offset-4" href={`/admin/reviews/${submission.id}`}>
                    Отвори ја верзија {submission.version}
                  </Link>
                </div>
              </details>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
