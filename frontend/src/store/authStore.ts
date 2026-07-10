import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Role {
  id: number
  name: string
}

interface User {
  id: string
  name: string
  email: string
  role?: Role
}

interface AuthState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "kosthub-auth" } // disimpan di localStorage otomatis oleh middleware persist
  )
)