import {
  bearOffDistance,
  canBearOff,
  cloneBoard,
  countOnPoint,
  homePoints,
  isInHome,
  opponent,
} from './board';
import { applyPipMove } from './applyMove';
import type { BoardState, DieValue, PipMove, Player } from './types';

function destinationPoint(player: Player, from: number, die: DieValue): number | null {
  if (from === 0) {
    // Enter from bar
    return player === 'white' ? 25 - die : die;
  }
  const to = player === 'white' ? from - die : from + die;
  if (to < 1 || to > 24) return null;
  return to;
}

function isBlocked(board: BoardState, player: Player, point: number): boolean {
  return countOnPoint(board, point, opponent(player)) >= 2;
}

function wouldHit(board: BoardState, player: Player, point: number): boolean {
  return countOnPoint(board, point, opponent(player)) === 1;
}

/** Highest home point still occupied (by pip distance). */
function highestHomeOccupied(board: BoardState, player: Player): number {
  const homes = homePoints(player);
  let best = 0;
  for (const p of homes) {
    if (countOnPoint(board, p, player) > 0) {
      const dist = bearOffDistance(player, p);
      if (dist > best) best = dist;
    }
  }
  return best;
}

function canBearOffWithDie(
  board: BoardState,
  player: Player,
  from: number,
  die: DieValue,
): boolean {
  if (!canBearOff(board, player)) return false;
  if (!isInHome(player, from)) return false;
  if (countOnPoint(board, from, player) <= 0) return false;

  const dist = bearOffDistance(player, from);
  if (dist === die) return true;
  // Exact higher die allowed only if no checkers on higher points
  if (die > dist && highestHomeOccupied(board, player) === dist) return true;
  return false;
}

/** All legal single-die moves from the current board for `player`. */
export function generateDieMoves(
  board: BoardState,
  player: Player,
  die: DieValue,
): PipMove[] {
  const moves: PipMove[] = [];

  // Bar entry mandatory if checkers on bar
  if (board.bar[player] > 0) {
    const to = destinationPoint(player, 0, die);
    if (to !== null && !isBlocked(board, player, to)) {
      moves.push({
        from: 0,
        to,
        die,
        hit: wouldHit(board, player, to),
      });
    }
    return moves;
  }

  for (let from = 1; from <= 24; from++) {
    if (countOnPoint(board, from, player) <= 0) continue;

    // Bear off
    if (canBearOffWithDie(board, player, from, die)) {
      moves.push({ from, to: 0, die, hit: false });
    }

    const to = destinationPoint(player, from, die);
    if (to === null) continue;
    if (isBlocked(board, player, to)) continue;

    moves.push({
      from,
      to,
      die,
      hit: wouldHit(board, player, to),
    });
  }

  return moves;
}

export type PlaySequence = PipMove[];

/**
 * All legal play sequences that use the maximum number of dice possible.
 * (Standard: play as many dice as you can; if only one of two non-equal
 * dice can be used, prefer the higher — encoded by generating max-length
 * sequences and, for length-1 with two distinct dice available, keeping
 * only those that use the higher die when both lengths are 1.)
 */
export function generateLegalPlays(
  board: BoardState,
  player: Player,
  dice: DieValue[],
): PlaySequence[] {
  if (dice.length === 0) return [];

  const all: PlaySequence[] = [];

  function dfs(current: BoardState, remaining: DieValue[], path: PipMove[]): void {
    if (remaining.length === 0) {
      all.push(path.slice());
      return;
    }

    const uniqueDice = [...new Set(remaining)];
    let extended = false;

    for (const die of uniqueDice) {
      const options = generateDieMoves(current, player, die);
      for (const move of options) {
        extended = true;
        const nextBoard = applyPipMove(current, player, move);
        const nextRemaining = remaining.slice();
        nextRemaining.splice(nextRemaining.indexOf(die), 1);
        dfs(nextBoard, nextRemaining, [...path, move]);
      }
    }

    if (!extended && path.length > 0) {
      all.push(path.slice());
    }
  }

  dfs(cloneBoard(board), dice.slice(), []);

  if (all.length === 0) return [];

  const maxLen = Math.max(...all.map((p) => p.length));
  let maximal = all.filter((p) => p.length === maxLen);

  // If we can only play one die of a non-double pair, must use the higher.
  if (
    maxLen === 1 &&
    dice.length >= 2 &&
    !dice.every((d) => d === dice[0])
  ) {
    const higher = Math.max(...dice) as DieValue;
    const withHigher = maximal.filter((p) => p[0]?.die === higher);
    if (withHigher.length > 0) {
      maximal = withHigher;
    }
  }

  return maximal;
}

/** Next pip moves consistent with at least one maximal remaining play. */
export function getAvailableMoves(
  board: BoardState,
  player: Player,
  remainingDice: DieValue[],
): PipMove[] {
  const plays = generateLegalPlays(board, player, remainingDice);
  const seen = new Set<string>();
  const moves: PipMove[] = [];

  for (const play of plays) {
    const first = play[0];
    if (!first) continue;
    const key = `${first.from}->${first.to}:${first.die}`;
    if (seen.has(key)) continue;
    seen.add(key);
    moves.push(first);
  }

  return moves;
}

export function hasAnyMove(
  board: BoardState,
  player: Player,
  dice: DieValue[],
): boolean {
  return getAvailableMoves(board, player, dice).length > 0;
}
