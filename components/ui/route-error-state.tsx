"use client";

type RouteErrorStateProps = {
  eyebrow?: string;
  message: string;
  onRetry: () => void;
  title: string;
};

export function RouteErrorState({
  eyebrow = "Привремена грешка",
  message,
  onRetry,
  title,
}: RouteErrorStateProps) {
  return (
    <section className="border-y-2 border-coral py-8" aria-labelledby="route-error-title">
      <p className="text-xs font-semibold uppercase tracking-widest text-coral">{eyebrow}</p>
      <h1 id="route-error-title" className="mt-3 font-display text-3xl font-semibold leading-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone-700">{message}</p>
      <button
        className="pressable mt-6 min-h-11 border-2 border-ink bg-launch px-5 py-2.5 font-semibold text-ink"
        type="button"
        onClick={onRetry}
      >
        Обиди се повторно
      </button>
    </section>
  );
}
