"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useCompany } from "@/context/company-context";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState("theme-lohnlab");
  const { company } = useCompany();

  useEffect(() => {
    if (company) {
      console.log(
        "Company changed, updating theme to:",
        company.vertriebspartner,
      );
      const newTheme = `theme-${company.vertriebspartner.toLowerCase()}`;
      setTheme(newTheme);
    }
  }, [company]);

  useEffect(() => {
    console.log("Theme changed to:", theme);
    document.documentElement.className = theme;
  }, [theme]);

  return <div className={cn(theme)}>{children}</div>;
}
