"use client";

import dynamic from "next/dynamic";

const UnlockApp = dynamic(() => import("@/unlock/UnlockApp"), { ssr: false });

export default function UnlockPage() {
  return <UnlockApp />;
}
