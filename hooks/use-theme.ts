"use client"

import { useState, useEffect } from "react"

export function useTheme() {
  const [theme, setTheme] = useState<string>("theme-lohnlab")

  useEffect(() => {
    // Get initial theme from document
    const currentTheme = document.documentElement.className
    setTheme(currentTheme)

    // Create observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "class") {
          const newTheme = document.documentElement.className
          setTheme(newTheme)
        }
      })
    })

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // Cleanup
    return () => observer.disconnect()
  }, [])

  return theme
} 