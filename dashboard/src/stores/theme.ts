import { create } from "zustand";

export type ColorMode = "light" | "dark";

const STORAGE_KEY = "vantray-theme";

const getInitialColorMode = (): ColorMode => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyColorMode = (mode: ColorMode) => {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", mode === "dark" ? "#1B211F" : "#ffffff");
};

type ThemeStore = {
  colorMode: ColorMode;
  toggleColorMode: () => void;
};

export const useTheme = create<ThemeStore>()((set, get) => ({
  colorMode: getInitialColorMode(),
  toggleColorMode: () => {
    const next: ColorMode = get().colorMode === "dark" ? "light" : "dark";
    localStorage.setItem(STORAGE_KEY, next);
    applyColorMode(next);
    set({ colorMode: next });
  },
}));

applyColorMode(useTheme.getState().colorMode);
