"use client";

import { useActionState } from "react";

import { startProject } from "@/features/projects/projects.actions";
import type { StartProjectState } from "@/features/projects/projects.types";

const initialState: StartProjectState = { status: "idle" };

export function StartProjectForm() {
  const [state, action, pending] = useActionState(startProject, initialState);

  return (
    <form action={action}>
      {state.status === "error" ? (
        <div role="alert" className="mb-4 border-l-4 border-coral bg-white p-4 text-sm leading-relaxed text-ink">
          <p className="font-semibold">Проектот не е започнат</p>
          <p className="mt-1">{state.message}</p>
        </div>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="pressable inline-flex min-h-11 w-full items-center justify-center rounded-sm border-2 border-ink bg-launch px-5 py-2.5 font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Го започнуваме…" : "Започни го проектот"}
      </button>
    </form>
  );
}
