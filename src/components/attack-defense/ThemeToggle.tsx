"use client";

import { Btn } from "./ui/Btn";
import { Icon } from "./ui/Icon";
import { useAdTheme } from "./AdScopeProvider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useAdTheme();
  return (
    <Btn variant="ghost" size="sm" icon onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
      <Icon name={theme === "light" ? "moon" : "sun"} size={16} />
    </Btn>
  );
}
