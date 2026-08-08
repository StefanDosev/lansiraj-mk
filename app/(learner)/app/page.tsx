import { requireCompletedLearnerAccess } from "@/features/auth";

export default async function LearnerFoundationPage() {
  await requireCompletedLearnerAccess();

  return (
    <section className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">
        Работен простор
      </p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-5xl">
        Тековната задача ќе живее овде.
      </h1>
      <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-700">
        Оваа основа го поставува мирниот learner shell. Содржината се отклучува
        откако ќе се поврзат проектот и наставната програма.
      </p>
    </section>
  );
}
