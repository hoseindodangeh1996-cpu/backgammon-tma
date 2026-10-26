import { create } from 'zustand';
import {
    createNewGame,
    rollForTurn,
    listMoves,
    applyPlayerMove,
} from '../game/engine';
import type { GameState } from '../game/engine';
import type { PipMove as Move } from '../game/engine/types';

export type MatchMode = 'ai' | 'local';
export type AiDifficulty = 'easy' | 'medium' | 'hard';
export type Difficulty = AiDifficulty;
export type PlayerColor = 'white' | 'black';

type Point = Move['from'];

const DRAFT_DEFAULTS = {
  mode: 'ai' as MatchMode,
  difficulty: 'medium' as AiDifficulty,
  playerColor: 'white' as PlayerColor,
};

const playAiTurn = (state: GameState, _difficulty: Difficulty): GameState => {
  const moves = listMoves(state);
  if (moves.length === 0) {
    return { ...state, turn: state.turn === 'white' ? 'black' : 'white' };
  }
  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  return applyPlayerMove(state, randomMove);
};

interface MatchStore {
  mode: MatchMode;
  difficulty: AiDifficulty;
  playerColor: PlayerColor;

  draftDifficulty: AiDifficulty;
  draftPlayerColor: PlayerColor;

  gameState: GameState | null;
  selectedPoint: Point | null;
  legalMoves: Move[];
  targetMoves: Move[];
  history: GameState[];
  aiThinking: boolean;

  // تایمر و اخطارها
  turnTimeLeft: number;
  warnings: { white: number; black: number };
  timeoutMessage: string | null;

  setMode: (m: MatchMode) => void;
  setDifficulty: (d: AiDifficulty) => void;
  setPlayerColor: (c: PlayerColor) => void;
  setDraftDifficulty: (d: AiDifficulty) => void;
  setDraftPlayerColor: (c: PlayerColor) => void;

  resetDraft: () => void;
  startLocalMatch: () => void;
  startAiMatch: () => void;

  startMatch: () => void;
  rollDice: () => void;
  selectPoint: (p: Point) => void;
  makeMove: (move: Move) => void;
  undo: () => void;
  aiTurn: () => void;
  resetMatch: () => void;
  tickTimer: () => void;
}

export const useMatchStore = create<MatchStore>((set, get) => ({
  mode: 'ai',
  difficulty: 'medium',
  playerColor: 'white',
  draftDifficulty: 'medium',
  draftPlayerColor: 'white',

  gameState: null,
  selectedPoint: null,
  legalMoves: [],
  targetMoves: [],
  history: [],
  aiThinking: false,

  turnTimeLeft: 45,
  warnings: { white: 0, black: 0 },
  timeoutMessage: null,

  setMode: (mode) => set({ mode }),
  setDifficulty: (difficulty) => set({ difficulty, draftDifficulty: difficulty }),
  setPlayerColor: (playerColor) => set({ playerColor, draftPlayerColor: playerColor }),
  setDraftDifficulty: (draftDifficulty) => set({ draftDifficulty, difficulty: draftDifficulty }),
  setDraftPlayerColor: (draftPlayerColor) => set({ draftPlayerColor, playerColor: draftPlayerColor }),

  resetDraft: () => set({ ...DRAFT_DEFAULTS, draftDifficulty: DRAFT_DEFAULTS.difficulty, draftPlayerColor: DRAFT_DEFAULTS.playerColor }),

  startLocalMatch: () => {
    set({
      mode: 'local',
      gameState: createNewGame(),
      selectedPoint: null,
      legalMoves: [],
      targetMoves: [],
      history: [],
      aiThinking: false,
      turnTimeLeft: 45,
      warnings: { white: 0, black: 0 },
      timeoutMessage: null,
    });
  },

  startAiMatch: () => {
    const { draftDifficulty, draftPlayerColor } = get();
    set({
      mode: 'ai',
      difficulty: draftDifficulty,
      playerColor: draftPlayerColor,
      gameState: createNewGame(draftPlayerColor === 'white' ? 'white' : 'black'),
      selectedPoint: null,
      legalMoves: [],
      targetMoves: [],
      history: [],
      aiThinking: false,
      turnTimeLeft: 45,
      warnings: { white: 0, black: 0 },
      timeoutMessage: null,
    });
  },

  startMatch: () => {
    const gameState = createNewGame();
    set({
      gameState,
      selectedPoint: null,
      legalMoves: [],
      targetMoves: [],
      history: [],
      aiThinking: false,
      turnTimeLeft: 45,
      warnings: { white: 0, black: 0 },
      timeoutMessage: null,
    });
  },

  rollDice: () => {
    const { gameState } = get();
    if (!gameState) return;
    const next = rollForTurn(gameState);
    set({
      gameState: next,
      legalMoves: listMoves(next),
      selectedPoint: null,
      targetMoves: [],
      history: [],
      turnTimeLeft: 45, // ریست تایمر با تاس ریختن
    });
  },

  selectPoint: (point) => {
    const { selectedPoint, targetMoves, legalMoves } = get();

    if (selectedPoint !== null) {
      const move = targetMoves.find((m) => m.to === point);
      if (move) {
        get().makeMove(move);
        return;
      }
    }

    if (selectedPoint === point) {
      set({ selectedPoint: null, targetMoves: [] });
      return;
    }

    const moves = legalMoves.filter((m) => m.from === point);
    if (moves.length > 0) {
      set({ selectedPoint: point, targetMoves: moves });
    } else {
      set({ selectedPoint: null, targetMoves: [] });
    }
  },

  makeMove: (move) => {
    const { gameState, history } = get();
    if (!gameState) return;

    const next = applyPlayerMove(gameState, move);
    const turnChanged = next.turn !== gameState.turn;

    set({
      gameState: next,
      legalMoves: turnChanged ? [] : listMoves(next),
      selectedPoint: null,
      targetMoves: [],
      history: turnChanged ? [] : [...history, gameState],
      turnTimeLeft: turnChanged ? 45 : get().turnTimeLeft, // اگر نوبت عوض شد تایمر ریست شود
    });
  },

  undo: () => {}, // قانون دست به مهره بدون بازگشت

  aiTurn: () => {
    const { gameState, difficulty, aiThinking } = get();
    if (!gameState || aiThinking) return;
    if (gameState.phase === 'ended') return;

    set({ aiThinking: true });

    setTimeout(() => {
      let current = get().gameState;
      if (!current || current.phase === 'ended') {
        set({ aiThinking: false });
        return;
      }

      if (current.phase === 'rolling') {
        current = rollForTurn(current);
        set({ gameState: current });
      }

      if (current.phase === 'moving') {
        const nextState = playAiTurn(current, difficulty);
        set({
          gameState: nextState,
          legalMoves: [],
          selectedPoint: null,
          targetMoves: [],
          history: [],
          aiThinking: false,
          turnTimeLeft: 45,
        });
      } else {
        set({ aiThinking: false });
      }
    }, 800);
  },

  tickTimer: () => {
    const { gameState, turnTimeLeft, warnings, aiThinking, mode, playerColor } = get();
    if (!gameState || gameState.phase === 'ended' || aiThinking) return;
    if (mode === 'ai' && gameState.turn !== playerColor) return;

    // تا زمانی که فاز بازی rolling یا moving است، تایمر باید کم شود
    if (gameState.phase !== 'rolling' && gameState.phase !== 'moving') return;

    if (turnTimeLeft > 1) {
      set({ turnTimeLeft: turnTimeLeft - 1 });
    } else {
      const currentTurn = gameState.turn;
      const currentWarnings = { ...warnings, [currentTurn]: warnings[currentTurn] + 1 };

      if (currentWarnings[currentTurn] >= 3) {
        set({
          warnings: currentWarnings,
          turnTimeLeft: 0,
          gameState: {
            ...gameState,
            phase: 'ended',
            winner: currentTurn === 'white' ? 'black' : 'white',
          },
          timeoutMessage: 'Ժամանակը սպառվել է (Պարտություն)',
        });
      } else {
        set({
          warnings: currentWarnings,
          turnTimeLeft: 45,
          timeoutMessage: `Զգուշացում ${currentWarnings[currentTurn]}/3: Ժամանակը սպառվեց!`,
        });
        setTimeout(() => set({ timeoutMessage: null }), 3000);
      }
    }
  },

  resetMatch: () =>
    set({
      gameState: null,
      selectedPoint: null,
      legalMoves: [],
      targetMoves: [],
      history: [],
      aiThinking: false,
      turnTimeLeft: 45,
      warnings: { white: 0, black: 0 },
      timeoutMessage: null,
    }),
}));
