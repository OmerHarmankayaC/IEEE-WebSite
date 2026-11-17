type IconProps = { size?: number };

export function ArrowRight({ size = 16 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M2.5 8h11M9 3.5 13.5 8 9 12.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function ArrowUpRight({ size = 14 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 10.5 10.5 3.5M5 3.5h5.5V9" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function MenuIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M2 5h14M2 9h14M2 13h14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M3 3l12 12M15 3 3 15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function Crosshair({ position }: { position: "tl" | "tr" | "bl" | "br" }) {
  return (
    <svg className={`crosshair crosshair--${position}`} viewBox="0 0 15 15" aria-hidden="true">
      <path d="M7.5 0v15M0 7.5h15" stroke="#0A1A30" strokeWidth="1" />
    </svg>
  );
}

export function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M7 1.5v11M1.5 7h11" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M2.5 4h11M6 4V2.5h4V4M4 4l.7 9.5h6.6L12 4M6.8 6.5v4.5M9.2 6.5v4.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  );
}
