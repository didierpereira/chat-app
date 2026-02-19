import { create } from "zustand"
import toast from "react-hot-toast"
import { axiosInstance } from "../lib/axios.js"
import { useAuthStore } from "./useAuthStore.js"

const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  typingUsers: {},
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true })
    try {
      const response = await axiosInstance.get("/messages/users")
      // use unreadCount provided by server when available
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

  startSocketListeners: () => {
    const socket = useAuthStore.getState().socket
    if (!socket) return

    const playNotification = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        const ctx = new AudioCtx()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = "sine"
        osc.frequency.value = 1000
        gain.gain.value = 0.02
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        setTimeout(() => {
          osc.stop()
          ctx.close()
        }, 150)
      } catch (e) {
        // fallback: ignore if audio can't be played
        console.error("Notification sound error:", e)
      }
    }

    socket.on("newMessage", (newMessage) => {
      const selectedUser = get().selectedUser
      const senderId = String(newMessage.senderId)
      if (senderId === selectedUser?._id) {
        set({ messages: [...get().messages, newMessage] })
      } else {
        // increment unread count for sender (compare by string id)
        set({
          users: get().users.map((u) =>
            String(u._id) === senderId
              ? { ...u, unreadCount: (u.unreadCount || 0) + 1 }
              : u,
          ),
        })
        // play sound to notify user of incoming message
        playNotification()
      }
    })

    socket.on("typing", ({ from }) => {
      set({ typingUsers: { ...get().typingUsers, [from]: true } })
    })

    socket.on("stopTyping", ({ from }) => {
      const next = { ...get().typingUsers }
      delete next[from]
      set({ typingUsers: next })
    })
  },

  stopSocketListeners: () => {
    const socket = useAuthStore.getState().socket
    if (!socket) return
    socket.off("newMessage")
    socket.off("typing")
    socket.off("stopTyping")
  },

  setSelectedUser: (user) => {
    // mark messages as read on the server, then clear unread count locally
    set({ selectedUser: user })
    try {
      // best-effort call to mark messages as read
      axiosInstance.post(`/messages/mark-read/${user._id}`)
    } catch (e) {
      // ignore failure
      console.error("Failed to mark messages read:", e)
    }

    set({
      users: get().users.map((u) => (u._id === user._id ? { ...u, unreadCount: 0 } : u)),
      typingUsers: { ...get().typingUsers, [user._id]: false },
    })
  },
}))

export default useChatStore
