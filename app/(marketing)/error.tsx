"use client";

import { RouteErrorState } from "@/components/ui/route-error-state";

export default function MarketingError({
  unstable_retry,
}: Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>) {
  return (
    <main id="main-content" className="container-public min-h-[70dvh] pt-32 pb-16 md:pt-40">
      <RouteErrorState
        title="Јавната страница не може да се вчита."
        message="Обиди се повторно. Ниту една пријава или работна содржина не е променета."
        onRetry={unstable_retry}
      />
    </main>
  );
}
