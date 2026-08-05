"use client";

import { useSyncExternalStore } from "react";

export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "northstar-app-theme";
const THEME_EVENT = "northstar-theme-change";

function getTheme(): AppTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  const handleStoredTheme = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const theme = event.newValue === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    onStoreChange();
  };
  const handleSystemTheme = () => {
    if (window.localStorage.getItem(THEME_STORAGE_KEY)) return;
    const theme = media?.matches ? "dark" : "light";
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    onStoreChange();
  };

  window.addEventListener(THEME_EVENT, onStoreChange);
  window.addEventListener("storage", handleStoredTheme);
  media?.addEventListener("change", handleSystemTheme);
  return () => {
    window.removeEventListener(THEME_EVENT, onStoreChange);
    window.removeEventListener("storage", handleStoredTheme);
    media?.removeEventListener("change", handleSystemTheme);
  };
}

export function setAppTheme(theme: AppTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_EVENT));
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => "light");
  return {
    theme,
    setTheme: setAppTheme,
    toggleTheme: () => setAppTheme(theme === "dark" ? "light" : "dark"),
  };
}
