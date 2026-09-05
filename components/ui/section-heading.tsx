type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  description?: string;
  id?: string;
  inverse?: boolean;
};

export function SectionHeading({ eyebrow, title, description, id, inverse = false }: SectionHeadingProps) {
  return (
    <header className="max-w-4xl">
      <p className={`text-xs font-semibold uppercase tracking-[0.18em] ${inverse ? "text-acid" : "text-cobalt"}`}>
        {eyebrow}
      </p>
      <h2 id={id} className={`mt-3 font-display text-3xl font-semibold leading-[1.05] md:text-5xl ${inverse ? "text-white" : "text-ink"}`}>
        {title}
      </h2>
      {description ? (
        <p className={`mt-5 max-w-2xl text-lg leading-relaxed ${inverse ? "text-stone-200" : "text-stone-700"}`}>
          {description}
        </p>
      ) : null}
    </header>
  );
}
