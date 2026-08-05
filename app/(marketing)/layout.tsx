import Link from "next/link";
import { BrandSignature } from "@/components/brand/brand-signature";
import { SkipLink } from "@/components/ui/skip-link";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SkipLink />
      <header className="border-b border-ink bg-launch">
        <div className="container-public flex min-h-16 items-center justify-between gap-4">
          <BrandSignature />
          <nav aria-label="Главна навигација" className="flex items-center gap-2">
            <Link
              href="/auth/sign-in"
              className="inline-flex min-h-11 items-center rounded-sm border-2 border-ink px-4 font-semibold text-ink transition-transform hover:-translate-y-0.5 motion-reduce:transform-none"
            >
              Најави се
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-auto border-t border-ink bg-canvas py-6">
        <div className="container-public flex flex-wrap items-center justify-between gap-3 text-sm text-stone-700">
          <span>Од идеја до проект во живо.</span>
          <span>© 2026 lansiraj.mk</span>
        </div>
      </footer>
    </>
  );
}
