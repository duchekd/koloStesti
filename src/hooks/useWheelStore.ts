import { useEffect } from "react";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WheelItem {
  id: string;
  label: string;
}

// Jeden badmintonový set – skóre obou hráčů.
export interface MatchSet {
  a: number;
  b: number;
}

// Zápas A vs B (hráči jsou odkazy na položky sady) a jeho sety.
export interface Match {
  id: string;
  aId: string | null;
  bId: string | null;
  sets: MatchSet[];
}

export interface NameSet {
  id: string;
  name: string;
  items: WheelItem[];
  // využívá jen badminton – zápasy v rámci této sady (turnaje)
  matches?: Match[];
}

// Stav jedné hry (scope) – její sady a aktivní sada. Sady jednotlivých her jsou oddělené.
interface ScopeState {
  sets: NameSet[];
  activeId: string | null;
  // hry v SHARED_ITEM_SCOPES sdílí jména napříč všemi sadami (badminton: hráči přes všechna data)
  sharedItems?: WheelItem[];
}

// Hry, kde jsou položky (jména) společné pro všechny sady místo zvlášť pro každou.
const SHARED_ITEM_SCOPES = new Set<string>(["badminton"]);
const isShared = (scope: string) => SHARED_ITEM_SCOPES.has(scope);

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

  // badminton – zápasy uvnitř konkrétní sady (turnaje)
  addMatch: (scope: string, setId: string) => void;
  removeMatch: (scope: string, setId: string, matchId: string) => void;
  setMatchPlayer: (scope: string, setId: string, matchId: string, side: "a" | "b", itemId: string | null) => void;
  addMatchSet: (scope: string, setId: string, matchId: string) => void;
  updateMatchSet: (scope: string, setId: string, matchId: string, index: number, side: "a" | "b", value: number) => void;
  removeMatchSet: (scope: string, setId: string, matchId: string, index: number) => void;

  // hromadná náhrada badminton dat z cloudu (sety + sdílení hráči); zachová lokální activeId
  replaceBadmintonData: (sets: NameSet[], sharedItems: WheelItem[]) => void;
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
  return { sets: [set], activeId: set.id, sharedItems: [] };
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

// upraví položky (jména) – u sdílených her společné pro celý scope, jinak jen aktivní sadu
const updateActiveItems = (
  state: SetStore,
  scope: string,
  updater: (items: WheelItem[]) => WheelItem[]
): Partial<SetStore> =>
  isShared(scope)
    ? updateScope(state, scope, scopeState => ({ ...scopeState, sharedItems: updater(scopeState.sharedItems ?? []) }))
    : updateScope(state, scope, scopeState => ({
        ...scopeState,
        sets: scopeState.sets.map(set =>
          set.id === scopeState.activeId ? { ...set, items: updater(set.items) } : set
        ),
      }));

// upraví zápasy konkrétní sady (badminton)
const updateMatches = (
  state: SetStore,
  scope: string,
  setId: string,
  updater: (matches: Match[]) => Match[]
): Partial<SetStore> =>
  updateScope(state, scope, scopeState => ({
    ...scopeState,
    sets: scopeState.sets.map(set => (set.id === setId ? { ...set, matches: updater(set.matches ?? []) } : set)),
  }));

// upraví jeden konkrétní zápas
const updateOneMatch = (
  state: SetStore,
  scope: string,
  setId: string,
  matchId: string,
  updater: (match: Match) => Match
): Partial<SetStore> =>
  updateMatches(state, scope, setId, matches => matches.map(match => (match.id === matchId ? updater(match) : match)));

// jména dané hry – sdílená pro celý scope, nebo z aktivní sady
const itemsOf = (scopeState: ScopeState | undefined, scope: string): WheelItem[] => {
  if (!scopeState) return [];
  if (isShared(scope)) return scopeState.sharedItems ?? [];
  return scopeState.sets.find(s => s.id === scopeState.activeId)?.items ?? [];
};

// dvě různá náhodná jména (id) z poolu – pro předvyplnění nového zápasu
const pickTwoRandom = (pool: WheelItem[]): [string | null, string | null] => {
  if (pool.length === 0) return [null, null];
  if (pool.length === 1) return [pool[0].id, null];
  const a = Math.floor(Math.random() * pool.length);
  let b = Math.floor(Math.random() * (pool.length - 1));
  if (b >= a) b += 1;
  return [pool[a].id, pool[b].id];
};

export const useSetStore = create<SetStore>()(
  persist(
    set => ({
      // výchozí stav – známé hry mají vlastní prázdnou sadu
      scopes: { wheel: createScope(), versus: createScope(), badminton: createScope() },

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

      addMatch: (scope, setId) =>
        set(state => {
          // nový zápas se rovnou předvyplní dvěma náhodnými hráči z položek
          const [aId, bId] = pickTwoRandom(itemsOf(state.scopes[scope], scope));
          return updateMatches(state, scope, setId, matches => [...matches, { id: createId(), aId, bId, sets: [] }]);
        }),

      removeMatch: (scope, setId, matchId) =>
        set(state => updateMatches(state, scope, setId, matches => matches.filter(match => match.id !== matchId))),

      setMatchPlayer: (scope, setId, matchId, side, itemId) =>
        set(state =>
          updateOneMatch(state, scope, setId, matchId, match => ({
            ...match,
            [side === "a" ? "aId" : "bId"]: itemId,
          }))
        ),

      addMatchSet: (scope, setId, matchId) =>
        set(state =>
          updateOneMatch(state, scope, setId, matchId, match => ({ ...match, sets: [...match.sets, { a: 0, b: 0 }] }))
        ),

      updateMatchSet: (scope, setId, matchId, index, side, value) =>
        set(state =>
          updateOneMatch(state, scope, setId, matchId, match => ({
            ...match,
            sets: match.sets.map((s, i) => (i === index ? { ...s, [side]: value } : s)),
          }))
        ),

      removeMatchSet: (scope, setId, matchId, index) =>
        set(state =>
          updateOneMatch(state, scope, setId, matchId, match => ({
            ...match,
            sets: match.sets.filter((_, i) => i !== index),
          }))
        ),

      replaceBadmintonData: (sets, sharedItems) =>
        set(state => {
          // prázdná data z cloudu nahradíme výchozí sadou, ať je vždy aspoň jedna
          const safeSets = sets.length > 0 ? sets : createScope().sets;
          const prevActiveId = state.scopes.badminton?.activeId;
          // zachováme lokálně vybraný turnaj, pokud ve staženích datech pořád existuje
          const activeId = safeSets.some(s => s.id === prevActiveId) ? prevActiveId! : safeSets[0].id;
          return {
            scopes: {
              ...state.scopes,
              badminton: { sets: safeSets, activeId, sharedItems },
            },
          };
        }),
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
        if (!state.scopes.badminton) state.scopes.badminton = createScope();
        Object.entries(state.scopes).forEach(([scope, scopeState]) => {
          if (scopeState.sets.length === 0) {
            const fresh = createScope();
            scopeState.sets = fresh.sets;
            scopeState.activeId = fresh.activeId;
          } else if (!scopeState.sets.some(s => s.id === scopeState.activeId)) {
            scopeState.activeId = scopeState.sets[0].id;
          }
          // u sdílených her zajistíme společný seznam jmen; případná dřívější jména ze sad přeneseme
          if (isShared(scope) && (!scopeState.sharedItems || scopeState.sharedItems.length === 0)) {
            scopeState.sharedItems = scopeState.sets.flatMap(s => s.items);
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
  const addMatch = useSetStore(state => state.addMatch);
  const removeMatch = useSetStore(state => state.removeMatch);
  const setMatchPlayer = useSetStore(state => state.setMatchPlayer);
  const addMatchSet = useSetStore(state => state.addMatchSet);
  const updateMatchSet = useSetStore(state => state.updateMatchSet);
  const removeMatchSet = useSetStore(state => state.removeMatchSet);

  // pro hru, která ještě scope nemá (např. nově přidaná), ho doplníme
  useEffect(() => {
    if (!scopeState) ensureScope(scope);
  }, [scope, scopeState, ensureScope]);

  const sets = scopeState?.sets ?? [];
  const activeId = scopeState?.activeId ?? null;
  const active = sets.find(s => s.id === activeId) ?? null;
  // jména – buď sdílená pro celý scope (badminton), nebo z aktivní sady
  const items = isShared(scope) ? scopeState?.sharedItems ?? [] : active?.items ?? [];

  return {
    sets,
    activeId,
    active,
    items,
    createSet: (name: string) => createSet(scope, name),
    renameSet: (id: string, name: string) => renameSet(scope, id, name),
    deleteSet: (id: string) => deleteSet(scope, id),
    selectSet: (id: string) => selectSet(scope, id),
    addItem: (label: string) => addItem(scope, label),
    removeItem: (itemId: string) => removeItem(scope, itemId),
    clearAll: () => clearAll(scope),

    // badminton – zápasy v rámci sady (setId)
    addMatch: (setId: string) => addMatch(scope, setId),
    removeMatch: (setId: string, matchId: string) => removeMatch(scope, setId, matchId),
    setMatchPlayer: (setId: string, matchId: string, side: "a" | "b", itemId: string | null) =>
      setMatchPlayer(scope, setId, matchId, side, itemId),
    addMatchSet: (setId: string, matchId: string) => addMatchSet(scope, setId, matchId),
    updateMatchSet: (setId: string, matchId: string, index: number, side: "a" | "b", value: number) =>
      updateMatchSet(scope, setId, matchId, index, side, value),
    removeMatchSet: (setId: string, matchId: string, index: number) => removeMatchSet(scope, setId, matchId, index),
  };
};

export default useWheelStore;
