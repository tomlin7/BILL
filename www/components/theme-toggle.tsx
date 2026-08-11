"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <button
      type="button"
      aria-label="toggle theme"
      title="toggle theme (d)"
      onClick={() => {
        const dark = document.documentElement.classList.contains("dark")
        setTheme(dark ? "light" : "dark")
      }}
      className="grid size-6 place-items-center border border-border bg-background text-foreground hover:bg-foreground hover:text-background"
    >
      <Sun className="size-3.5 dark:hidden" />
      <Moon className="hidden size-3.5 dark:block" />
    </button>
  )
}
