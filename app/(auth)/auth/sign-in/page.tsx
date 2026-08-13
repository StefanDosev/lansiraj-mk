import { redirect } from "next/navigation";

import { getAccessDestination, getAccessState, MagicLinkForm } from "@/features/auth";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [state, params] = await Promise.all([getAccessState(), searchParams]);
  if (state.isAuthenticated) redirect(getAccessDestination(state));

  return (
    <section className="bg-white p-5 shadow-overlay md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Пристап до beta · Чекор 01</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.05] text-ink">
        Најави се во Лансирај
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-700">
        Внеси ја адресата со која си поканет. Ќе добиеш еднократен линк за безбедна најава.
      </p>
      {params.status === "callback-error" ? (
        <p role="alert" className="mt-5 border-l-4 border-coral bg-canvas p-4 text-sm leading-relaxed text-ink">
          Линкот не може да се потврди. Побарај нов и обиди се повторно.
        </p>
      ) : null}
      <MagicLinkForm />
    </section>
  );
}
