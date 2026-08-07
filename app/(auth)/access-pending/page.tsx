import { redirect } from "next/navigation";

import { getAccessDestination, getAccessState, SignOutButton } from "@/features/auth";

export default async function AccessPendingPage() {
  const state = await getAccessState();
  if (!state.isAuthenticated) redirect("/auth/sign-in");
  if (state.isReviewer || state.hasActiveMembership) redirect(getAccessDestination(state));

  return (
    <section className="rounded-md border border-stone-300 bg-white p-5 md:p-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-cobalt">Пристап на проверка</p>
      <h1 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink">
        Сè уште немаш активна покана
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-700">
        Најавата е успешна, но оваа адреса не е поврзана со активна beta група. Контактирај го рецензентот ако очекуваш пристап.
      </p>
      <div className="mt-6 border-t border-stone-200 pt-4">
        <SignOutButton />
      </div>
    </section>
  );
}
