import { ProofArtifact } from "@/components/ui/proof-artifact";
import { requireLearnerOnboardingAccess } from "@/features/auth";
import { getOnboardingDateLimits, OnboardingForm, type OnboardingValues } from "@/features/onboarding";

export default async function OnboardingPage() {
  await requireLearnerOnboardingAccess();
  const limits = getOnboardingDateLimits();
  const targetDate = new Date();
  targetDate.setUTCDate(targetDate.getUTCDate() + 28);
  const initialValues: OnboardingValues = { displayName: "", projectTitle: "", targetUser: "", problemStatement: "", coreAction: "", nonFeatures: "", weeklyHours: "5", targetLaunchDate: targetDate.toISOString().slice(0, 10) };

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,46rem)_minmax(18rem,1fr)]">
      <section>
        <header className="border-b-2 border-ink pb-7">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Поставување · Чекор 01 од 01</p>
          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.04] text-ink md:text-5xl">Подготви го твојот проект</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-stone-700">Одбери еден корисник, еден болен проблем и една главна акција. Мал scope е услов за да стигнеш до јавен тест.</p>
        </header>
        <div className="mt-8 bg-white p-5 md:p-7"><OnboardingForm initialValues={initialValues} minimumDate={limits.minimum} maximumDate={limits.maximum} /></div>
      </section>
      <aside className="space-y-6 lg:sticky lg:top-24">
        <ProofArtifact label="Финиш линија" variant="launch" className="proof-shadow">
          <h2 className="font-display text-xl font-semibold text-ink">Проект за околу четири недели</h2>
          <ul className="mt-5 space-y-3 text-sm leading-relaxed text-ink">
            <li>✓ Еден јасен корисник.</li><li>✓ Еден проблем потврден со доказ.</li><li>✓ Една главна акција што може да се тестира.</li><li>✓ Јавен URL и реакции од реални луѓе.</li>
          </ul>
        </ProofArtifact>
        <div className="border-l-4 border-coral pl-4 text-sm leading-relaxed text-stone-700"><strong className="text-ink">Scope правило:</strong> ако нешто не е неопходно за главната акција, запиши го во листата „нема да градам“.</div>
      </aside>
    </div>
  );
}
