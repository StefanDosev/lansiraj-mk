import { CohortSnapshot } from "@/features/reviews/components/cohort-snapshot";
import { ReviewerQueue } from "@/features/reviews/components/reviewer-queue";
import { getReviewerWorkspace } from "@/features/reviews/reviews.queries";

type ReviewerWorkspacePageProps = {
  searchParams: Promise<{ reviewed?: string | string[] }>;
};

export default async function ReviewerWorkspacePage({ searchParams }: ReviewerWorkspacePageProps) {
  const workspacePromise = getReviewerWorkspace();
  const query = await searchParams;
  const now = new Date();
  const workspace = await workspacePromise;
  const reviewed = typeof query.reviewed === "string" ? query.reviewed : null;
  const successMessage = reviewed === "approved"
    ? "Одлуката е зачувана. Задачата е одобрена."
    : reviewed === "revision_required"
      ? "Одлуката е зачувана. Побарана е ревизија."
      : null;

  return (
    <div>
      <header className="flex flex-col gap-5 border-b-2 border-ink pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-cobalt">Reviewer workspace</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">
            Ред за човечки преглед
          </h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-stone-700">
          Најстарите испраќања се први. Напредокот се менува само по човечка одлука врз точната замрзната верзија.
        </p>
      </header>

      {successMessage ? (
        <div role="status" className="mt-7 border-l-4 border-cobalt bg-stone-100 p-4 text-ink">
          <p className="font-semibold">Прегледот е завршен</p>
          <p className="mt-1 text-sm leading-relaxed">{successMessage}</p>
        </div>
      ) : null}

      <div className="mt-9 space-y-14">
        <ReviewerQueue records={workspace.queue} now={now} />
        <CohortSnapshot cohorts={workspace.cohorts} />
      </div>
    </div>
  );
}
