export type IconName =
  | "bolt"
  | "shield"
  | "sword"
  | "skull"
  | "trap"
  | "house"
  | "play"
  | "google"
  | "arrow"
  | "x"
  | "trophy"
  | "users"
  | "copy"
  | "clock"
  | "sun"
  | "moon";

export function Icon({
  name,
  size = 18,
  color = "currentColor",
  className = "",
}: {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
}) {
  const s = size;
  switch (name) {
    case "bolt":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" fill={color} stroke={color} strokeWidth="0.5" strokeLinejoin="round" />
        </svg>
      );
    case "shield":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 3 4 6v6c0 4.5 3.4 8.6 8 9 4.6-.4 8-4.5 8-9V6l-8-3Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "sword":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="m4 20 6-6m4-4 6-6h-4l-9 9 1 4 4 1 9-9V5"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    case "skull":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M12 3a8 8 0 0 0-5 14v3h10v-3a8 8 0 0 0-5-14Z" stroke={color} strokeWidth="1.8" />
          <circle cx="9" cy="13" r="1.4" fill={color} />
          <circle cx="15" cy="13" r="1.4" fill={color} />
        </svg>
      );
    case "trap":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M4 18h16M12 18V6m-5 4 5-4 5 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="11" r="1.5" fill={color} />
        </svg>
      );
    case "house":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="m3 11 9-7 9 7v9H3v-9Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    case "play":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M7 5v14l12-7L7 5Z" fill={color} />
        </svg>
      );
    case "google":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" className={className}>
          <path fill="#4285F4" d="M22 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.6c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4c2-1.8 3.1-4.6 3.1-7.6Z" />
          <path fill="#34A853" d="M12 22c2.8 0 5.2-.9 6.9-2.5l-3.4-2.6c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3H2.7v2.7C4.4 19.6 7.9 22 12 22Z" />
          <path fill="#FBBC04" d="M6.2 13.6c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.3H2.7C2 8.6 1.6 10.2 1.6 11.8c0 1.6.4 3.2 1.1 4.5l3.5-2.7Z" />
          <path fill="#EA4335" d="M12 5.8c1.5 0 2.9.5 4 1.5l3-3C17.2 2.6 14.8 1.6 12 1.6 7.9 1.6 4.4 4 2.7 7.3l3.5 2.7C7 7.6 9.3 5.8 12 5.8Z" />
        </svg>
      );
    case "arrow":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M5 12h14m-6-6 6 6-6 6" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "x":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="m6 6 12 12M18 6 6 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "trophy":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path
            d="M7 4h10v5a5 5 0 0 1-10 0V4Zm0 2H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3M9 21h6m-3-7v7"
            stroke={color}
            strokeWidth="1.8"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>
      );
    case "users":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="8" cy="9" r="3" stroke={color} strokeWidth="1.8" />
          <circle cx="17" cy="10" r="2.5" stroke={color} strokeWidth="1.8" />
          <path d="M2 20c0-3 2.7-5 6-5s6 2 6 5m1.5-7c3 0 5 1.7 5 4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "copy":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <rect x="9" y="9" width="11" height="11" rx="2" stroke={color} strokeWidth="1.8" />
          <path d="M5 15V6a2 2 0 0 1 2-2h9" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "clock":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.8" />
          <path d="M12 7v5l3 2" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "sun":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <circle cx="12" cy="12" r="4" stroke={color} strokeWidth="1.8" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "moon":
      return (
        <svg width={s} height={s} viewBox="0 0 24 24" fill="none" className={className}>
          <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 7 7 0 1 0 20 14.5Z" stroke={color} strokeWidth="1.8" strokeLinejoin="round" />
        </svg>
      );
    default:
      return null;
  }
}
