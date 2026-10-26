interface HomeProps {
  whiteOff: number;
  blackOff: number;
  isTarget: boolean;
  onClick: () => void;
  label: string; // Armenian word for "Home"
}

function OffStack({ color, count, reverse }: { color: 'white' | 'black'; count: number; reverse?: boolean }) {
  const look = color === 'white' ? 'bg-stone-100' : 'bg-stone-900 border border-stone-600';
  return (
    <div className={`flex w-full flex-col gap-0.5 px-1 ${reverse ? 'flex-col-reverse' : ''}`}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className={`h-1.5 w-full rounded-sm ${look}`} />
      ))}
    </div>
  );
}

export function Home({ whiteOff, blackOff, isTarget, onClick, label }: HomeProps) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`flex h-full w-full flex-col justify-between rounded-md bg-amber-950 py-2 ${
        isTarget ? 'animate-pulse ring-4 ring-emerald-400' : ''
      }`}
    >
      <OffStack color="black" count={blackOff} />
      <span className="text-center text-[10px] font-semibold text-amber-200">{label}</span>
      <OffStack color="white" count={whiteOff} reverse />
    </button>
  );
}
