"use client";

import { RouteErrorState } from "@/components/ui/route-error-state";
import "./globals.css";

export default function GlobalError({
  unstable_retry,
}: Readonly<{
  error: Error & { digest?: string };
  unstable_retry: () => void;
}>) {
  return (
    <html lang="mk">
      <body className="bg-canvas text-ink">
        <title>Грешка | Лансирај</title>
        <main className="container-product flex min-h-dvh items-center py-10">
          <div className="w-full">
            <RouteErrorState
              title="Лансирај не може да се вчита."
              message="Ништо не е променето. Обиди се повторно или врати се подоцна."
              onRetry={unstable_retry}
            />
          </div>
        </main>
      </body>
    </html>
  );
}
