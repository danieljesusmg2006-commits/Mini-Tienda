"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check saved preference or system preference
    const saved = localStorage.getItem("mini_tienda_theme");
    if (saved === "dark") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else if (saved === "light") {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      document.documentElement.classList.add("dark");
      localStorage.setItem("mini_tienda_theme", "dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
      localStorage.setItem("mini_tienda_theme", "light");
    }
  };

  if (!mounted) {
    // Return empty placeholder with same dimensions to avoid layout shift
    return <div className="w-9 h-9 rounded-xl border border-transparent" />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer border shadow-2xs ${
        isDark
          ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700 hover:border-slate-600"
          : "bg-slate-100 border-slate-200 text-amber-500 hover:bg-slate-200 hover:border-slate-300"
      }`}
      aria-label={isDark ? "Modo oscuro activo. Cambiar a modo claro" : "Modo claro activo. Cambiar a modo oscuro"}
      title={isDark ? "Modo oscuro activo (clic para activar modo claro)" : "Modo claro activo (clic para activar modo oscuro)"}
    >
      {isDark ? (
        <Moon className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Sun className="w-4 h-4 transition-transform duration-300 rotate-0 scale-100" />
      )}
    </button>
  );
}
