import type { PowerKey } from "./tokens";

export function PowerIcon({
  power,
  className = "h-4 w-4",
}: {
  power: PowerKey;
  className?: string;
}) {
  switch (power) {
    case "block":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden
        >
          <path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case "anonymous":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden
        >
          <path d="M3 14c2-4 5-6 9-6s7 2 9 6" />
          <circle cx="8" cy="14.5" r="2.5" />
          <circle cx="16" cy="14.5" r="2.5" />
          <path d="M10.5 14.5h3" />
        </svg>
      );
    case "mutual":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden
        >
          <path d="M7 20V8" />
          <path d="M3 12l4-4 4 4" />
          <path d="M17 4v12" />
          <path d="M13 12l4 4 4-4" />
        </svg>
      );
    case "reversal":
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden
        >
          <path d="M4 12a8 8 0 0 1 14-5.3" />
          <path d="M18 3v4h-4" />
          <path d="M20 12a8 8 0 0 1-14 5.3" />
          <path d="M6 21v-4h4" />
        </svg>
      );
  }
}
