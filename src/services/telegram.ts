import WebApp from '@twa-dev/sdk';

/** CloudStorage / localStorage key for intro skip persistence. */
export const INTRO_SEEN_KEY = 'nard.introSeen';

export type HapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
export type HapticNotification = 'error' | 'success' | 'warning';

export type TelegramUserSnapshot = {
  id: number;
  firstName: string;
  lastName?: string;
  username?: string;
  languageCode?: string;
  isPremium?: boolean;
  photoUrl?: string;
};

function isTelegramEnvironment(): boolean {
  try {
    return typeof window !== 'undefined' && Boolean(WebApp?.initData !== undefined);
  } catch {
    return false;
  }
}

/** Apply Telegram theme params to CSS custom properties. */
export function syncTelegramTheme(): void {
  if (!isTelegramEnvironment()) return;

  const tp = WebApp.themeParams;
  const root = document.documentElement;

  const map: Array<[string, string | undefined]> = [
    ['--tg-bg', tp.bg_color],
    ['--tg-text', tp.text_color],
    ['--tg-hint', tp.hint_color],
    ['--tg-link', tp.link_color],
    ['--tg-button', tp.button_color],
    ['--tg-button-text', tp.button_text_color],
    ['--tg-secondary', tp.secondary_bg_color],
  ];

  for (const [cssVar, value] of map) {
    if (value) root.style.setProperty(cssVar, value);
  }

  if (WebApp.colorScheme === 'light') {
    // Keep brand night aesthetic; only sync chrome colors above.
  }

  root.style.setProperty(
    '--tg-viewport-stable-height',
    `${WebApp.viewportStableHeight || window.innerHeight}px`,
  );
}

function readUser(): TelegramUserSnapshot | null {
  const u = WebApp.initDataUnsafe?.user;
  if (!u?.id) return null;

  return {
    id: u.id,
    firstName: u.first_name,
    lastName: u.last_name,
    username: u.username,
    languageCode: u.language_code,
    isPremium: u.is_premium,
    photoUrl: u.photo_url,
  };
}

/**
 * Bootstrap Telegram WebApp once at app start.
 * Safe to call outside Telegram (browser dev) — returns a mock session.
 */
export function initTelegram(): {
  isTelegram: boolean;
  user: TelegramUserSnapshot | null;
  initData: string;
  platform: string;
  colorScheme: 'light' | 'dark' | string;
} {
  const inTg = isTelegramEnvironment() && Boolean(WebApp.initData || WebApp.platform);

  if (inTg) {
    WebApp.ready();
    WebApp.expand();
    syncTelegramTheme();

    WebApp.onEvent('themeChanged', syncTelegramTheme);
    WebApp.onEvent('viewportChanged', syncTelegramTheme);

    try {
      WebApp.setHeaderColor('#12100e');
      WebApp.setBackgroundColor('#12100e');
    } catch {
      // Older clients may not support header/bg setters.
    }

    return {
      isTelegram: true,
      user: readUser(),
      initData: WebApp.initData ?? '',
      platform: WebApp.platform,
      colorScheme: WebApp.colorScheme,
    };
  }

  // Browser / Vite preview fallback for local development.
  return {
    isTelegram: false,
    user: {
      id: 0,
      firstName: 'Խաղացող',
      username: 'dev',
      languageCode: 'hy',
    },
    initData: '',
    platform: 'web',
    colorScheme: 'dark',
  };
}

export function hapticImpact(style: HapticStyle = 'light'): void {
  try {
    WebApp.HapticFeedback?.impactOccurred(style);
  } catch {
    // Ignore when haptic API is unavailable.
  }
}

export function hapticNotification(type: HapticNotification): void {
  try {
    WebApp.HapticFeedback?.notificationOccurred(type);
  } catch {
    // Ignore.
  }
}

export function hapticSelection(): void {
  try {
    WebApp.HapticFeedback?.selectionChanged();
  } catch {
    // Ignore.
  }
}

/** Persist a string: prefer Telegram CloudStorage, fall back to localStorage. */
export function persistValue(key: string, value: string): Promise<void> {
  return new Promise((resolve) => {
    const finishLocal = () => {
      try {
        localStorage.setItem(key, value);
      } catch {
        // Private mode / quota.
      }
      resolve();
    };

    try {
      if (WebApp.CloudStorage?.setItem) {
        WebApp.CloudStorage.setItem(key, value, (err) => {
          if (err) finishLocal();
          else resolve();
        });
        return;
      }
    } catch {
      // fall through
    }
    finishLocal();
  });
}

/** Read persisted string: CloudStorage first, then localStorage. */
export function readPersistedValue(key: string): Promise<string | null> {
  return new Promise((resolve) => {
    const fromLocal = (): string | null => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    };

    try {
      if (WebApp.CloudStorage?.getItem) {
        WebApp.CloudStorage.getItem(key, (err, value) => {
          if (err || value == null || value === '') {
            resolve(fromLocal());
          } else {
            resolve(value);
          }
        });
        return;
      }
    } catch {
      // fall through
    }
    resolve(fromLocal());
  });
}

export async function markIntroSeen(): Promise<void> {
  await persistValue(INTRO_SEEN_KEY, '1');
}

export async function loadIntroSeen(): Promise<boolean> {
  const value = await readPersistedValue(INTRO_SEEN_KEY);
  return value === '1' || value === 'true';
}

export async function clearIntroSeen(): Promise<void> {
  await persistValue(INTRO_SEEN_KEY, '0');
  try {
    localStorage.setItem(INTRO_SEEN_KEY, '0');
  } catch {
    // Ignore.
  }
}

/** Tracks the active BackButton handler so we can unregister the same reference. */
let activeBackHandler: (() => void) | null = null;

/**
 * Show Telegram native BackButton with a single stable click handler.
 * Replaces any previous handler to avoid duplicate listeners.
 */
export function bindBackButton(onClick: () => void): void {
  try {
    if (activeBackHandler) {
      WebApp.BackButton.offClick(activeBackHandler);
      activeBackHandler = null;
    }
    activeBackHandler = onClick;
    WebApp.BackButton.onClick(onClick);
    WebApp.BackButton.show();
  } catch {
    // Ignore outside Telegram.
  }
}

/** Hide BackButton and detach the registered handler. */
export function unbindBackButton(): void {
  try {
    if (activeBackHandler) {
      WebApp.BackButton.offClick(activeBackHandler);
      activeBackHandler = null;
    }
    WebApp.BackButton.hide();
  } catch {
    // Ignore.
  }
}

/** @deprecated Prefer bindBackButton / unbindBackButton */
export function showBackButton(onClick: () => void): void {
  bindBackButton(onClick);
}

/** @deprecated Prefer unbindBackButton */
export function hideBackButton(): void {
  unbindBackButton();
}

export { WebApp };
