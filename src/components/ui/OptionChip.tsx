import { cn } from '@/lib/cn';

type OptionChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
  /** Optional swatch for color pickers */
  swatchClassName?: string;
};

export function OptionChip({
  label,
  selected,
  onClick,
  className,
  swatchClassName,
}: OptionChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5',
        'border text-sm font-medium transition active:scale-[0.98]',
        selected
          ? 'border-gold bg-gold/15 text-gold-soft shadow-glow'
          : 'border-wood-light/30 bg-night/50 text-cream/75',
        className,
      )}
    >
      {swatchClassName && (
        <span
          className={cn('h-4 w-4 rounded-full border border-cream/30', swatchClassName)}
          aria-hidden
        />
      )}
      {label}
    </button>
  );
}
