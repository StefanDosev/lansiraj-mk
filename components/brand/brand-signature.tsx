import Link from "next/link";

type BrandSignatureProps = {
  inverse?: boolean;
};

export function BrandSignature({ inverse = false }: BrandSignatureProps) {
  return (
    <Link
      href="/"
      className={`inline-flex min-h-11 items-center font-display text-sm font-semibold tracking-tight ${
        inverse ? "text-white" : "text-ink"
      }`}
      aria-label="Лансирај — почетна страница"
    >
      lansiraj.mk
    </Link>
  );
}
