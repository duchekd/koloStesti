import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface ThemeModeStore {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const getSystemMode = (): ThemeMode =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";

const useThemeMode = create<ThemeModeStore>()(
  persist(
    set => ({
      mode: getSystemMode(),
      toggle: () => set(state => ({ mode: state.mode === "light" ? "dark" : "light" })),
      setMode: mode => set({ mode }),
    }),
    { name: "randomizer-theme-mode" }
  )
);

export default useThemeMode;
