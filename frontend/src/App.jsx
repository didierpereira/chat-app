import { Loader } from "lucide-react"
import { useEffect } from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import Navbar from "./components/Navbar/Navbar"
import HomePage from "./pages/HomePage"
import LoginPage from "./pages/LoginPage.jsx"
import ProfilePage from "./pages/ProfilePage.jsx"
import SettingsPage from "./pages/SettingsPage.jsx"
import SignupPage from "./pages/SignupPage.jsx"
import { useAuthStore } from "./store/useAuthStore.js"
import { Toaster } from "react-hot-toast"

import { useThemeStore } from "./store/useThemeStore.js"

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore()
  const { theme } = useThemeStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  if (isCheckingAuth && !authUser) {
    return (
      <div className="">
        <Loader className="size-10 animate-spin" />
      </div>
    )
  }

  return (
    <div
      data-theme={theme}
      className="min-h-screen bg-base-100 text-base-content"
    >
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/settings"
          element={authUser ? <SettingsPage /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>

      <Toaster />
    </div>
  )
}

export default App
