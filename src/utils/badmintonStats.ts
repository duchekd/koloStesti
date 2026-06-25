import { Match, WheelItem } from "../hooks/useWheelStore";

export interface PlayerStat {
  id: string;
  name: string;
  wins: number; // vyhrané zápasy
  setsWon: number; // vyhrané sety
  pointsFor: number; // míčky pro
  pointsAgainst: number; // míčky proti
  diff: number; // rozdíl (pro − proti)
}

interface Acc {
  wins: number;
  setsWon: number;
  pointsFor: number;
  pointsAgainst: number;
}

// Spočítá žebříček hráčů ze všech zápasů (napříč všemi daty badmintonu).
// Počítají se jen kompletní zápasy (oba hráči vyplnění) s aspoň jedním setem.
export const computeBadmintonStats = (matches: Match[], players: WheelItem[]): PlayerStat[] => {
  const nameOf = (id: string) => players.find(p => p.id === id)?.label ?? "—";

  const acc = new Map<string, Acc>();
  const ensure = (id: string): Acc => {
    let entry = acc.get(id);
    if (!entry) {
      entry = { wins: 0, setsWon: 0, pointsFor: 0, pointsAgainst: 0 };
      acc.set(id, entry);
    }
    return entry;
  };

  for (const match of matches) {
    if (!match.aId || !match.bId || match.sets.length === 0) continue;

    const a = ensure(match.aId);
    const b = ensure(match.bId);

    let aSets = 0;
    let bSets = 0;
    for (const gameSet of match.sets) {
      a.pointsFor += gameSet.a;
      a.pointsAgainst += gameSet.b;
      b.pointsFor += gameSet.b;
      b.pointsAgainst += gameSet.a;
      if (gameSet.a > gameSet.b) aSets += 1;
      else if (gameSet.b > gameSet.a) bSets += 1;
    }

    a.setsWon += aSets;
    b.setsWon += bSets;
    if (aSets > bSets) a.wins += 1;
    else if (bSets > aSets) b.wins += 1;
  }

  const rows: PlayerStat[] = [...acc.entries()].map(([id, v]) => ({
    id,
    name: nameOf(id),
    wins: v.wins,
    setsWon: v.setsWon,
    pointsFor: v.pointsFor,
    pointsAgainst: v.pointsAgainst,
    diff: v.pointsFor - v.pointsAgainst,
  }));

  // nejlepší → nejhorší: výhry → vyhrané sety → rozdíl míčků → jméno
  rows.sort(
    (x, y) => y.wins - x.wins || y.setsWon - x.setsWon || y.diff - x.diff || x.name.localeCompare(y.name)
  );

  return rows;
};
