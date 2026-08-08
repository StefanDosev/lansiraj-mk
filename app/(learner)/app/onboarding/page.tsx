import { requireLearnerOnboardingAccess } from "@/features/auth";

export default async function OnboardingCheckpointPage() {
  await requireLearnerOnboardingAccess();

  return (
    <section className="max-w-3xl rounded-md border border-stone-300 bg-white p-5 md:p-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Следен чекор</p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink">
        Подготви го твојот проект
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-700">
        Пристапот е потврден. Формата за профил и ограничување на проектот ќе биде изградена во фазата за onboarding.
      </p>
    </section>
  );
}
