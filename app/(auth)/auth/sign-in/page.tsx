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
    <section className="rounded-md border border-stone-300 bg-white p-5 md:p-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Пристап до beta</p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink">
        Најави се во Лансирај
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-700">
        Внеси ја адресата со која си поканет. Ќе добиеш еднократен линк за безбедна најава.
      </p>
      {params.status === "callback-error" ? (
        <p role="alert" className="mt-4 border-l-4 border-coral pl-3 text-sm leading-relaxed text-ink">
          Линкот не може да се потврди. Побарај нов и обиди се повторно.
        </p>
      ) : null}
      <MagicLinkForm />
    </section>
  );
}
