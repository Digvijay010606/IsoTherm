export function LogoMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      className={className}
    >
      <g fill="none" strokeWidth={2.8} strokeLinecap="round">
        <ellipse
          cx="15.4"
          cy="17"
          rx="11"
          ry="8"
          transform="rotate(-16 15.4 17)"
          stroke="var(--accent)"
        />
        <ellipse
          cx="16.4"
          cy="15.6"
          rx="6.4"
          ry="4.4"
          transform="rotate(-16 16.4 15.6)"
          stroke="var(--heat-2)"
        />
      </g>
      <ellipse
        cx="17.2"
        cy="14.6"
        rx="2.7"
        ry="2.1"
        transform="rotate(-16 17.2 14.6)"
        fill="var(--heat-4)"
      />
    </svg>
  );
}
