import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { useHaptic } from '@/hooks/useHaptic';
import { useTelegram } from '@/hooks/useTelegram';
import { useAppStore } from '@/store/appStore';
import { useMatchStore } from '@/store/matchStore';
import { env } from '@/config/env';
import { MenuCardButton } from '@/components/ui/MenuCardButton';

/**
 * Polished Armenian main menu — AI / local / settings CTAs.
 */
export function MainMenuScreen() {
  const { t } = useTranslation();
  const { displayName, isTelegram } = useTelegram();
  const { impact } = useHaptic();
  const setScreen = useAppStore((s) => s.setScreen);
  const resetDraft = useMatchStore((s) => s.resetDraft);
  const startLocalMatch = useMatchStore((s) => s.startLocalMatch);

  const onPlayAi = () => {
    impact('medium');
    resetDraft();
    setScreen('setup');
  };

  const onPlayLocal = () => {
    impact('medium');
    startLocalMatch();
    setScreen('game');
  };

  const onSettings = () => {
    impact('light');
    setScreen('settings');
  };

  return (
    <div className="screen-shell relative items-center justify-between gap-6 overflow-hidden px-6 py-10">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(212,175,55,0.12), transparent 55%), radial-gradient(ellipse at 80% 100%, rgba(107,63,36,0.35), transparent 50%)',
        }}
      />

      <header className="animate-rise-in relative z-10 mt-6 flex w-full max-w-sm flex-col items-center text-center">
        <div className="mb-4 h-px w-16 bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <h1 className="font-display text-5xl font-semibold tracking-wide text-gold drop-shadow-sm">
          {t('app.title')}
        </h1>
        <p className="mt-3 text-sm text-cream/70">{t('app.tagline')}</p>
        <p className="mt-5 text-sm text-gold-soft">
          {t('menu.welcome', { name: displayName })}
        </p>
        {!isTelegram && (
          <p className="mt-2 text-xs text-tg-hint">{t('errors.telegram')}</p>
        )}
      </header>

      <nav
        className={cn(
          'animate-rise-in relative z-10 mb-4 flex w-full max-w-sm flex-col gap-3',
        )}
        style={{ animationDelay: '70ms' }}
      >
        <MenuCardButton
          variant="primary"
          title={t('menu.playVsAi')}
          hint={t('menu.playVsAiHint')}
          icon={<span className="font-display text-xl">♜</span>}
          onClick={onPlayAi}
        />
        <MenuCardButton
          variant="secondary"
          title={t('menu.playLocal')}
          hint={t('menu.playLocalHint')}
          icon={<span className="font-display text-xl">♟</span>}
          onClick={onPlayLocal}
        />
        <MenuCardButton
          variant="ghost"
          title={t('menu.settings')}
          hint={t('menu.settingsHint')}
          icon={<span className="text-lg">⚙</span>}
          onClick={onSettings}
        />

        <p className="mt-3 text-center text-xs text-tg-hint">
          {t('app.version', { version: env.appVersion })}
        </p>
      </nav>
    </div>
  );
}
