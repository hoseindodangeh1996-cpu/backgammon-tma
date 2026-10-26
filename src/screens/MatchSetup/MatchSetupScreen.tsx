import { useTranslation } from 'react-i18next';
import { useHaptic } from '@/hooks/useHaptic';
import { useAppStore } from '@/store/appStore';
import {
  useMatchStore,
  type AiDifficulty,
  type PlayerColor,
} from '@/store/matchStore';
import { ScreenHeader } from '@/components/layout/ScreenHeader';
import { OptionChip } from '@/components/ui/OptionChip';

const DIFFICULTIES: AiDifficulty[] = ['easy', 'medium', 'hard'];

/**
 * AI match setup — difficulty + checker color, then launch matchStore → GAME_BOARD.
 */
export function MatchSetupScreen() {
  const { t } = useTranslation();
  const { impact, selection } = useHaptic();
  const goToMenu = useAppStore((s) => s.goToMenu);
  const setScreen = useAppStore((s) => s.setScreen);

  const draftDifficulty = useMatchStore((s) => s.draftDifficulty);
  const draftPlayerColor = useMatchStore((s) => s.draftPlayerColor);
  const setDraftDifficulty = useMatchStore((s) => s.setDraftDifficulty);
  const setDraftPlayerColor = useMatchStore((s) => s.setDraftPlayerColor);
  const startAiMatch = useMatchStore((s) => s.startAiMatch);

  const difficultyLabel = (d: AiDifficulty) => {
    switch (d) {
      case 'easy':
        return t('setup.easy');
      case 'medium':
        return t('setup.medium');
      case 'hard':
        return t('setup.hard');
    }
  };

  const onSelectDifficulty = (d: AiDifficulty) => {
    selection();
    setDraftDifficulty(d);
  };

  const onSelectColor = (color: PlayerColor) => {
    selection();
    setDraftPlayerColor(color);
  };

  const onStart = () => {
    impact('medium');
    startAiMatch();
    setScreen('game');
  };

  const onBack = () => {
    impact('light');
    goToMenu();
  };

  return (
    <div className="screen-shell gap-6 px-6 py-8">
      <ScreenHeader
        title={t('setup.title')}
        subtitle={t('setup.subtitleAi')}
        onBack={onBack}
        backLabel={t('setup.back')}
      />

      <section className="flex w-full max-w-sm flex-col gap-3 self-center">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-gold/70">
          {t('setup.difficulty')}
        </h2>
        <div className="flex gap-2">
          {DIFFICULTIES.map((d) => (
            <OptionChip
              key={d}
              label={difficultyLabel(d)}
              selected={draftDifficulty === d}
              onClick={() => onSelectDifficulty(d)}
            />
          ))}
        </div>
      </section>

      <section className="flex w-full max-w-sm flex-col gap-3 self-center">
        <h2 className="text-xs font-medium uppercase tracking-[0.18em] text-gold/70">
          {t('setup.chooseColor')}
        </h2>
        <p className="text-xs text-cream/50">{t('setup.youPlayAs')}</p>
        <div className="flex gap-2">
          <OptionChip
            label={t('setup.colorWhite')}
            selected={draftPlayerColor === 'white'}
            onClick={() => onSelectColor('white')}
            swatchClassName="bg-cream"
          />
          <OptionChip
            label={t('setup.colorBlack')}
            selected={draftPlayerColor === 'black'}
            onClick={() => onSelectColor('black')}
            swatchClassName="bg-ink"
          />
        </div>
      </section>

      <div className="mt-auto flex w-full max-w-sm flex-col gap-3 self-center pb-4">
        <button type="button" className="btn-primary" onClick={onStart}>
          {t('setup.start')}
        </button>
      </div>
    </div>
  );
}
