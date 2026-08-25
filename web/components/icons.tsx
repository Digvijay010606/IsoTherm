type IconProps = {
  size?: number;
  className?: string;
};

export function PinIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

export function WarningIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 3 L22 20 H2 Z" />
      <path d="M12 10v4" />
      <path d="M12 17v.01" />
    </svg>
  );
}

export function DropIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="currentColor" className={props.className}>
      <path d="M12 2.6c0 0 6.6 6.9 6.6 11.1a6.6 6.6 0 1 1-13.2 0C5.4 9.5 12 2.6 12 2.6z" />
    </svg>
  );
}

export function SnowIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 2.4v19.2" />
      <path d="M3.7 7.2 20.3 16.8" />
      <path d="M20.3 7.2 3.7 16.8" />
      <path d="M9.2 4.4 12 7.2l2.8-2.8" />
      <path d="M9.2 19.6 12 16.8l2.8 2.8" />
    </svg>
  );
}

export function UmbrellaIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M2.6 12a9.4 9.4 0 0 1 18.8 0z" fill="currentColor" stroke="none" />
      <path d="M12 12v7.4" />
    </svg>
  );
}

export function MedicalIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3.2} strokeLinecap="round" className={props.className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 7.6v.01" />
    </svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M5 12h13" />
      <path d="M12.5 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M4.5 12.5 10 18 19.5 7" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="11" cy="11" r="7" />
      <path d="M16.2 16.2 21 21" />
    </svg>
  );
}

export function ClockLineIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5V12l4 2" />
    </svg>
  );
}

export function CameraIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M3 8.5h3.5L8 6h8l1.5 2.5H21v10.5H3z" />
      <circle cx="12" cy="13" r="3.3" />
    </svg>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M12 2.8 20 6v6.2c0 4.4-3.3 7.4-8 9-4.7-1.6-8-4.6-8-9V6z" />
    </svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M2.5 7.5 9 4.5l6 3 6.5-3v12L15 19.5l-6-3-6.5 3z" />
      <path d="M9 4.5v12" />
      <path d="M15 7.5v12" />
    </svg>
  );
}

export function ChartIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M4 19.5V11" />
      <path d="M10 19.5V5" />
      <path d="M16 19.5V14" />
      <path d="M21.5 19.5h-19" />
    </svg>
  );
}

export function ReportIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8" />
      <path d="M8 12h8" />
    </svg>
  );
}

export function LogoMark(props: IconProps) {
  return (
    <svg width={props.size ?? 20} height={props.size ?? 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <circle cx="12" cy="9.5" r="4" />
      <path d="M12 1.5v1.6" />
      <path d="M19.1 5.2l-1.1 1.1" />
      <path d="M4.9 5.2l1.1 1.1" />
      <path d="M3 16.5h18" />
      <path d="M6 20.5h12" />
    </svg>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <svg width={props.size ?? 16} height={props.size ?? 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className={props.className}>
      <path d="M18 6 6 18" />
      <path d="M6 6l12 12" />
    </svg>
  );
}
