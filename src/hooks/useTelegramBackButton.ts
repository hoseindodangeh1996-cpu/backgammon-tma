import { useEffect } from 'react';
import { bindBackButton, unbindBackButton } from '@/services/telegram';
import { useAppStore, type AppScreen } from '@/store/appStore';
import { useMatchStore } from '@/store/matchStore';

const SCREENS_WITH_BACK: ReadonlySet<AppScreen> = new Set([
  'setup',
  'settings',
  'game',
]);

/**
 * Shows Telegram BackButton on nested screens and routes back to Main Menu.
 * Also ends an active match when leaving the game board.
 */
export function useTelegramBackButton(): void {
  const screen = useAppStore((s) => s.screen);
  const setScreen = useAppStore((s) => s.setScreen);
  const endMatch = useMatchStore((s) => s.resetMatch);
  useEffect(() => {
    if (!SCREENS_WITH_BACK.has(screen)) {
      unbindBackButton();
      return;
    }

    const onBack = () => {
      if (screen === 'game') {
        endMatch();
      }
      setScreen('menu');
    };

    bindBackButton(onBack);
    return () => {
      unbindBackButton();
    };
  }, [screen, setScreen, endMatch]);
}
