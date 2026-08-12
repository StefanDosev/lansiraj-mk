import { requireCompletedLearnerAccess } from "@/features/auth";
import { getCurrentProject, StartProjectForm } from "@/features/projects";

export default async function LearnerFoundationPage() {
  await requireCompletedLearnerAccess();
  const project = await getCurrentProject();

  if (project.status === "active") {
    const currentAssignment = project.assignments.find((item) => item.state === "available");

    return (
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,46rem)_minmax(18rem,1fr)]">
        <section className="rounded-md border border-stone-300 bg-white p-5 md:p-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Проектот е започнат</p>
          <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">{project.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-stone-700">
            Сите десет задачи се подготвени. Првата е отклучена, а секоја следна ќе стане достапна по одобрен доказ.
          </p>
          {currentAssignment ? (
            <div className="mt-8 rounded-md border-2 border-ink bg-white p-4 md:p-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">
                Задача {String(currentAssignment.assignment.position).padStart(2, "0")}
              </p>
              <h2 className="mt-2 font-display text-xl font-semibold leading-snug text-ink">
                {currentAssignment.assignment.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-stone-700">
                Деталните насоки и формата за доказ ќе бидат додадени во следната фаза.
              </p>
            </div>
          ) : null}
        </section>
        <aside className="rounded-md border border-stone-300 bg-stone-100 p-5 lg:sticky lg:top-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Патека v1</p>
          <p className="mt-3 font-display text-2xl font-semibold text-ink">1 од 10 задачи е достапна</p>
          <p className="mt-3 text-sm leading-relaxed text-stone-700">Следната задача се отклучува само по човечки преглед и одобрување.</p>
        </aside>
      </div>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,46rem)_minmax(18rem,1fr)]">
      <section className="rounded-md border border-stone-300 bg-white p-5 md:p-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Подготвено за почеток</p>
        <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">{project.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-stone-700">
          Провери ја насоката што ја зачува. Кога ќе го започнеш проектот, ќе се подготват десетте задачи и ќе се отклучи првата.
        </p>

        <dl className="mt-8 space-y-6 border-y border-stone-200 py-6">
          <div>
            <dt className="text-sm font-semibold text-ink">Корисник</dt>
            <dd className="mt-1 leading-relaxed text-stone-700">{project.targetUser}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink">Болен проблем</dt>
            <dd className="mt-1 leading-relaxed text-stone-700">{project.problemStatement}</dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink">Главна акција</dt>
            <dd className="mt-1 leading-relaxed text-stone-700">{project.coreAction}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <StartProjectForm />
        </div>
      </section>
      <aside className="rounded-md border border-stone-300 bg-stone-100 p-5 lg:sticky lg:top-8">
        <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Што следува</p>
        <h2 className="mt-3 font-display text-xl font-semibold text-ink">Десет докази до јавен тест</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-700">
          <li>Само Задача 01 ќе биде достапна.</li>
          <li>Следниот чекор се отклучува по одобрен доказ.</li>
          <li>Започнувањето не го менува зачуваниот scope.</li>
        </ul>
      </aside>
    </div>
  );
}
