/** White moves toward 1; Black moves toward 24. */
export type Player = 'white' | 'black';

export type DieValue = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Board: points[1..24] — positive = white count, negative = black count.
 * Index 0 unused.
 */
export type BoardState = {
  points: number[];
  bar: Record<Player, number>;
  off: Record<Player, number>;
};

export type DiceRoll = {
  /** Remaining usable pips this turn (2 or 4 values; doubles expand to 4). */
  values: DieValue[];
  raw: [DieValue, DieValue];
  isDoubles: boolean;
};

/** Single pip step. `from === 0` means bar; `to === 0` means bear-off. */
export type PipMove = {
  from: number;
  to: number;
  die: DieValue;
  hit: boolean;
};

export type GamePhase = 'rolling' | 'moving' | 'ended';

export type GameState = {
  board: BoardState;
  turn: Player;
  phase: GamePhase;
  dice: DiceRoll | null;
  /** Winner when phase === 'ended'. */
  winner: Player | null;
  /** Moves applied this turn (for undo / UI). */
  turnMoves: PipMove[];
};

export const POINTS = 24;
export const CHECKERS_PER_SIDE = 15;
