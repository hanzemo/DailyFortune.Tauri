import { create } from 'zustand';
import { api, tokenStore, ApiError } from '../api/client';
import type { UserMeProfile } from '../api/types';

interface AuthState {
  user: UserMeProfile | null;
  nextDrawAt: string | null;
  loading: boolean;
  isAuth: boolean;
  init: () => Promise<void>;
  login: (u: string, p: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshMe: () => Promise<void>;
  setUser: (u: UserMeProfile) => void;
  setNextDrawAt: (s: string | null) => void;
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  nextDrawAt: null,
  loading: true,
  isAuth: false,

  async init() {
    try {
      const t = await tokenStore.getAccess();
      if (t) await get().refreshMe();
    } catch {
      // 首次启动无 token，静默
    } finally {
      set({ loading: false });
    }
  },

  async login(u, p) {
    const r = await api.login(u, p);
    await tokenStore.saveAccess(r.access_token);
    await tokenStore.saveRefresh(r.refresh_token);
    set({ user: r.user, isAuth: true });
    // 登录后立刻拉一次完整资料 + next_draw_at
    await get().refreshMe();
  },

  async logout() {
    await tokenStore.clearAll();
    set({ user: null, isAuth: false, nextDrawAt: null });
  },

  async refreshMe() {
    try {
      const r = await api.getMyProfile();
      set({ user: r.user, isAuth: true, nextDrawAt: r.next_draw_at });
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 401) {
        const rt = await tokenStore.getRefresh();
        if (rt) {
          try {
            const r = await api.refresh(rt);
            await tokenStore.saveAccess(r.access_token);
            await tokenStore.saveRefresh(r.refresh_token);
            const p = await api.getMyProfile();
            set({ user: p.user, isAuth: true, nextDrawAt: p.next_draw_at });
            return;
          } catch {
            // refresh 也失败，走登出
          }
        }
        await get().logout();
      } else {
        throw e;
      }
    }
  },

  setUser(u) {
    set({ user: u });
  },

  setNextDrawAt(s) {
    set({ nextDrawAt: s });
  },
}));
