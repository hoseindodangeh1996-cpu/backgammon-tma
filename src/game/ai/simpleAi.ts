import {
  applyPlayerMove,
  listMoves,
  rollForTurn,
  type GameState,
  type PipMove,
} from '@/game/engine';

export type AiDifficulty = 'easy' | 'medium' | 'hard';

function pickRandom<T>(items: T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]!;
}

export function chooseAiMove(
  state: GameState,
  difficulty: AiDifficulty,
  rng: () => number = Math.random,
): PipMove | null {
  const moves = listMoves(state);
  if (moves.length === 0) return null;

  if (difficulty === 'easy') {
    return pickRandom(moves, rng);
  }

  let best = moves[0]!;
  let bestScore = -Infinity;
  for (const m of moves) {
    let score = 0;
    if (m.hit) score += 40;
    if (m.to === 0) score += 35;
    if (m.from === 0) score += 25;
    if (m.to > 0) score += m.die;
    if (difficulty === 'hard') score += m.die * 0.5;
    score += rng() * (difficulty === 'medium' ? 8 : 2);

    if (score > bestScore) {
      bestScore = score;
      best = m;
    }
  }
  return best;
}

/** Roll (if needed) and play all pip moves for the AI's turn. */
export function playAiTurn(
  state: GameState,
  difficulty: AiDifficulty,
  rng: () => number = Math.random,
): GameState {
  let s = state;
  if (s.phase === 'ended') return s;

  if (s.phase === 'rolling') {
    s = rollForTurn(s, rng);
  }

  let guard = 8;
  while (s.phase === 'moving' && guard-- > 0) {
    const move = chooseAiMove(s, difficulty, rng);
    if (!move) break;
    s = applyPlayerMove(s, move);
  }

  return s;
}
