"use client"

import Image from "next/image"
import { useTheme } from "@/hooks/use-theme"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  const theme = useTheme()

  return (
    <div className={cn("relative h-8 w-40", className)}>
      {theme === "theme-lohnlab" ? (
        <Image
          src="/assets/LohnLab_Logo.png"
          alt="LohnLab Logo"
          fill
          className="object-contain"
          priority
        />
      ) : (
        <Image
          src="/assets/LK_logo_lang.png"
          alt="LohnLab Logo"
          fill
          className="object-contain"
          priority
        />
      )}
    </div>
  )
} 