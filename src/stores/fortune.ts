import { create } from 'zustand';
import { api } from '../api/client';
import type { LeaderboardGroup, LeaderboardPeriod } from '../api/types';
import { useAuth } from './auth';

interface FortuneState {
  leaderboard: LeaderboardGroup[];
  period: LeaderboardPeriod;
  loading: boolean;
  localFortune: string | null;
  draw: () => Promise<string>;
  setLocal: (f: string) => void;
  load: (p?: LeaderboardPeriod) => Promise<void>;
  setPeriod: (p: LeaderboardPeriod) => void;
}

export const useFortune = create<FortuneState>((set, get) => ({
  leaderboard: [],
  period: 'today',
  loading: false,
  localFortune: null,

  async draw() {
    const r = await api.drawFortune();
    // 同步 next_draw_at 到 auth store
    useAuth.getState().setNextDrawAt(r.next_draw_at);
    // 同步用户资料（has_drawn_today / todays_fortune / total_draws / streak）
    await useAuth.getState().refreshMe();
    return r.fortune;
  },

  setLocal(f) {
    set({ localFortune: f });
  },

  async load(p) {
    const period = p ?? get().period;
    set({ loading: true, period });
    try {
      const lb = await api.getLeaderboard(period);
      set({ leaderboard: lb });
    } finally {
      set({ loading: false });
    }
  },

  setPeriod(p) {
    set({ period: p });
  },
}));
