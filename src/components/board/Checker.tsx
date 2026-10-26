import type { CheckerColor } from './boardTypes';

interface CheckerProps {
  color: CheckerColor;
  selected?: boolean;
  badge?: number; // shows a number when many checkers are stacked
}

export function Checker({ color, selected = false, badge }: CheckerProps) {
  const look =
    color === 'white'
      ? 'bg-stone-100 border-stone-300 text-stone-900'
      : 'bg-stone-900 border-stone-600 text-stone-100';

  return (
    <div
      className={`relative flex aspect-square w-full items-center justify-center rounded-full border-2 shadow-md ${look} ${
        selected ? 'ring-4 ring-amber-400' : ''
      }`}
    >
      <div className="absolute inset-[18%] rounded-full border border-current opacity-20" />
      {badge !== undefined && (
        <span className="relative text-[10px] font-bold leading-none">{badge}</span>
      )}
    </div>
  );
}
