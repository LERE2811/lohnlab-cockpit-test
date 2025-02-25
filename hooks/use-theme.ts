"use client";

import { useState, useEffect } from "react";
import { useCompany } from "@/context/company-context";

export function useTheme() {
  const [theme, setTheme] = useState<string>("theme-lohnlab");
  const { company } = useCompany();

  useEffect(() => {
    if (company) {
      setTheme(`theme-${company.vertriebspartner.toLowerCase()}`);
    }
  }, [company]);

  useEffect(() => {
    // Get initial theme from document
    const currentTheme = document.documentElement.className;
    setTheme(currentTheme);

    // Create observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const newTheme = document.documentElement.className;
          setTheme(newTheme);
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Cleanup
    return () => observer.disconnect();
  }, []);

  return theme;
}
