export default function ReviewerFoundationPage() {
  return (
    <section aria-labelledby="review-queue-title">
      <div className="flex flex-col gap-5 border-b-2 border-ink pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Reviewer workspace</p>
          <h1 id="review-queue-title" className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">Ред за човечки преглед</h1>
        </div>
        <p className="max-w-md text-sm leading-relaxed text-stone-700">Доказите ќе се појават тука според време на испраќање. Ниту еден чекор не се отклучува автоматски.</p>
      </div>
      <div className="mt-8 border-y border-stone-300 py-10 text-center">
        <p className="font-display text-2xl font-semibold text-ink">Нема докази што чекаат.</p>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-stone-700">Кога ученик ќе испрати замрзната верзија, таа ќе се појави како јасен оперативен запис со состојба и време на чекање.</p>
      </div>
    </section>
  );
}
