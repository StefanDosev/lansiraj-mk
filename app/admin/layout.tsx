import Link from "next/link";
import { BrandSignature } from "@/components/brand/brand-signature";
import { SkipLink } from "@/components/ui/skip-link";

export default function ReviewerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-ink text-white">
      <SkipLink />
      <header className="border-b border-stone-700">
        <div className="container-product flex min-h-16 items-center justify-between gap-4">
          <BrandSignature inverse />
          <nav aria-label="Reviewer навигација">
            <Link href="/admin" className="text-sm font-semibold text-white" aria-current="page">
              Преглед
            </Link>
          </nav>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="container-product flex-1 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
