import { create } from 'zustand';

export type MatchMode = 'ai' | 'local';
export type AiDifficulty = 'easy' | 'medium' | 'hard';
/** Checker color the human (or seat A in local) plays as. */
export type PlayerColor = 'white' | 'black';

export type MatchConfig = {
  mode: MatchMode;
  difficulty: AiDifficulty;
  playerColor: PlayerColor;
};

export type MatchState = {
  active: boolean;
  mode: MatchMode | null;
  difficulty: AiDifficulty;
  playerColor: PlayerColor;
  /** Draft values edited on Match Setup before start. */
  draftDifficulty: AiDifficulty;
  draftPlayerColor: PlayerColor;

  setDraftDifficulty: (difficulty: AiDifficulty) => void;
  setDraftPlayerColor: (color: PlayerColor) => void;
  resetDraft: () => void;

  /** Start vs AI using current draft options. */
  startAiMatch: () => void;
  /** Pass-and-play on one device — no AI difficulty. */
  startLocalMatch: () => void;
  endMatch: () => void;
};

const DEFAULT_DIFFICULTY: AiDifficulty = 'medium';
const DEFAULT_COLOR: PlayerColor = 'white';

export const useMatchStore = create<MatchState>((set, get) => ({
  active: false,
  mode: null,
  difficulty: DEFAULT_DIFFICULTY,
  playerColor: DEFAULT_COLOR,
  draftDifficulty: DEFAULT_DIFFICULTY,
  draftPlayerColor: DEFAULT_COLOR,

  setDraftDifficulty: (draftDifficulty) => set({ draftDifficulty }),
  setDraftPlayerColor: (draftPlayerColor) => set({ draftPlayerColor }),

  resetDraft: () =>
    set({
      draftDifficulty: DEFAULT_DIFFICULTY,
      draftPlayerColor: DEFAULT_COLOR,
    }),

  startAiMatch: () => {
    const { draftDifficulty, draftPlayerColor } = get();
    set({
      active: true,
      mode: 'ai',
      difficulty: draftDifficulty,
      playerColor: draftPlayerColor,
    });
  },

  startLocalMatch: () => {
    set({
      active: true,
      mode: 'local',
      difficulty: DEFAULT_DIFFICULTY,
      playerColor: 'white',
    });
  },

  endMatch: () =>
    set({
      active: false,
      mode: null,
    }),
}));
