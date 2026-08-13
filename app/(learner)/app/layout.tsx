import Link from "next/link";

import { BrandSignature } from "@/components/brand/brand-signature";
import { SkipLink } from "@/components/ui/skip-link";
import { requireLearnerAccess, SignOutButton } from "@/features/auth";

export default async function LearnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireLearnerAccess();

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SkipLink />
      <header className="border-b-2 border-ink bg-white">
        <div className="container-product flex min-h-16 flex-wrap items-center justify-between gap-x-5 gap-y-2 py-2">
          <BrandSignature />
          <nav aria-label="Работен простор" className="flex items-center gap-1 text-sm font-semibold sm:gap-3">
            <Link href="/app" className="inline-flex min-h-11 items-center px-2 text-cobalt">
              Тековна задача
            </Link>
            <Link href="/app/project" className="inline-flex min-h-11 items-center px-2 text-ink">
              Проект
            </Link>
            <SignOutButton />
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="container-product flex-1 py-8 md:py-14">
        {children}
      </main>
    </div>
  );
}
