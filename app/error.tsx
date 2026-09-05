"use client";

import { RouteErrorState } from "@/components/ui/route-error-state";

export default function AppError({
  unstable_retry,
}: Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>) {
  return (
    <main className="container-product flex min-h-dvh items-center py-10">
      <div className="w-full">
        <RouteErrorState
          title="Страницата не може да се вчита."
          message="Ништо не е променето. Обиди се повторно или врати се подоцна."
          onRetry={unstable_retry}
        />
      </div>
    </main>
  );
}
