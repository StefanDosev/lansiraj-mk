import { signOut } from "@/features/auth/auth.actions";

export function SignOutButton({ inverse = false }: { inverse?: boolean }) {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className={`min-h-11 rounded-sm px-3 text-sm font-semibold ${inverse ? "text-white" : "text-ink"}`}
      >
        Одјави се
      </button>
    </form>
  );
}
