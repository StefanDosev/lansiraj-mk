import Link from "next/link";

import { StatusMarker } from "@/components/ui/status-marker";
import { formatWaitingDuration } from "@/features/reviews/reviews.presentation";
import type { ReviewerQueueRecord } from "@/features/reviews/reviews.types";
import { formatSubmissionDate } from "@/features/submissions/submissions.presentation";

type ReviewerQueueProps = {
  records: ReviewerQueueRecord[];
  now: Date;
};

function MobileLabel({ children }: Readonly<{ children: React.ReactNode }>) {
  return <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-stone-600 md:hidden">{children}</span>;
}

export function ReviewerQueue({ records, now }: ReviewerQueueProps) {
  return (
    <section aria-labelledby="pending-review-title">
      <div className="flex flex-col gap-4 border-b-2 border-ink pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cobalt">Оперативен ред</p>
          <h2 id="pending-review-title" className="mt-2 font-display text-2xl font-semibold text-ink md:text-3xl">
            Докази што чекаат
          </h2>
        </div>
        <StatusMarker
          label={records.length === 1 ? "1 доказ на проверка" : `${records.length} докази на проверка`}
          tone={records.length > 0 ? "active" : "neutral"}
        />
      </div>

      {records.length === 0 ? (
        <div className="border-b border-stone-300 py-10 text-left">
          <p className="font-display text-xl font-semibold text-ink">Нема докази што чекаат.</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-stone-700">
            Новата замрзната верзија ќе се појави тука веднаш штом ученик ќе ја испрати.
          </p>
        </div>
      ) : (
        <table className="block w-full border-b border-stone-300 md:table">
          <caption className="sr-only">Докази наредени од најстарото испраќање</caption>
          <thead className="hidden border-b border-stone-300 md:table-header-group">
            <tr className="text-left text-xs font-semibold uppercase tracking-widest text-stone-600">
              <th className="px-3 py-3" scope="col">Ученик и проект</th>
              <th className="px-3 py-3" scope="col">Задача</th>
              <th className="px-3 py-3" scope="col">Испратено</th>
              <th className="px-3 py-3" scope="col">Чека</th>
              <th className="px-3 py-3 text-right" scope="col">Акција</th>
            </tr>
          </thead>
          <tbody className="block md:table-row-group">
            {records.map((record) => (
              <tr key={record.id} className="block border-b border-stone-200 py-2 last:border-b-0 md:table-row md:py-0">
                <td className="block px-0 py-3 align-top md:table-cell md:px-3 md:py-4">
                  <MobileLabel>Ученик и проект</MobileLabel>
                  <p className="font-semibold text-ink">{record.learnerName}</p>
                  <p className="mt-1 text-sm text-stone-700">{record.projectTitle}</p>
                  <p className="mt-1 text-xs text-stone-600">{record.cohortName}</p>
                </td>
                <td className="block px-0 py-3 align-top md:table-cell md:px-3 md:py-4">
                  <MobileLabel>Задача</MobileLabel>
                  <p className="font-semibold text-ink">{record.assignmentTitle}</p>
                  <p className="mt-1 text-sm text-stone-700">
                    Фаза {record.stagePosition} · Задача {record.assignmentPosition} · Верзија {record.version}
                  </p>
                </td>
                <td className="block px-0 py-3 align-top md:table-cell md:px-3 md:py-4">
                  <MobileLabel>Испратено</MobileLabel>
                  <time className="text-sm tabular-nums text-stone-700" dateTime={record.submittedAt}>
                    {formatSubmissionDate(record.submittedAt)}
                  </time>
                </td>
                <td className="block px-0 py-3 align-top md:table-cell md:px-3 md:py-4">
                  <MobileLabel>Чека</MobileLabel>
                  <span className="font-semibold tabular-nums text-ink">
                    {formatWaitingDuration(record.submittedAt, now)}
                  </span>
                </td>
                <td className="block px-0 py-3 align-top md:table-cell md:px-3 md:py-4 md:text-right">
                  <Link
                    className="inline-flex min-h-11 items-center justify-center border-2 border-ink bg-launch px-4 py-2 font-semibold text-ink"
                    href={`/admin/reviews/${record.id}`}
                  >
                    Отвори доказ
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
