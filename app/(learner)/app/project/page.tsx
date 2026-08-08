import { requireCompletedLearnerAccess } from "@/features/auth";

export default async function ProjectFoundationPage() {
  await requireCompletedLearnerAccess();

  return (
    <section className="max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Проект</p>
      <h1 className="mt-3 font-display text-3xl font-semibold text-ink">Опсег на проектот</h1>
      <p className="mt-4 text-lg text-stone-700">Резимето на ограничениот проект ќе биде додадено во Фаза 2.</p>
    </section>
  );
}
