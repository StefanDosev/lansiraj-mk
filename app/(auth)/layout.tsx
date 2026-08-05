import { BrandSignature } from "@/components/brand/brand-signature";
import { SkipLink } from "@/components/ui/skip-link";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SkipLink />
      <header className="container-product flex min-h-16 items-center">
        <BrandSignature />
      </header>
      <main id="main-content" tabIndex={-1} className="container-product grid flex-1 place-items-center py-8 md:py-12">
        <div className="w-full max-w-lg">{children}</div>
      </main>
    </div>
  );
}
