type StatusMarkerProps = {
  label: string;
  tone: "neutral" | "active" | "revision" | "approved" | "inverse";
};

const tones = {
  neutral: "border-stone-300 bg-stone-100 text-stone-700",
  active: "border-cobalt bg-white text-cobalt",
  revision: "border-coral bg-white text-ink",
  approved: "border-ink bg-acid text-ink",
  inverse: "border-stone-700 bg-ink text-white",
} as const;

export function StatusMarker({ label, tone }: StatusMarkerProps) {
  return (
    <span className={`inline-flex min-h-8 items-center border px-3 py-1 text-sm font-semibold ${tones[tone]}`} data-status-tone={tone}>
      {label}
    </span>
  );
}
