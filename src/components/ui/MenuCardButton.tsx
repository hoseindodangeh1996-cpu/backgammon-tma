import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

type MenuCardButtonProps = {
  title: string;
  hint?: string;
  icon?: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick: () => void;
  className?: string;
};

/**
 * Large touch-friendly menu CTA — wood/gold card, not a generic dashboard tile.
 */
export function MenuCardButton({
  title,
  hint,
  icon,
  variant = 'secondary',
  onClick,
  className,
}: MenuCardButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full max-w-sm items-center gap-4 rounded-2xl px-4 py-4 text-left',
        'border transition active:scale-[0.98]',
        variant === 'primary' &&
          'border-gold/40 bg-gradient-to-br from-wood to-wood-deep shadow-board',
        variant === 'secondary' &&
          'border-wood-light/35 bg-wood-deep/80 hover:border-gold/35',
        variant === 'ghost' && 'border-gold/25 bg-transparent',
        className,
      )}
    >
      {icon && (
        <span
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
            'border border-gold/25 bg-night/40 text-gold',
          )}
          aria-hidden
        >
          {icon}
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-display text-lg font-semibold text-cream">
          {title}
        </span>
        {hint && (
          <span className="mt-0.5 block text-xs text-cream/55">{hint}</span>
        )}
      </span>
      <span className="text-gold/50 transition group-active:translate-x-0.5" aria-hidden>
        ›
      </span>
    </button>
  );
}
