import { useEffect } from "react";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WheelItem {
  id: string;
  label: string;
}

export interface NameSet {
  id: string;
  name: string;
  items: WheelItem[];
}

// Stav jedné hry (scope) – její sady a aktivní sada. Sady jednotlivých her jsou oddělené.
interface ScopeState {
  sets: NameSet[];
  activeId: string | null;
}

interface SetStore {
  scopes: Record<string, ScopeState>;

  ensureScope: (scope: string) => void;

  // správa sad v dané hře
  createSet: (scope: string, name: string) => void;
  renameSet: (scope: string, id: string, name: string) => void;
  deleteSet: (scope: string, id: string) => void;
  selectSet: (scope: string, id: string) => void;

  // položky aktivní sady dané hry
  addItem: (scope: string, label: string) => void;
  removeItem: (scope: string, itemId: string) => void;
  clearAll: (scope: string) => void;
}

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;

const DEFAULT_SET_NAME = "Sada 1";

const createSetObject = (name: string): NameSet => ({
  id: createId(),
  name: name.trim() || DEFAULT_SET_NAME,
  items: [],
});

// nová hra dostane jednu prázdnou výchozí sadu
const createScope = (): ScopeState => {
  const set = createSetObject(DEFAULT_SET_NAME);
  return { sets: [set], activeId: set.id };
};

// upraví scope dané hry (pokud ještě neexistuje, založí ho)
const updateScope = (
  state: SetStore,
  scope: string,
  updater: (scopeState: ScopeState) => ScopeState
): Partial<SetStore> => {
  const current = state.scopes[scope] ?? createScope();
  return { scopes: { ...state.scopes, [scope]: updater(current) } };
};

// upraví položky aktivní sady dané hry
const updateActiveItems = (
  state: SetStore,
  scope: string,
  updater: (items: WheelItem[]) => WheelItem[]
): Partial<SetStore> =>
  updateScope(state, scope, scopeState => ({
    ...scopeState,
    sets: scopeState.sets.map(set => (set.id === scopeState.activeId ? { ...set, items: updater(set.items) } : set)),
  }));

const useSetStore = create<SetStore>()(
  persist(
    set => ({
      // výchozí stav – známé hry mají vlastní prázdnou sadu
      scopes: { wheel: createScope(), versus: createScope() },

      ensureScope: scope =>
        set(state => (state.scopes[scope] ? {} : { scopes: { ...state.scopes, [scope]: createScope() } })),

      createSet: (scope, name) =>
        set(state =>
          updateScope(state, scope, scopeState => {
            const newSet = createSetObject(name);
            return { sets: [...scopeState.sets, newSet], activeId: newSet.id };
          })
        ),

      renameSet: (scope, id, name) => {
        const trimmed = name.trim();
        if (trimmed === "") return;
        set(state =>
          updateScope(state, scope, scopeState => ({
            ...scopeState,
            sets: scopeState.sets.map(s => (s.id === id ? { ...s, name: trimmed } : s)),
          }))
        );
      },

      deleteSet: (scope, id) =>
        set(state =>
          updateScope(state, scope, scopeState => {
            const remaining = scopeState.sets.filter(s => s.id !== id);
            if (remaining.length === 0) {
              // po smazání poslední sady založíme novou výchozí
              return createScope();
            }
            return {
              sets: remaining,
              activeId: scopeState.activeId === id ? remaining[0].id : scopeState.activeId,
            };
          })
        ),

      selectSet: (scope, id) =>
        set(state => updateScope(state, scope, scopeState => ({ ...scopeState, activeId: id }))),

      // přidá novou položku do aktivní sady (prázdné/whitespace vstupy ignoruje)
      addItem: (scope, label) => {
        const trimmed = label.trim();
        if (trimmed === "") return;
        set(state => updateActiveItems(state, scope, items => [...items, { id: createId(), label: trimmed }]));
      },

      removeItem: (scope, itemId) =>
        set(state => updateActiveItems(state, scope, items => items.filter(item => item.id !== itemId))),

      clearAll: scope => set(state => updateActiveItems(state, scope, () => [])),
    }),
    {
      name: "randomizer-wheel-items",
      version: 2,
      // migrace ze starších podob na sady oddělené podle hry
      migrate: (persisted, version) => {
        // verze 0: { items: [...] }
        if (version === 0 && persisted && typeof persisted === "object" && "items" in persisted) {
          const items = (persisted as { items: WheelItem[] }).items ?? [];
          const set: NameSet = { id: createId(), name: DEFAULT_SET_NAME, items };
          return { scopes: { wheel: { sets: [set], activeId: set.id }, versus: createScope() } } as unknown as SetStore;
        }
        // verze 1: { wheels, activeWheelId } – původně sdílené, přiřadíme kolu štěstí
        if (version === 1 && persisted && typeof persisted === "object" && "wheels" in persisted) {
          const old = persisted as { wheels: NameSet[]; activeWheelId: string | null };
          const wheelScope: ScopeState =
            old.wheels.length > 0 ? { sets: old.wheels, activeId: old.activeWheelId } : createScope();
          return { scopes: { wheel: wheelScope, versus: createScope() } } as unknown as SetStore;
        }
        return persisted as SetStore;
      },
      // zajistí platný stav po načtení (každá hra má aspoň jednu sadu + platné aktivní id)
      onRehydrateStorage: () => state => {
        if (!state) return;
        if (!state.scopes) state.scopes = {};
        if (!state.scopes.wheel) state.scopes.wheel = createScope();
        if (!state.scopes.versus) state.scopes.versus = createScope();
        Object.values(state.scopes).forEach(scopeState => {
          if (scopeState.sets.length === 0) {
            const fresh = createScope();
            scopeState.sets = fresh.sets;
            scopeState.activeId = fresh.activeId;
          } else if (!scopeState.sets.some(s => s.id === scopeState.activeId)) {
            scopeState.activeId = scopeState.sets[0].id;
          }
        });
      },
    }
  )
);

// Pohled na sady jedné hry. Každá hra (scope) má vlastní oddělené sady.
const useWheelStore = (scope: string) => {
  const scopeState = useSetStore(state => state.scopes[scope]);
  const ensureScope = useSetStore(state => state.ensureScope);

  const createSet = useSetStore(state => state.createSet);
  const renameSet = useSetStore(state => state.renameSet);
  const deleteSet = useSetStore(state => state.deleteSet);
  const selectSet = useSetStore(state => state.selectSet);
  const addItem = useSetStore(state => state.addItem);
  const removeItem = useSetStore(state => state.removeItem);
  const clearAll = useSetStore(state => state.clearAll);

  // pro hru, která ještě scope nemá (např. nově přidaná), ho doplníme
  useEffect(() => {
    if (!scopeState) ensureScope(scope);
  }, [scope, scopeState, ensureScope]);

  const sets = scopeState?.sets ?? [];
  const activeId = scopeState?.activeId ?? null;
  const active = sets.find(s => s.id === activeId) ?? null;

  return {
    sets,
    activeId,
    active,
    createSet: (name: string) => createSet(scope, name),
    renameSet: (id: string, name: string) => renameSet(scope, id, name),
    deleteSet: (id: string) => deleteSet(scope, id),
    selectSet: (id: string) => selectSet(scope, id),
    addItem: (label: string) => addItem(scope, label),
    removeItem: (itemId: string) => removeItem(scope, itemId),
    clearAll: () => clearAll(scope),
  };
};

export default useWheelStore;
