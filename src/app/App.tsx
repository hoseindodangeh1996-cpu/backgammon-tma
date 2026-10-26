import { useAppStore, type AppScreen } from '@/store/appStore';
import { useTelegramBackButton } from '@/hooks/useTelegramBackButton';
import { IntroSplashScreen } from '@/screens/IntroSplash/IntroSplashScreen';
import { MainMenuScreen } from '@/screens/MainMenu/MainMenuScreen';
import { MatchSetupScreen } from '@/screens/MatchSetup/MatchSetupScreen';
import { GameBoardScreen } from '@/screens/GameBoard/GameBoardScreen';
import { SettingsScreen } from '@/screens/Settings/SettingsScreen';

function ScreenRouter({ screen }: { screen: AppScreen }) {
  const goToMenu = useAppStore((s) => s.goToMenu);

  switch (screen) {
    case 'boot':
      return null;
    case 'intro':
      return <IntroSplashScreen />;
    case 'menu':
      return <MainMenuScreen />;
    case 'setup':
      return <MatchSetupScreen />;
    case 'game':
      return <GameBoardScreen onExit={goToMenu} />;
    case 'settings':
      return <SettingsScreen />;
    default: {
      const _exhaustive: never = screen;
      return _exhaustive;
    }
  }
}

/**
 * Root shell — screen machine driven by Zustand appStore.
 * Flow: boot → intro | menu → setup → game | settings
 * Telegram BackButton syncs via useTelegramBackButton.
 */
export function App() {
  const screen = useAppStore((s) => s.screen);
  useTelegramBackButton();

  return (
    <main className="min-h-tg w-full bg-night text-cream flex justify-center items-center" data-screen={screen}>
      <div className="w-full max-w-md h-full min-h-screen relative overflow-hidden shadow-2xl bg-stone-900 flex flex-col">
        <ScreenRouter screen={screen} />
      </div>
    </main>
  );
}

export default App;
