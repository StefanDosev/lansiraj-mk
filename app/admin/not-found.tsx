import Link from "next/link";

export default function ReviewerNotFound() {
  return (
    <section className="border-y-2 border-ink py-8" aria-labelledby="reviewer-not-found-title">
      <p className="text-xs font-semibold uppercase tracking-widest text-cobalt">Нема запис</p>
      <h1 id="reviewer-not-found-title" className="mt-3 font-display text-3xl font-semibold text-ink">
        Овој reviewer запис не постои.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone-700">
        Линкот може да е невалиден или записот повеќе да не е достапен во твојот reviewer опсег.
      </p>
      <Link className="mt-6 inline-flex min-h-11 items-center border-2 border-ink bg-launch px-5 py-2.5 font-semibold text-ink" href="/admin">
        Назад кон редот
      </Link>
    </section>
  );
}
