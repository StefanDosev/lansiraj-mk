import { BrandSignature } from "@/components/brand/brand-signature";
import { SkipLink } from "@/components/ui/skip-link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="paper-grid flex min-h-dvh flex-col bg-canvas">
      <SkipLink />
      <header className="border-b-2 border-ink bg-launch">
        <div className="container-product flex min-h-16 items-center justify-between gap-4">
          <BrandSignature />
          <p className="hidden text-sm font-semibold text-ink sm:block">Без лозинка · само со покана</p>
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="container-product grid flex-1 items-center gap-8 py-10 lg:grid-cols-[minmax(0,36rem)_minmax(18rem,1fr)] lg:py-16">
        <div className="w-full">{children}</div>
        <aside className="hidden border-l-2 border-ink pl-8 lg:block" aria-label="Како работи пристапот">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cobalt">Пристап до beta</p>
          <p className="mt-4 font-display text-3xl font-semibold leading-tight text-ink">Еден линк. Еден фокусиран проект.</p>
          <ol className="mt-8 divide-y divide-stone-300 border-y-2 border-ink text-sm text-stone-700">
            <li className="grid grid-cols-[2rem_1fr] gap-3 py-4"><span className="font-display font-semibold text-cobalt">01</span><span>Внеси ја поканетата адреса.</span></li>
            <li className="grid grid-cols-[2rem_1fr] gap-3 py-4"><span className="font-display font-semibold text-cobalt">02</span><span>Отвори го еднократниот magic link.</span></li>
            <li className="grid grid-cols-[2rem_1fr] gap-3 py-4"><span className="font-display font-semibold text-cobalt">03</span><span>Продолжи точно каде што застана.</span></li>
          </ol>
        </aside>
      </main>
    </div>
  );
}
