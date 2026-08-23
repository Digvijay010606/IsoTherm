type ChipProps = {
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
};

export function Chip({ active = false, disabled = false, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`min-h-[40px] whitespace-nowrap rounded-full border px-4 py-2 text-[13px] transition-colors ${
        active
          ? "border-accent bg-accent font-semibold text-accent-ink"
          : disabled
            ? "cursor-not-allowed border-line-soft text-ink-4"
            : "border-line text-ink-2 hover:border-ink-4"
      }`}
    >
      {children}
    </button>
  );
}
