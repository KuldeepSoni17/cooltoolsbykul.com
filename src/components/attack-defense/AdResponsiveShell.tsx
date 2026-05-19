import type { ReactNode } from "react";

export function AdResponsiveShell({ mobile, desktop }: { mobile: ReactNode; desktop: ReactNode }) {
  return (
    <>
      <div className="ad-ad-shell--mobile">
        <div className="ad-ad-page">{mobile}</div>
      </div>
      <div className="ad-ad-shell--desktop">{desktop}</div>
    </>
  );
}
