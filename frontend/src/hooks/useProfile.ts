import { useMutation } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { useAuthStore } from "@/store/authStore"

export function useUpdateProfile() {
  const { user, token, setAuth } = useAuthStore()
  return useMutation({
    mutationFn: async (payload: { name: string; phone: string }) => {
      const res = await api.patch("/profile", payload)
      return res.data
    },
    onSuccess: (updatedUser) => {
      if (token) setAuth(token, { ...user, ...updatedUser })
    },
  })
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { current_password: string; new_password: string }) => {
      const res = await api.patch("/profile/password", payload)
      return res.data
    },
  })
}