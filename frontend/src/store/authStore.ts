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
  branch_id?: number
}

interface AuthState {
  token: string | null
  user: User | null
  hasHydrated: boolean
  setAuth: (token: string, user: User) => void
  logout: () => void
  setHasHydrated: (state: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setHasHydrated: (state) => set({ hasHydrated: state }),
    }),
    {
      name: "kosthub-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)