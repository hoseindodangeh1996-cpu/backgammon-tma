import { create } from 'zustand';
import type { TelegramUserSnapshot } from '@/services/telegram';

export type SessionState = {
  ready: boolean;
  isTelegram: boolean;
  initData: string;
  platform: string;
  colorScheme: string;
  user: TelegramUserSnapshot | null;
  setSession: ( partial: Omit<SessionState, 'setSession' | 'displayName'>) => void;
  displayName: () => string;
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ready: false,
  isTelegram: false,
  initData: '',
  platform: 'web',
  colorScheme: 'dark',
  user: null,

  setSession: (partial) => set({ ...partial, ready: true }),

  displayName: () => {
    const user = get().user;
    if (!user) return 'Խաղացող';
    return user.firstName || user.username || 'Խաղացող';
  },
}));
