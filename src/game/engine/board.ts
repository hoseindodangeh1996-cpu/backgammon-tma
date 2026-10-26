import {
  CHECKERS_PER_SIDE,
  POINTS,
  type BoardState,
  type Player,
} from './types';

export function createEmptyBoard(): BoardState {
  return {
    points: Array.from({ length: POINTS + 1 }, () => 0),
    bar: { white: 0, black: 0 },
    off: { white: 0, black: 0 },
  };
}

/** Standard international starting position. */
export function createInitialBoard(): BoardState {
  const board = createEmptyBoard();
  // White
  board.points[24] = 2;
  board.points[13] = 5;
  board.points[8] = 3;
  board.points[6] = 5;
  // Black (negative)
  board.points[1] = -2;
  board.points[12] = -5;
  board.points[17] = -3;
  board.points[19] = -5;
  return board;
}

export function cloneBoard(board: BoardState): BoardState {
  return {
    points: board.points.slice(),
    bar: { ...board.bar },
    off: { ...board.off },
  };
}

export function countOnPoint(board: BoardState, point: number, player: Player): number {
  const v = board.points[point] ?? 0;
  return player === 'white' ? Math.max(0, v) : Math.max(0, -v);
}

export function opponent(player: Player): Player {
  return player === 'white' ? 'black' : 'white';
}

export function signFor(player: Player): 1 | -1 {
  return player === 'white' ? 1 : -1;
}

export function totalCheckers(board: BoardState, player: Player): number {
  let n = board.bar[player] + board.off[player];
  for (let p = 1; p <= POINTS; p++) {
    n += countOnPoint(board, p, player);
  }
  return n;
}

export function assertValidBoard(board: BoardState): void {
  if (totalCheckers(board, 'white') !== CHECKERS_PER_SIDE) {
    throw new Error(`White checker count invalid: ${totalCheckers(board, 'white')}`);
  }
  if (totalCheckers(board, 'black') !== CHECKERS_PER_SIDE) {
    throw new Error(`Black checker count invalid: ${totalCheckers(board, 'black')}`);
  }
}

/** Home board points for bearing off. */
export function homePoints(player: Player): number[] {
  return player === 'white'
    ? [1, 2, 3, 4, 5, 6]
    : [19, 20, 21, 22, 23, 24];
}

export function isInHome(player: Player, point: number): boolean {
  return homePoints(player).includes(point);
}

/** Pip distance to bear off from a point. */
export function bearOffDistance(player: Player, point: number): number {
  return player === 'white' ? point : 25 - point;
}

/** True if all of player's checkers are in home or already off (none on bar / outer). */
export function canBearOff(board: BoardState, player: Player): boolean {
  if (board.bar[player] > 0) return false;
  for (let p = 1; p <= POINTS; p++) {
    if (countOnPoint(board, p, player) > 0 && !isInHome(player, p)) {
      return false;
    }
  }
  return true;
}

export function hasWon(board: BoardState, player: Player): boolean {
  return board.off[player] >= CHECKERS_PER_SIDE;
}
