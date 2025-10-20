import * as SecureStore from "expo-secure-store";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SessionState = {
  token: string | null;
  setToken: (t: string) => void;
  clearToken: () => void;
};

const secureStorage = {
  getItem: async (name: string) => {
    const v = await SecureStore.getItemAsync(name);
    return v ?? null;
  },
  setItem: async (name: string, value: string) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name: string) => {
    await SecureStore.deleteItemAsync(name);
  },
};

const useSession = create<SessionState>()(
  persist(
    (set) => ({
      token: null,
      setToken: (t: string) => set({ token: t }),
      clearToken: () => set({ token: null }),
    }),
    {
      name: "housecommittee/session",
      storage: createJSONStorage(() => secureStorage),
    }
  )
);

export default useSession;
