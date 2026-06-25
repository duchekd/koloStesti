import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

interface ThemeModeStore {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

const useThemeMode = create<ThemeModeStore>()(
  persist(
    set => ({
      mode: "light",
      toggle: () => set(state => ({ mode: state.mode === "light" ? "dark" : "light" })),
      setMode: mode => set({ mode }),
    }),
    { name: "randomizer-theme-mode" }
  )
);

export default useThemeMode;
