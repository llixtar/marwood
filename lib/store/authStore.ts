import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { CustomerProfile } from '@/app/actions/customers';

type AuthStore = {
  user: User | null;
  profile: CustomerProfile | null;
  isLoading: boolean;
  isInitialized: boolean;

  initialize: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User | null) => void;
  setProfile: (profile: CustomerProfile | null) => void;
  fetchProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  profile: null,
  isLoading: true,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return;
    
    const supabase = createClient();
    
    // Підписуємось на зміни авторизації (ОДИН РАЗ при ініціалізації)
    supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user || null;
      set({ user: newUser });

      if (newUser) {
        get().fetchProfile();
      } else {
        set({ profile: null });
      }
    });

    await get().refreshSession();
  },

  refreshSession: async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    set({ user, isLoading: false, isInitialized: true });

    if (user) {
      await get().fetchProfile();
    }
  },

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),

  fetchProfile: async () => {
    const user = get().user;
    if (!user) return;

    try {
      const { getCustomerProfile } = await import('@/app/actions/customers');
      const profile = await getCustomerProfile(user.id);
      set({ profile });
    } catch (err) {
      console.warn('Failed to fetch profile:', err);
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },
}));
