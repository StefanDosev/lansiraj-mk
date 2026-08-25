"use client";

import { RouteErrorState } from "@/components/ui/route-error-state";

export default function LearnerError({
  unstable_retry,
}: Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>) {
  return (
    <RouteErrorState
      title="Работниот простор не може да се вчита."
      message="Обиди се повторно. Ниту еден доказ, одговор или статус не е променет."
      onRetry={unstable_retry}
    />
  );
}
