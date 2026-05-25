"use client";

import { useEffect } from "react";

/** Keeps /whos-responsible on the bright civic palette even when OS prefers dark. */
export default function WhosLightTheme({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    document.documentElement.classList.add("wr-light-theme");
    document.body.classList.add("wr-light-theme");
    document.documentElement.style.colorScheme = "light";

    return () => {
      document.documentElement.classList.remove("wr-light-theme");
      document.body.classList.remove("wr-light-theme");
      document.documentElement.style.colorScheme = "";
    };
  }, []);

  return children;
}
