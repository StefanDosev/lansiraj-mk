import Link from "next/link";

import { BrandSignature } from "@/components/brand/brand-signature";
import { SkipLink } from "@/components/ui/skip-link";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SkipLink />
      <header className="sticky top-0 z-sticky border-b-2 border-ink bg-launch">
        <div className="container-public flex min-h-16 items-center justify-between gap-5">
          <BrandSignature />
          <nav aria-label="Главна навигација" className="flex items-center gap-1 text-sm font-semibold md:gap-5">
            <a href="#how-it-works" className="hidden min-h-11 items-center text-ink lg:inline-flex">Како работи</a>
            <a href="#for-who" className="hidden min-h-11 items-center text-ink lg:inline-flex">За кого е</a>
            <a href="#faq" className="hidden min-h-11 items-center text-ink lg:inline-flex">FAQ</a>
            <Link href="/auth/sign-in" className="inline-flex min-h-11 items-center px-2 text-ink sm:px-3">Најави се</Link>
            <Link href="/auth/sign-in" className="pressable hidden min-h-11 items-center border-2 border-ink bg-ink px-4 text-white sm:inline-flex">Аплицирај за beta →</Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-auto border-t-2 border-ink bg-ink py-8 text-white">
        <div className="container-public grid gap-4 text-sm text-stone-200 sm:grid-cols-2 sm:items-end">
          <div><BrandSignature inverse /><p className="mt-3">Од идеја до проект во живо.</p></div>
          <p className="sm:text-right">© 2026 lansiraj.mk · Скопје</p>
        </div>
      </footer>
    </div>
  );
}
