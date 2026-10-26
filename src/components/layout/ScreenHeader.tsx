import { cn } from '@/lib/cn';

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel?: string;
  className?: string;
};

/** In-app header; Telegram native BackButton is separate (useTelegramBackButton). */
export function ScreenHeader({
  title,
  subtitle,
  onBack,
  backLabel,
  className,
}: ScreenHeaderProps) {
  return (
    <header className={cn('flex w-full max-w-sm flex-col gap-1 self-center', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-display text-2xl text-gold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-cream/60">{subtitle}</p>}
        </div>
        {onBack && backLabel && (
          <button type="button" className="btn-ghost shrink-0 !min-h-10 !px-3 !py-2" onClick={onBack}>
            {backLabel}
          </button>
        )}
      </div>
    </header>
  );
}
