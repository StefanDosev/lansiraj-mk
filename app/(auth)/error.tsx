"use client";

import { RouteErrorState } from "@/components/ui/route-error-state";

export default function AuthError({
  unstable_retry,
}: Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>) {
  return (
    <RouteErrorState
      title="Најавата не може да се вчита."
      message="Обиди се повторно. За нов пристап секогаш можеш да побараш нов безбеден линк."
      onRetry={unstable_retry}
    />
  );
}
