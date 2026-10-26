const PIPS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

interface DieProps {
  value: number;
  used?: boolean; // greyed out once spent
}

export function Die({ value, used = false }: DieProps) {
  return (
    <div
      role="img"
      aria-label={String(value)}
      className={`grid aspect-square w-12 grid-cols-3 grid-rows-3 rounded-xl bg-stone-50 p-1.5 shadow-lg ${
        used ? 'opacity-30' : ''
      }`}
    >
      {Array.from({ length: 9 }, (_, i) => (
        <div key={i} className="flex items-center justify-center">
          {PIPS[value]?.includes(i) && <span className="h-2.5 w-2.5 rounded-full bg-stone-900" />}
        </div>
      ))}
    </div>
  );
}
