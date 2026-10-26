import { useCallback } from 'react';
import {
  hapticImpact,
  hapticNotification,
  hapticSelection,
  type HapticNotification,
  type HapticStyle,
} from '@/services/telegram';
import { useAppStore } from '@/store/appStore';

/** Haptics gated by user preference in appStore. */
export function useHaptic() {
  const enabled = useAppStore((s) => s.hapticsEnabled);

  const impact = useCallback(
    (style: HapticStyle = 'light') => {
      if (enabled) hapticImpact(style);
    },
    [enabled],
  );

  const notify = useCallback(
    (type: HapticNotification) => {
      if (enabled) hapticNotification(type);
    },
    [enabled],
  );

  const selection = useCallback(() => {
    if (enabled) hapticSelection();
  }, [enabled]);

  return { impact, notify, selection };
}
