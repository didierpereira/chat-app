import toast from "react-hot-toast"
import { create } from "zustand"
import { axiosInstance } from "../lib/axios.js"

export const useAuthStore = create((set) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  onlineUsers: [],

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check")
      set({ authUser: res.data.user })
    } catch (error) {
      console.error("Error checking auth:", error)
      set({ authUser: null, isCheckingAuth: false })
    } finally {
      set({ isCheckingAuth: false })
    }
  },

  signup: async (formData) => {
    set({ isSigningUp: true })
    try {
      const res = await axiosInstance.post("/auth/signup", formData)
      set({ authUser: res.data })
      toast.success("Signup successful! Welcome to the chat app.")
    } catch (error) {
      console.error("Signup error:", error)
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again.",
      )
      throw error
    } finally {
      set({ isSigningUp: false })
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout")
      set({ authUser: null })
      toast.success("Logged out successfully.")
    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Logout failed. Please try again.")
    }
  },

  login: async (formData) => {
    set({ isLoggingIn: true })
    try {
      const res = await axiosInstance.post("/auth/login", formData)
      set({ authUser: res.data })
      toast.success("Login successful! Welcome back.")
    } catch (error) {
      console.error("Login error:", error)
      toast.error(
        error.response?.data?.message || "Login failed. Please try again.",
      )
      throw error
    } finally {
      set({ isLoggingIn: false })
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true })
    try {
      const res = await axiosInstance.put("/auth/update-profile", data)
      set({ authUser: res.data })
      toast.success("Profile updated successfully.")
    } catch (error) {
      console.error("Profile update error:", error)
      toast.error(
        error.response?.data?.message ||
          "Profile update failed. Please try again.",
      )
      throw error
    } finally {
      set({ isUpdatingProfile: false })
    }
  },
}))
