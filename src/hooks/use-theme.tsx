import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const THEME_STORAGE_KEY = "trowel:theme";

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = (window.localStorage.getItem(THEME_STORAGE_KEY) ?? window.localStorage.getItem("theme")) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function storeTheme(theme: Theme) {
  applyTheme(theme);
  if (typeof window === "undefined") return;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.localStorage.setItem("theme", theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());

  useEffect(() => {
    storeTheme(theme);
  }, [theme]);

  const updateTheme = (nextTheme: Theme | ((current: Theme) => Theme)) => {
    setTheme((current) => {
      const next = typeof nextTheme === "function" ? nextTheme(current) : nextTheme;
      storeTheme(next);
      return next;
    });
  };

  return { theme, setTheme: updateTheme, toggle: () => updateTheme((current) => current === "dark" ? "light" : "dark") };
}
