import Link from "next/link";

type RouteNotFoundStateProps = {
  eyebrow?: string;
  href: string;
  linkLabel: string;
  message: string;
  title: string;
};

export function RouteNotFoundState({
  eyebrow = "Нема содржина",
  href,
  linkLabel,
  message,
  title,
}: RouteNotFoundStateProps) {
  return (
    <section className="border-y-2 border-ink py-8" aria-labelledby="route-not-found-title">
      <p className="text-xs font-semibold uppercase tracking-widest text-cobalt">{eyebrow}</p>
      <h1 id="route-not-found-title" className="mt-3 font-display text-3xl font-semibold leading-tight text-ink">
        {title}
      </h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-stone-700">{message}</p>
      <Link
        className="pressable mt-6 inline-flex min-h-11 items-center border-2 border-ink bg-launch px-5 py-2.5 font-semibold text-ink"
        href={href}
      >
        {linkLabel}
      </Link>
    </section>
  );
}
