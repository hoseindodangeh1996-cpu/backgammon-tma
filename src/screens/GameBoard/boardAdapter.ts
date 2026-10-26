import type { GameState, Player } from '../../game/engine';
import type { BoardSpot, PointView } from '../../components/board';
import type { DiceItem } from '../../components/dice';

// ====== ASSUMPTIONS (the only place to fix if the engine differs) ======
// How a move says "from the bar" / "to bear off":
export const BAR_FROM: Record<Player, number> = { white: 0, black: 0 };
export const OFF_TO: Record<Player, number> = { white: 0, black: 25 };
// board.points[n - 1] is point n; positive = white, negative = black
const pointValue = (points: number[], n: number) => points[n] ?? 0;
// ========================================================================

export function toPointViews(points: number[]): PointView[] {
  return Array.from({ length: 24 }, (_, i) => {
    const n = i + 1;
    const v = pointValue(points, n);
    return {
      index: n,
      color: v > 0 ? 'white' : v < 0 ? 'black' : null,
      count: Math.abs(v),
    };
  });
}

// Board tap -> engine number
export function spotToNumber(spot: BoardSpot, player: Player): number {
  if (spot === 'bar') return BAR_FROM[player];
  if (spot === 'off') return OFF_TO[player];
  return spot;
}

// Engine number -> board spot
export function fromToSpot(n: number, player: Player): BoardSpot {
  return n === BAR_FROM[player] ? 'bar' : n;
}
export function toToSpot(n: number, player: Player): BoardSpot {
  return n === OFF_TO[player] ? 'off' : n;
}

// Show the dice, greying out the ones already spent this turn
export function toDiceItems(state: GameState): DiceItem[] {
  const roll = state.dice;
  if (!roll || state.phase !== 'moving') return [];

  const [a, b] = roll.raw;
  const all = roll.isDoubles ? [a, a, a, a] : [a, b];
  const spent = state.turnMoves.map((m) => m.die);

  return all.map((value) => {
    const i = spent.indexOf(value);
    if (i === -1) return { value, used: false };
    spent.splice(i, 1);
    return { value, used: true };
  });
}
