import { createInitialBoard, hasWon, opponent } from './board';
import { consumeDie, createDiceRoll, rollDice } from './dice';
import { applyPipMove } from './applyMove';
import { getAvailableMoves, hasAnyMove } from './moveGen';
import type {
  DieValue,
  DiceRoll,
  GameState,
  PipMove,
  Player,
} from './types';

export function createNewGame(firstPlayer: Player = 'white'): GameState {
  return {
    board: createInitialBoard(),
    turn: firstPlayer,
    phase: 'rolling',
    dice: null,
    winner: null,
    turnMoves: [],
  };
}

export function rollForTurn(
  state: GameState,
  rng?: () => number,
): GameState {
  if (state.phase !== 'rolling') {
    throw new Error('Cannot roll unless phase is rolling');
  }

  const dice = rollDice(rng);
  return afterRoll(state, dice);
}

/** Inject a known roll (tests / debug). */
export function setRoll(state: GameState, d1: DieValue, d2: DieValue): GameState {
  if (state.phase !== 'rolling') {
    throw new Error('Cannot set roll unless phase is rolling');
  }
  return afterRoll(state, createDiceRoll(d1, d2));
}

function afterRoll(state: GameState, dice: DiceRoll): GameState {
  if (!hasAnyMove(state.board, state.turn, dice.values)) {
    // No moves — pass turn
    return {
      ...state,
      dice: null,
      turnMoves: [],
      turn: opponent(state.turn),
      phase: 'rolling',
    };
  }

  return {
    ...state,
    dice,
    turnMoves: [],
    phase: 'moving',
  };
}

export function listMoves(state: GameState): PipMove[] {
  if (state.phase !== 'moving' || !state.dice) return [];
  return getAvailableMoves(state.board, state.turn, state.dice.values);
}

export function applyPlayerMove(state: GameState, move: PipMove): GameState {
  if (state.phase !== 'moving' || !state.dice) {
    throw new Error('Not in moving phase');
  }

  const legal = listMoves(state);
  const ok = legal.some(
    (m) =>
      m.from === move.from &&
      m.to === move.to &&
      m.die === move.die &&
      m.hit === move.hit,
  );
  if (!ok) {
    throw new Error('Illegal move');
  }

  const board = applyPipMove(state.board, state.turn, move);
  const values = consumeDie(state.dice.values, move.die);
  const turnMoves = [...state.turnMoves, move];

  if (hasWon(board, state.turn)) {
    return {
      ...state,
      board,
      dice: null,
      turnMoves,
      phase: 'ended',
      winner: state.turn,
    };
  }

  if (values.length === 0) {
    return {
      ...state,
      board,
      dice: null,
      turnMoves: [],
      turn: opponent(state.turn),
      phase: 'rolling',
    };
  }

  if (!hasAnyMove(board, state.turn, values)) {
    return {
      ...state,
      board,
      dice: null,
      turnMoves: [],
      turn: opponent(state.turn),
      phase: 'rolling',
    };
  }

  return {
    ...state,
    board,
    dice: { ...state.dice, values },
    turnMoves,
    phase: 'moving',
  };
}

/** Find a matching legal move for UI (from/to), picking die automatically. */
export function findMoveForTargets(
  state: GameState,
  from: number,
  to: number,
): PipMove | null {
  const moves = listMoves(state).filter((m) => m.from === from && m.to === to);
  if (moves.length === 0) return null;
  // Prefer higher die if multiple (rare with doubles)
  return moves.sort((a, b) => b.die - a.die)[0] ?? null;
}
