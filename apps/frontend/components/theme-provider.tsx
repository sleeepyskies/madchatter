"use client";

import * as React from "react";
import type { Theme } from "@madchatter/api/src/preferences";

const THEME_STORAGE_KEY = "theme-preference";

const themeValues: Theme[] = ["light", "dark", "system"];

const isTheme = (value: unknown): value is Theme =>
  typeof value === "string" && themeValues.includes(value as Theme);

const applyThemeClass = (theme: Theme) => {
  const html = document.documentElement;
  const setDark = (dark: boolean) => {
    if (dark) {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.add("light");
      html.classList.remove("dark");
    }
  };

  stopSystemListener();

  if (theme === "dark") {
    setDark(true);
    return;
  }

  if (theme === "light") {
    setDark(false);
    return;
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  setDark(mediaQuery.matches);
  activeSystemMediaQuery = mediaQuery;
  activeSystemListener = (event: MediaQueryListEvent) => {
    setDark(event.matches);
  };
  mediaQuery.addEventListener("change", activeSystemListener);
};

let activeSystemMediaQuery: MediaQueryList | null = null;
let activeSystemListener: ((event: MediaQueryListEvent) => void) | null = null;

const stopSystemListener = () => {
  if (activeSystemMediaQuery && activeSystemListener) {
    activeSystemMediaQuery.removeEventListener("change", activeSystemListener);
    activeSystemMediaQuery = null;
    activeSystemListener = null;
  }
};

export const getStoredTheme = (): Theme => {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(stored) ? stored : "system";
};

export const applyTheme = (theme: Theme) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  applyThemeClass(theme);
};

export default function ThemeProvider({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  React.useEffect(() => {
    const storedTheme = getStoredTheme();
    applyThemeClass(storedTheme);
  }, []);

  return <>{children}</>;
}
