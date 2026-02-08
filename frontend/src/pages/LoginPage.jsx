import { Eye, EyeClosed, Loader, Lock, Mail, MessageSquare } from "lucide-react"
import { useState } from "react"
import { Link } from "react-router-dom"
import AuthImagePattern from "../components/AuthImagePattern/AuthImagePattern"
import { useAuthStore } from "../store/useAuthStore"

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const { login, isLoggingIn } = useAuthStore()

  function validateForm() {
    if (!formData.email.trim()) {
      return toast.error("Email is required")
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      return toast.error("Please enter a valid email address")
    }
    if (!formData.password) {
      return toast.error("Password is required")
    }
    if (formData.password.length < 6) {
      return toast.error("Password must be at least 6 characters long")
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    await login(formData)
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex justify-center items-center felx-col p-6 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center mb-8">
            <div className="group flex flex-col items-center gap-2">
              <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <MessageSquare className="size-6 text-primary" />
              </div>

              <h1 className="text-2xl font-bold mt-2">Create Account</h1>
              <p className="text-base-content/60">
                Get started with your free account
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-control">
              <label htmlFor="" className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="size-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  className="input input-bordered w-full pl-10"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="form-control">
              <label htmlFor="" className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="size-5 text-base-content/40" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  className="input input-bordered w-full pl-10"
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                {showPassword ? (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(false)}
                  >
                    <EyeClosed className="size-5 text-base-content/40" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(true)}
                  >
                    <Eye className="size-5 text-base-content/40" />
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full`}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader className="size-5 animate-spin mr-2" />
                  Loading...
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          <div className="text-center">
            <p className="text-base-content">
              Don't have an account?{" "}
              <Link to="/signup" className="link link-primary">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </div>

      <AuthImagePattern
        title="Join our vibrant chat community!"
        subtitle="Connect, share, and engage with people around the world. Sign up now to start chatting!"
      />
    </div>
  )
}

export default LoginPage
