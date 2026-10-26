import { Checker } from './Checker';

interface BarProps {
  whiteCount: number;
  blackCount: number;
  isSelected: boolean;
  onClick: () => void;
  ariaLabel: string;
}

const MAX_VISIBLE = 3;

function BarStack({ color, count, selected }: { color: 'white' | 'black'; count: number; selected: boolean }) {
  const visible = Math.min(count, MAX_VISIBLE);
  return (
    <div className="flex w-full flex-col gap-1 px-[8%]">
      {Array.from({ length: visible }, (_, i) => (
        <Checker
          key={i}
          color={color}
          selected={selected && i === visible - 1}
          badge={i === visible - 1 && count > MAX_VISIBLE ? count : undefined}
        />
      ))}
    </div>
  );
}

export function Bar({ whiteCount, blackCount, isSelected, onClick, ariaLabel }: BarProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-full w-full flex-col justify-between rounded-md bg-amber-950 py-2"
    >
      <BarStack color="black" count={blackCount} selected={isSelected} />
      <BarStack color="white" count={whiteCount} selected={isSelected} />
    </button>
  );
}
