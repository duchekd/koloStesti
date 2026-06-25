import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WheelItem {
  id: string;
  label: string;
}

export interface Wheel {
  id: string;
  name: string;
  items: WheelItem[];
}

interface WheelStore {
  wheels: Wheel[];
  activeWheelId: string | null;

  // správa sad
  createWheel: (name: string) => void;
  renameWheel: (id: string, name: string) => void;
  deleteWheel: (id: string) => void;
  selectWheel: (id: string) => void;

  // položky aktivní sady
  addItem: (label: string) => void;
  removeItem: (itemId: string) => void;
  clearAll: () => void;
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const DEFAULT_WHEEL_NAME = "Sada 1";

const createWheelObject = (name: string): Wheel => ({ id: createId(), name: name.trim() || DEFAULT_WHEEL_NAME, items: [] });

// upraví položky pouze u aktivní sady
const updateActiveItems = (state: WheelStore, updater: (items: WheelItem[]) => WheelItem[]): Partial<WheelStore> => ({
  wheels: state.wheels.map(wheel =>
    wheel.id === state.activeWheelId ? { ...wheel, items: updater(wheel.items) } : wheel
  ),
});

const useWheelStore = create<WheelStore>()(
  persist(
    (set, get) => {
      const initialWheel = createWheelObject(DEFAULT_WHEEL_NAME);

      return {
        wheels: [initialWheel],
        activeWheelId: initialWheel.id,

        createWheel: name => {
          const wheel = createWheelObject(name);
          set(state => ({ wheels: [...state.wheels, wheel], activeWheelId: wheel.id }));
        },

        renameWheel: (id, name) => {
          const trimmed = name.trim();
          if (trimmed === "") return;
          set(state => ({ wheels: state.wheels.map(wheel => (wheel.id === id ? { ...wheel, name: trimmed } : wheel)) }));
        },

        deleteWheel: id => {
          const remaining = get().wheels.filter(wheel => wheel.id !== id);
          if (remaining.length === 0) {
            // po smazání poslední sady založíme novou výchozí
            const fresh = createWheelObject(DEFAULT_WHEEL_NAME);
            set({ wheels: [fresh], activeWheelId: fresh.id });
            return;
          }
          set(state => ({
            wheels: remaining,
            activeWheelId: state.activeWheelId === id ? remaining[0].id : state.activeWheelId,
          }));
        },

        selectWheel: id => set({ activeWheelId: id }),

        // přidá novou položku do aktivní sady (prázdné/whitespace vstupy ignoruje)
        addItem: label => {
          const trimmed = label.trim();
          if (trimmed === "") return;
          set(state => updateActiveItems(state, items => [...items, { id: createId(), label: trimmed }]));
        },

        // odebere položku z aktivní sady
        removeItem: itemId => set(state => updateActiveItems(state, items => items.filter(item => item.id !== itemId))),

        // vymaže všechny položky aktivní sady
        clearAll: () => set(state => updateActiveItems(state, () => [])),
      };
    },
    {
      name: "randomizer-wheel-items",
      version: 1,
      // migrace ze staré podoby { items: [...] } na sady
      migrate: (persisted, version) => {
        if (version === 0 && persisted && typeof persisted === "object" && "items" in persisted) {
          const items = (persisted as { items: WheelItem[] }).items ?? [];
          const wheel: Wheel = { id: createId(), name: DEFAULT_WHEEL_NAME, items };
          return { wheels: [wheel], activeWheelId: wheel.id } as unknown as WheelStore;
        }
        return persisted as WheelStore;
      },
      // zajistí platný stav po načtení (aspoň jedna sada + platné aktivní id)
      onRehydrateStorage: () => state => {
        if (!state) return;
        if (state.wheels.length === 0) {
          const fresh = createWheelObject(DEFAULT_WHEEL_NAME);
          state.wheels = [fresh];
          state.activeWheelId = fresh.id;
        } else if (!state.wheels.some(wheel => wheel.id === state.activeWheelId)) {
          state.activeWheelId = state.wheels[0].id;
        }
      },
    }
  )
);

export default useWheelStore;
