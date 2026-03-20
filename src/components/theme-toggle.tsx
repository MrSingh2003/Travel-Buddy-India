// src/components/theme-toggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-11 w-11 rounded-2xl border border-emerald-200/80 bg-emerald-50 text-emerald-700 shadow-sm transition-all duration-300 hover:bg-emerald-100 hover:text-emerald-800 dark:border-violet-300/20 dark:bg-violet-200/10 dark:text-violet-100 dark:shadow-[0_8px_30px_rgba(167,139,250,0.18)] dark:hover:bg-violet-200/20 dark:hover:text-violet-50"
      aria-label="Toggle theme"
    >
      <Sun className="h-[1.35rem] w-[1.35rem] rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.35rem] w-[1.35rem] rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
