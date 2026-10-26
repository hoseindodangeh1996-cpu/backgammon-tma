import { useSessionStore } from '@/store/sessionStore';

/** Convenience selector for Telegram session fields. */
export function useTelegram() {
  const ready = useSessionStore((s) => s.ready);
  const isTelegram = useSessionStore((s) => s.isTelegram);
  const user = useSessionStore((s) => s.user);
  const platform = useSessionStore((s) => s.platform);
  const displayName = useSessionStore((s) => s.displayName);

  return {
    ready,
    isTelegram,
    user,
    platform,
    displayName: displayName(),
  };
}
