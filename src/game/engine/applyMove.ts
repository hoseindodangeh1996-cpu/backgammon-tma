import {
  cloneBoard,
  countOnPoint,
  opponent,
  signFor,
} from './board';
import type { BoardState, PipMove, Player } from './types';

/**
 * Apply a single legal pip move. Caller must ensure legality via moveGen.
 */
export function applyPipMove(
  board: BoardState,
  player: Player,
  move: PipMove,
): BoardState {
  const next = cloneBoard(board);
  const sign = signFor(player);
  const opp = opponent(player);

  // Remove from source
  if (move.from === 0) {
    if (next.bar[player] <= 0) {
      throw new Error('No checker on bar');
    }
    next.bar[player] -= 1;
  } else {
    if (countOnPoint(next, move.from, player) <= 0) {
      throw new Error(`No ${player} checker on point ${move.from}`);
    }
    next.points[move.from]! -= sign;
  }

  // Destination
  if (move.to === 0) {
    next.off[player] += 1;
  } else {
    if (move.hit) {
      if (countOnPoint(next, move.to, opp) !== 1) {
        throw new Error(`Invalid hit on point ${move.to}`);
      }
      next.points[move.to] = 0;
      next.bar[opp] += 1;
    }
    next.points[move.to]! += sign;
  }

  return next;
}
