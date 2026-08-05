import Link from "next/link";
import { BrandSignature } from "@/components/brand/brand-signature";
import { SkipLink } from "@/components/ui/skip-link";

export default function LearnerLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SkipLink />
      <header className="border-b border-stone-300 bg-white">
        <div className="container-product flex min-h-16 items-center justify-between gap-4">
          <BrandSignature />
          <nav aria-label="Работен простор" className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/app" className="text-cobalt" aria-current="page">
              Тековна задача
            </Link>
            <Link href="/app/project" className="text-ink">
              Проект
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
