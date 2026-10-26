import { Die } from './Die';

export interface DiceItem {
  value: number;
  used: boolean;
}

interface DiceProps {
  dice: DiceItem[];
  canRoll: boolean;
  onRoll: () => void;
  rollLabel: string; // Armenian "Roll dice" text
}

export function Dice({ dice, canRoll, onRoll, rollLabel }: DiceProps) {
  if (dice.length === 0) {
    return canRoll ? (
      <button
        type="button"
        onClick={onRoll}
        className="rounded-full bg-amber-500 px-6 py-3 font-bold text-stone-900 shadow-lg active:scale-95"
      >
        {rollLabel}
      </button>
    ) : null;
  }

  return (
    <div className="flex items-center justify-center gap-3">
      {dice.map((d, i) => (
        <Die key={i} value={d.value} used={d.used} />
      ))}
    </div>
  );
}
