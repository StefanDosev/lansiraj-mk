"use client";

import { RouteErrorState } from "@/components/ui/route-error-state";

export default function ReviewerError({
  unstable_retry,
}: Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>) {
  return (
    <RouteErrorState
      title="Reviewer workspace не може да се вчита."
      message="Обиди се повторно. Ниту еден доказ или статус не е променет."
      onRetry={unstable_retry}
    />
  );
}
