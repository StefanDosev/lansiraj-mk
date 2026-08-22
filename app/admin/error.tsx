"use client";

export default function ReviewerError({
  unstable_retry,
}: Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>) {
  return (
    <section className="border-y-2 border-coral py-8" aria-labelledby="reviewer-error-title">
      <p className="text-xs font-semibold uppercase tracking-widest text-coral">Привремена грешка</p>
      <h1 id="reviewer-error-title" className="mt-3 font-display text-3xl font-semibold text-ink">
        Reviewer workspace не може да се вчита.
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone-700">
        Обиди се повторно. Ниту еден доказ или статус не е променет.
      </p>
      <button
        className="mt-6 min-h-11 border-2 border-ink bg-launch px-5 py-2.5 font-semibold text-ink"
        type="button"
        onClick={() => unstable_retry()}
      >
        Обиди се повторно
      </button>
    </section>
  );
}
