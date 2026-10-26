/** Runtime feature flags — client-only until Phase E multiplayer. */
export const env = {
  appVersion: '0.1.0',
  isDev: import.meta.env.DEV,
  /** When true, always show intro (ignores CloudStorage / localStorage). */
  forceIntro: import.meta.env.VITE_FORCE_INTRO === 'true',
  /** Doubling cube stays off until product decides otherwise. */
  doublingCubeEnabled: false,
  /** Multiplayer backend — Phase E. */
  multiplayerEnabled: false,
} as const;
