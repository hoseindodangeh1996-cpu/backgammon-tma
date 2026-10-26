import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';
import { I18nextProvider } from 'react-i18next';
import { i18n } from '@/locales';
import { initTelegram } from '@/services/telegram';
import { useAppStore } from '@/store/appStore';
import { useSessionStore } from '@/store/sessionStore';

type ProvidersProps = {
  children: ReactNode;
};

/**
 * Boots i18n, Telegram SDK, and preference hydration before rendering screens.
 */
export function Providers({ children }: ProvidersProps) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const setSession = useSessionStore((s) => s.setSession);
  const hydratePrefs = useAppStore((s) => s.hydratePrefs);
  const prefsHydrated = useAppStore((s) => s.prefsHydrated);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const session = initTelegram();
      if (cancelled) return;

      setSession({
        ready: true,
        isTelegram: session.isTelegram,
        initData: session.initData,
        platform: session.platform,
        colorScheme: session.colorScheme,
        user: session.user,
      });

      await hydratePrefs();
      if (!cancelled) setBootstrapped(true);
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, [hydratePrefs, setSession]);

  if (!bootstrapped || !prefsHydrated) {
    return (
      <I18nextProvider i18n={i18n}>
        <div className="screen-shell items-center justify-center bg-night">
          <p className="animate-pulse font-display text-lg text-gold-soft">
            {i18n.t('app.loading')}
          </p>
        </div>
      </I18nextProvider>
    );
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
