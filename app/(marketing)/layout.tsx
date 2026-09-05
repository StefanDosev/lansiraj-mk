import Link from "next/link";

import { BrandSignature } from "@/components/brand/brand-signature";
import { SkipLink } from "@/components/ui/skip-link";

export default function MarketingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-canvas">
      <SkipLink />
      <header className="pointer-events-none fixed inset-x-0 top-0 z-[var(--z-sticky)] px-4 pt-4 md:px-8 md:pt-6">
        <div className="pointer-events-auto mx-auto flex min-h-14 max-w-4xl items-center justify-between gap-4 border-2 border-ink bg-white px-3 shadow-[0.3rem_0.3rem_0_var(--color-cobalt)] md:px-4">
          <BrandSignature />
          <nav aria-label="Главна навигација" className="flex items-center gap-1 text-sm font-semibold md:gap-4">
            <Link href="/#process" className="hidden min-h-11 min-w-11 items-center justify-center px-2 text-ink lg:inline-flex">Процес</Link>
            <Link href="/#stages" className="hidden min-h-11 min-w-11 items-center justify-center px-2 text-ink lg:inline-flex">Патека</Link>
            <Link href="/#faq" className="hidden min-h-11 min-w-11 items-center justify-center px-2 text-ink lg:inline-flex">FAQ</Link>
            <Link href="/auth/sign-in" className="inline-flex min-h-11 items-center border-2 border-ink bg-launch px-3 text-ink sm:border-0 sm:bg-transparent sm:px-2">
              <span className="sm:hidden">Пријави се</span><span className="hidden sm:inline">Најави се</span>
            </Link>
            <Link href="/auth/sign-in" className="pressable hidden min-h-11 items-center border-2 border-ink bg-launch px-4 text-ink sm:inline-flex">
              Аплицирај <span aria-hidden="true" className="ml-2">↗</span>
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="relative z-base border-t-2 border-ink bg-ink py-10 text-[var(--text-inverse)]">
        <div className="container-public grid gap-8 sm:grid-cols-2 sm:items-end">
          <div>
            <BrandSignature inverse />
            <p className="mt-4 max-w-md opacity-75">Од идеја до проект во живо — со доказ за секој следен чекор.</p>
          </div>
          <div className="text-sm opacity-75 sm:text-right">
            <Link href="/privacy" className="inline-flex min-h-11 min-w-11 items-center justify-center underline underline-offset-4 sm:justify-end">Приватност</Link>
            <p className="mt-3">© 2026 lansiraj.mk · Скопје</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
