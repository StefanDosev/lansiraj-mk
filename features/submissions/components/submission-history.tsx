import {
  formatSubmissionDate,
  getEvidenceLinkTypeLabel,
  submissionStatusPresentation,
} from "@/features/submissions/submissions.presentation";
import type { SubmissionHistoryEntry } from "@/features/submissions/submissions.types";

function SubmissionVersionEvidence({ submission }: { submission: SubmissionHistoryEntry }) {
  const status = submissionStatusPresentation[submission.status];

  return (
    <div className="border-t border-stone-200 px-4 py-5 md:px-5">
      <p className="text-sm leading-relaxed text-stone-700">{status.description}</p>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-ink">Испратено</dt>
          <dd className="mt-1 tabular-nums text-stone-700">
            <time dateTime={submission.submittedAt}>{formatSubmissionDate(submission.submittedAt)}</time>
          </dd>
        </div>
        {submission.reviewedAt ? (
          <div>
            <dt className="font-semibold text-ink">Одлука</dt>
            <dd className="mt-1 tabular-nums text-stone-700">
              <time dateTime={submission.reviewedAt}>{formatSubmissionDate(submission.reviewedAt)}</time>
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="mt-5 border-t border-stone-200 pt-5">
        <h4 className="font-semibold text-ink">Текстуален доказ</h4>
        {submission.evidenceText.trim() ? (
          <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed text-stone-700">
            {submission.evidenceText}
          </p>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Оваа верзија е испратена без текстуален доказ.
          </p>
        )}
      </div>

      <div className="mt-5 border-t border-stone-200 pt-5">
        <h4 className="font-semibold text-ink">Линкови за доказ</h4>
        {submission.links.length > 0 ? (
          <ul className="mt-3 space-y-3" aria-label={`Линкови од верзија ${submission.version}`}>
            {submission.links.map((link) => (
              <li key={link.id} className="min-w-0 rounded-md border border-stone-300 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-stone-700">
                  {getEvidenceLinkTypeLabel(link.type)}
                </p>
                <a
                  className="mt-2 inline-flex min-h-11 max-w-full items-center break-words font-semibold text-cobalt underline decoration-2 underline-offset-4"
                  href={link.url}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  {link.label}
                </a>
                <p className="mt-1 break-all text-sm text-stone-700">{link.url}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-stone-700">
            Оваа верзија е испратена без линкови.
          </p>
        )}
      </div>
    </div>
  );
}

function SubmissionVersionHeader({
  submission,
  latest,
}: {
  submission: SubmissionHistoryEntry;
  latest: boolean;
}) {
  const status = submissionStatusPresentation[submission.status];

  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
      <div>
        <p className="font-display text-lg font-semibold text-ink">Верзија {submission.version}</p>
        {latest ? <p className="mt-1 text-sm font-semibold text-cobalt">Најнова верзија</p> : null}
      </div>
      <span className={`w-fit rounded-sm border px-3 py-2 text-sm font-semibold ${status.className}`}>
        {status.label}
      </span>
    </div>
  );
}

export function SubmissionHistory({ history }: { history: SubmissionHistoryEntry[] }) {
  if (history.length === 0) return null;

  return (
    <section className="mt-8 border-t border-stone-200 pt-6" aria-labelledby="submission-history-heading">
      <h2 id="submission-history-heading" className="font-display text-2xl font-semibold text-ink">
        Историја на испраќања
      </h2>
      <p className="mt-3 leading-relaxed text-stone-700">
        Секоја верзија е замрзната копија од доказот што бил испратен на човечка проверка.
      </p>

      <ol className="mt-5 space-y-4 border-l-2 border-stone-300 pl-4" aria-label="Верзии на доказот">
        {history.map((submission, index) => (
          <li key={submission.id}>
            {index === 0 ? (
              <article className="rounded-md border-2 border-cobalt bg-white" aria-label={`Верзија ${submission.version}, најнова`}>
                <SubmissionVersionHeader submission={submission} latest />
                <SubmissionVersionEvidence submission={submission} />
              </article>
            ) : (
              <details className="rounded-md border border-stone-300 bg-white">
                <summary className="min-h-11 cursor-pointer marker:text-cobalt focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-cobalt">
                  <SubmissionVersionHeader submission={submission} latest={false} />
                </summary>
                <SubmissionVersionEvidence submission={submission} />
              </details>
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
