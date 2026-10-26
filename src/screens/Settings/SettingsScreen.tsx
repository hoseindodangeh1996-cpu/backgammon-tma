import { useTranslation } from 'react-i18next';
import { useAppStore } from '@/store/appStore';
import { useHaptic } from '@/hooks/useHaptic';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { cn } from '@/lib/cn';

function ToggleRow({
  label,
  value,
  onToggle,
}: {
  label: string;
  value: boolean;
  onToggle: () => void;
}) {
  const { t } = useTranslation();
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left',
        'border border-wood-light/25 bg-wood-deep/60',
      )}
    >
      <span className="text-sm text-cream">{label}</span>
      <span
        className={cn(
          'rounded-lg px-2.5 py-1 text-xs font-medium',
          value ? 'bg-gold/15 text-gold-soft' : 'bg-night/60 text-cream/45',
        )}
      >
        {value ? t('settings.on') : t('settings.off')}
      </span>
    </button>
  );
}

export function SettingsScreen() {
  const { t } = useTranslation();
  const { impact } = useHaptic();
  const goToMenu = useAppStore((s) => s.goToMenu);
  const soundEnabled = useAppStore((s) => s.soundEnabled);
  const hapticsEnabled = useAppStore((s) => s.hapticsEnabled);
  const reducedMotion = useAppStore((s) => s.reducedMotion);
  const introSeen = useAppStore((s) => s.introSeen);
  const setSoundEnabled = useAppStore((s) => s.setSoundEnabled);
  const setHapticsEnabled = useAppStore((s) => s.setHapticsEnabled);
  const setReducedMotion = useAppStore((s) => s.setReducedMotion);
  const resetIntroPreference = useAppStore((s) => s.resetIntroPreference);

  const onBack = () => {
    impact('light');
    goToMenu();
  };

  return (
    <div className="screen-shell gap-6 px-6 py-8">
      <ScreenHeader
        title={t('settings.title')}
        onBack={onBack}
        backLabel={t('settings.back')}
      />

      <div className="flex w-full max-w-sm flex-col gap-3 self-center">
        <ToggleRow
          label={t('settings.sound')}
          value={soundEnabled}
          onToggle={() => {
            impact('light');
            setSoundEnabled(!soundEnabled);
          }}
        />
        <ToggleRow
          label={t('settings.haptics')}
          value={hapticsEnabled}
          onToggle={() => setHapticsEnabled(!hapticsEnabled)}
        />
        <ToggleRow
          label={t('settings.reducedMotion')}
          value={reducedMotion}
          onToggle={() => {
            impact('light');
            setReducedMotion(!reducedMotion);
          }}
        />

        <div className="mt-1 rounded-xl border border-gold/20 bg-night/40 px-4 py-3">
          <p className="text-sm text-cream">{t('settings.language')}</p>
          <p className="mt-1 text-xs text-gold-soft">{t('settings.languageHy')}</p>
        </div>

        {introSeen && (
          <button
            type="button"
            className="btn-ghost mt-2 w-full"
            onClick={() => {
              impact('medium');
              void resetIntroPreference();
            }}
          >
            {t('settings.showIntro')}
          </button>
        )}
      </div>
    </div>
  );
}
