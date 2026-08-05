import Link from "next/link";

const stages = [
  "Истражи",
  "Намали",
  "Дизајнирај",
  "Изгради",
  "Тестирај",
  "Лансирај",
];

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1} className="flex-1">
      <section className="bg-launch py-16 md:py-24">
        <div className="container-public grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-ink">
              Четири недели · еден мал проект · реален доказ
            </p>
            <h1 className="max-w-5xl font-display text-[clamp(2.625rem,8vw,5.5rem)] font-semibold leading-[0.98] text-ink">
              Престани да собираш туторијали. Лансирај.
            </h1>
          </div>
          <div className="border-2 border-ink bg-white p-5">
            <p className="text-lg leading-relaxed text-ink">
              Јасна задача, доказ од твојата работа и конкретен човечки
              feedback пред да го отклучиш следниот чекор.
            </p>
            <Link
              href="/auth/sign-in"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-sm border-2 border-ink bg-ink px-5 py-2.5 font-semibold text-white transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
            >
              Пријави се за beta
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="journey-title" className="bg-canvas py-16 md:py-24">
        <div className="container-public">
          <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">
            Систем, не уште еден курс
          </p>
          <h2
            id="journey-title"
            className="mt-3 max-w-3xl font-display text-3xl font-semibold leading-tight text-ink md:text-5xl"
          >
            Шест фази до мал јавен тест.
          </h2>
          <ol className="mt-10 grid gap-px border-2 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-3">
            {stages.map((stage, index) => (
              <li key={stage} className="bg-white p-5">
                <span className="font-display text-sm font-semibold text-cobalt">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-8 text-xl font-semibold text-ink">{stage}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </main>
  );
}
