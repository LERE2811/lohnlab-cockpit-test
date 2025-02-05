"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("theme-lohnlab");

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  return (
    <div className={cn(theme)}>
      {children}
    </div>
  );
}
