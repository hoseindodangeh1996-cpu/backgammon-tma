import { create } from 'zustand';
import { env } from '@/config/env';
import {
  clearIntroSeen,
  hapticSelection,
  loadIntroSeen,
  markIntroSeen,
} from '@/services/telegram';

/** App-level navigation screens (no React Router in Phase A–D). */
export type AppScreen =
  | 'boot'
  | 'intro'
  | 'menu'
  | 'setup'
  | 'game'
  | 'settings';

export type AppState = {
  screen: AppScreen;
  /** True after CloudStorage/localStorage says intro was already seen. */
  introSeen: boolean;
  /** Prefs loaded from storage — gate UI until true. */
  prefsHydrated: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  reducedMotion: boolean;

  hydratePrefs: () => Promise<void>;
  setScreen: (screen: AppScreen) => void;
  /** Navigate to Main Menu (used by in-app back controls). */
  goToMenu: () => void;
  completeIntro: () => Promise<void>;
  skipIntro: () => Promise<void>;
  resetIntroPreference: () => Promise<void>;
  setSoundEnabled: (value: boolean) => void;
  setHapticsEnabled: (value: boolean) => void;
  setReducedMotion: (value: boolean) => void;
};

function preferReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export const useAppStore = create<AppState>((set, get) => ({
  screen: 'boot',
  introSeen: false,
  prefsHydrated: false,
  soundEnabled: true,
  hapticsEnabled: true,
  reducedMotion: preferReducedMotion(),

  hydratePrefs: async () => {
    const seen = env.forceIntro ? false : await loadIntroSeen();
    const reduced = preferReducedMotion();

    set({
      introSeen: seen,
      reducedMotion: reduced,
      prefsHydrated: true,
      screen: seen ? 'menu' : 'intro',
    });
  },

  setScreen: (screen) => {
    if (get().hapticsEnabled) hapticSelection();
    set({ screen });
  },

  goToMenu: () => {
    if (get().hapticsEnabled) hapticSelection();
    set({ screen: 'menu' });
  },

  completeIntro: async () => {
    await markIntroSeen();
    set({ introSeen: true, screen: 'menu' });
  },

  skipIntro: async () => {
    if (get().hapticsEnabled) hapticSelection();
    await markIntroSeen();
    set({ introSeen: true, screen: 'menu' });
  },

  resetIntroPreference: async () => {
    await clearIntroSeen();
    set({ introSeen: false });
  },

  setSoundEnabled: (soundEnabled) => set({ soundEnabled }),
  setHapticsEnabled: (hapticsEnabled) => set({ hapticsEnabled }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
}));
