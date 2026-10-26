import { Checker } from './Checker';
import type { CheckerColor } from './boardTypes';

interface PointProps {
  index: number;
  position: 'top' | 'bottom';
  color: CheckerColor | null;
  count: number;
  isSelected: boolean;
  isTarget: boolean;
  onClick: (index: number) => void;
  ariaLabel: string;
}

const MAX_VISIBLE = 5;

export function Point({
  index,
  position,
  color,
  count,
  isSelected,
  isTarget,
  onClick,
  ariaLabel,
}: PointProps) {
  const isDark = index % 2 === 0;
  const fill = isTarget
    ? 'fill-emerald-400'
    : isSelected
      ? 'fill-amber-300'
      : isDark
        ? 'fill-amber-800'
        : 'fill-orange-200';

  const triangle =
    position === 'bottom' ? '0,500 100,500 50,10' : '0,0 100,0 50,490';

  const visible = Math.min(count, MAX_VISIBLE);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={() => onClick(index)}
      className="relative aspect-[1/5] w-full"
    >
      <svg
        viewBox="0 0 100 500"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full ${isTarget ? 'animate-pulse' : ''}`}
      >
        <polygon points={triangle} className={fill} />
      </svg>

      <div
        className={`relative z-10 flex h-full flex-col items-center px-[6%] ${
          position === 'bottom' ? 'flex-col-reverse' : ''
        }`}
      >
        {color &&
          Array.from({ length: visible }, (_, i) => {
            const isLast = i === visible - 1;
            return (
              <Checker
                key={i}
                color={color}
                selected={isSelected && isLast}
                badge={isLast && count > MAX_VISIBLE ? count : undefined}
              />
            );
          })}
      </div>
    </button>
  );
}
