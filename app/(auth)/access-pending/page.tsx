import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getAccessDestination, getAccessState, SignOutButton } from "@/features/auth";

export const metadata: Metadata = {
  title: "Пристап во исчекување",
};

export default async function AccessPendingPage() {
  const state = await getAccessState();
  if (!state.isAuthenticated) redirect("/auth/sign-in");
  if (state.isReviewer || state.hasActiveMembership) redirect(getAccessDestination(state));

  return (
    <section className="bg-white p-5 shadow-overlay md:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Пристап на проверка · Чекор 02</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink">
        Сè уште немаш активна покана
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-stone-700">
        Најавата е успешна, но оваа адреса не е поврзана со активна beta група. Контактирај го рецензентот ако очекуваш пристап.
      </p>
      <div className="mt-8 border-t-2 border-ink pt-5">
        <SignOutButton />
      </div>
    </section>
  );
}
