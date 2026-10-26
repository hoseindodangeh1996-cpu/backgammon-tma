import type { DiceRoll, DieValue } from './types';

export function rollDie(rng: () => number = Math.random): DieValue {
  return (Math.floor(rng() * 6) + 1) as DieValue;
}

export function createDiceRoll(
  d1: DieValue,
  d2: DieValue,
): DiceRoll {
  const isDoubles = d1 === d2;
  const values: DieValue[] = isDoubles ? [d1, d1, d1, d1] : [d1, d2];
  return { values, raw: [d1, d2], isDoubles };
}

export function rollDice(rng: () => number = Math.random): DiceRoll {
  return createDiceRoll(rollDie(rng), rollDie(rng));
}

/** Remove one occurrence of `die` from remaining values. */
export function consumeDie(values: DieValue[], die: DieValue): DieValue[] {
  const idx = values.indexOf(die);
  if (idx === -1) {
    throw new Error(`Die ${die} not in remaining values [${values.join(',')}]`);
  }
  return [...values.slice(0, idx), ...values.slice(idx + 1)];
}
