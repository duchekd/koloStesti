import { create } from "zustand";

interface Store {
  reset: () => void;
  culture: string;
  setCulture: (culture: string) => void;
}

// výchozí lokalizace dle prohlížeče, fallback cs-CZ
const getDefaultCulture = () =>
  typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en") ? "en-US" : "cs-CZ";

const initialState = {
  culture: getDefaultCulture(),
};

const useStore = create<Store>(set => ({
  ...initialState,

  // funkce pro reset
  reset: () => set(initialState),

  // setovací funkce
  setCulture: culture => set({ culture }),
}));

export default useStore;
