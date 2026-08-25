import type { Metadata } from "next";

import { BrandSignature } from "@/components/brand/brand-signature";
import { RouteNotFoundState } from "@/components/ui/route-not-found-state";
import { SkipLink } from "@/components/ui/skip-link";

export const metadata: Metadata = {
  title: "Страницата не е пронајдена",
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SkipLink />
      <header className="border-b-2 border-ink bg-white">
        <div className="container-product flex min-h-16 items-center">
          <BrandSignature />
        </div>
      </header>
      <main id="main-content" tabIndex={-1} className="container-product flex flex-1 items-center py-10">
        <div className="w-full">
          <RouteNotFoundState
            eyebrow="404 · Нема страница"
            title="Оваа адреса не води до достапна страница."
            message="Провери ја адресата или продолжи од почетната страница."
            href="/"
            linkLabel="Кон почетната страница"
          />
        </div>
      </main>
    </div>
  );
}
