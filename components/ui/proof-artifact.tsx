import type { ReactNode } from "react";

type ProofArtifactProps = {
  children: ReactNode;
  className?: string;
  label?: string;
  variant?: "paper" | "launch" | "cobalt" | "acid";
};

const variants = {
  paper: "bg-white text-ink",
  launch: "bg-launch text-ink",
  cobalt: "bg-cobalt text-white",
  acid: "bg-acid text-ink",
} as const;

export function ProofArtifact({
  children,
  className = "",
  label,
  variant = "paper",
}: ProofArtifactProps) {
  return (
    <article
      className={`relative border-2 border-ink p-5 ${variants[variant]} ${className}`}
      data-proof-variant={variant}
    >
      {label ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.16em] opacity-75">{label}</p>
      ) : null}
      {children}
    </article>
  );
}
