import Image, { type StaticImageData } from "next/image";

type IllustrationFrameProps = {
  alt: string;
  className?: string;
  caption?: string;
  eager?: boolean;
  src: StaticImageData;
};

export function IllustrationFrame({ alt, className = "", caption, eager = false, src }: IllustrationFrameProps) {
  return (
    <figure className={`overflow-hidden border-2 border-ink bg-white ${className}`}>
      <Image src={src} alt={alt} className="h-auto w-full" loading={eager ? "eager" : "lazy"} sizes="(min-width: 1024px) 40vw, 100vw" />
      {caption ? (
        <figcaption className="border-t-2 border-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-ink">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
