import { requireLearnerOnboardingAccess } from "@/features/auth";
import { getOnboardingDateLimits, OnboardingForm, type OnboardingValues } from "@/features/onboarding";

export default async function OnboardingPage() {
  await requireLearnerOnboardingAccess();
  const limits = getOnboardingDateLimits();
  const targetDate = new Date();
  targetDate.setUTCDate(targetDate.getUTCDate() + 28);
  const initialValues: OnboardingValues = { displayName: "", projectTitle: "", targetUser: "", problemStatement: "", coreAction: "", nonFeatures: "", weeklyHours: "5", targetLaunchDate: targetDate.toISOString().slice(0, 10) };

  return <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,46rem)_minmax(18rem,1fr)]">
    <section className="rounded-md border border-stone-300 bg-white p-5 md:p-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Onboarding</p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink md:text-4xl">Подготви го твојот проект</h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-700">Одбери еден корисник, еден болен проблем и една главна акција. Мал scope е услов за да стигнеш до јавен тест.</p>
      <div className="mt-8"><OnboardingForm initialValues={initialValues} minimumDate={limits.minimum} maximumDate={limits.maximum} /></div>
    </section>
    <aside className="rounded-md border border-stone-300 bg-white p-5 lg:sticky lg:top-8"><p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Финиш линија</p><h2 className="mt-3 font-display text-xl font-semibold text-ink">Проект за околу четири недели</h2><ul className="mt-4 space-y-3 text-sm leading-relaxed text-stone-700"><li>Еден јасен корисник.</li><li>Еден проблем потврден со доказ.</li><li>Една главна акција што може да се тестира.</li><li>Јавен URL и реакции од реални луѓе.</li></ul></aside>
  </div>;
}
