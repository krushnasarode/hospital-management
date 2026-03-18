import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginApi, getMeApi } from '../api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await loginApi({ email, password });
          const { token, user } = res.data;
          localStorage.setItem('hms_token', token);
          set({ token, user, isLoading: false });
          return { success: true };
        } catch (err) {
          const msg = err.response?.data?.message || 'Login failed';
          set({ isLoading: false, error: msg });
          return { success: false, error: msg };
        }
      },

      logout: () => {
        localStorage.removeItem('hms_token');
        set({ user: null, token: null });
      },

      fetchUser: async () => {
        try {
          const res = await getMeApi();
          set({ user: res.data.user });
        } catch { get().logout(); }
      },
    }),
    { name: 'hms_auth', partialize: (s) => ({ token: s.token, user: s.user }) }
  )
);

export default useAuthStore;
