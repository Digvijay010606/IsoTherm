import { InfoIcon } from "./icons";

type PendingProps = {
  reason: string;
  compact?: boolean;
};

export function Pending({ reason, compact = false }: PendingProps) {
  if (compact) {
    return (
      <span className="font-mono text-[13px] text-ink-4">— pending</span>
    );
  }

  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-dashed border-line px-3.5 py-3">
      <InfoIcon size={15} className="mt-0.5 shrink-0 text-ink-4" />
      <p className="text-[12px] leading-relaxed text-ink-3 text-pretty">
        Not yet available. {reason}
      </p>
    </div>
  );
}
