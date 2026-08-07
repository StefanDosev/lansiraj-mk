import Link from "next/link";

import { BrandSignature } from "@/components/brand/brand-signature";
import { SkipLink } from "@/components/ui/skip-link";
import { requireReviewerAccess, SignOutButton } from "@/features/auth";

export default async function ReviewerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireReviewerAccess();

  return (
    <div className="flex min-h-dvh flex-col bg-ink text-white">
      <SkipLink />
      <header className="border-b border-stone-700">
        <div className="container-product flex min-h-16 items-center justify-between gap-4">
          <BrandSignature inverse />
          <nav aria-label="Reviewer навигација" className="flex items-center gap-3">
            <Link href="/admin" className="text-sm font-semibold text-white" aria-current="page">
              Преглед
            </Link>
            <SignOutButton inverse />
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="container-product flex-1 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
