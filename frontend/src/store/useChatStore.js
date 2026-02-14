import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios.js"
import { useAuthStore } from "./useAuthStore.js"

const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const response = await axiosInstance.get("/messages/users")
      set({ users: response.data })
    } catch (error) {
      toast.error("Failed to load users")
    } finally {
      set({ isUsersLoading: false })
    }
  },

  getMessages: async (user) => {
    set({ isMessagesLoading: true, selectedUser: user })
    try {
      const response = await axiosInstance.get(`/messages/${user._id}`)
      set({ messages: response.data })
    } catch (error) {
      toast.error("Failed to load messages")
    } finally {
      set({ isMessagesLoading: false })
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get()

    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      )
      set({ messages: [...messages, res.data] })
    } catch (error) {
      console.error("Send message error:", error)
      toast.error("Failed to send message")
    }
  },
  subscribeToMessages: () => {
    const { selectedUser } = get()
    if (!selectedUser) return

    const socket = useAuthStore.getState().socket

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id
      if (!isMessageSentFromSelectedUser) return

      set({
        messages: [...get().messages, newMessage],
      })
    })
  },
  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket
    socket.off("newMessage")
  },

  setSelectedUser: (user) => {
    set({ selectedUser: user })
  },
}))

export default useChatStore
