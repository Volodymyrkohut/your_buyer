"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { useUser } from "@/app/contexts/UserContext"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login: loginUser, isAuthenticated, loading: authLoading } = useUser()
  
  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    login?: string
    password?: string
  }>({})

  // Перенаправлення якщо вже авторизований
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const returnUrl = searchParams.get("returnUrl") || "/"
      router.push(returnUrl)
    }
  }, [isAuthenticated, authLoading, router, searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Валідація
    if (!login.trim()) {
      setFieldErrors({ login: "Email або телефон обов'язкові" })
      return
    }
    if (!password) {
      setFieldErrors({ password: "Пароль обов'язковий" })
      return
    }

    try {
      setIsSubmitting(true)
      await loginUser(login.trim(), password)
      
      // Успішний вхід - перенаправлення
      const returnUrl = searchParams.get("returnUrl") || "/"
      router.push(returnUrl)
    } catch (err: any) {
      const errorMessage = err?.message || "Помилка авторизації. Спробуйте ще раз."
      setError(errorMessage)
      
      // Встановлюємо inline помилки для полів
      if (err?.errors) {
        const newFieldErrors: typeof fieldErrors = {}
        
        // Обробляємо всі можливі поля помилок
        // Якщо є помилка для login, показуємо її під полем login
        if (err.errors.login) {
          newFieldErrors.login = err.errors.login[0]
        }
        // Якщо є помилка для phone, також показуємо її під полем login
        // (оскільки login може бути як email, так і phone)
        else if (err.errors.phone) {
          newFieldErrors.login = err.errors.phone[0]
        }
        
        // Помилка для password
        if (err.errors.password) {
          newFieldErrors.password = err.errors.password[0]
        }
        
        setFieldErrors(newFieldErrors)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex h-screen w-full overflow-hidden">
      {/* Left Side - Image Section (2/3 width) */}
      <div className="relative hidden w-2/3 lg:block">
        {/* Logo in top-left */}
        <div className="absolute left-8 top-8 z-10">
          <Link href="/" className="text-2xl font-bold text-primary-100">
            KKrist
          </Link>
        </div>
        
        {/* Model Image */}
        <div className="relative h-full w-full bg-white">
          {/* Placeholder for model image - you can replace this with actual image */}
          <div className="flex h-full w-full items-center justify-center bg-grey-100">
            <div className="text-center">
              <p className="text-grey-500">Model Image</p>
              <p className="mt-2 text-sm text-grey-400">
                Add your model image here
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form (1/3 width) */}
      <div className="flex w-full items-center justify-center bg-white px-8 lg:w-1/3">
        <div className="w-full max-w-md">
          {/* Welcome Heading */}
          <h1 className="mb-2 text-4xl font-bold text-primary-100">
            Welcome <span className="inline-block">👋</span>
          </h1>
          <p className="mb-8 text-sm text-grey-500">
            Please login here
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Email/Phone Field */}
            <div className="space-y-2">
              <label
                htmlFor="login"
                className="text-sm font-medium text-primary-100"
              >
                Email або Телефон
              </label>
              <Input
                id="login"
                type="text"
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value)
                  if (fieldErrors.login) {
                    setFieldErrors((prev) => ({ ...prev, login: undefined }))
                  }
                }}
                className={`w-full border ${
                  fieldErrors.login
                    ? "border-red-500"
                    : "border-primary-100"
                }`}
                placeholder="email@example.com або +380 XX XXX XX XX"
                required
              />
              {fieldErrors.login && (
                <p className="text-sm text-red-600">{fieldErrors.login}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-primary-100"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }))
                  }
                }}
                className={`w-full border ${
                  fieldErrors.password
                    ? "border-red-500"
                    : "border-primary-100"
                }`}
                required
              />
              {fieldErrors.password && (
                <p className="text-sm text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-primary-100 bg-white transition-colors checked:border-primary-100 checked:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-0"
                  />
                  {rememberMe && (
                    <svg
                      className="pointer-events-none absolute left-0 top-0 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-primary-100">Remember Me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary-100 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-primary-100 text-white hover:bg-primary-200 active:bg-primary-300 disabled:opacity-50"
              size="lg"
              disabled={isSubmitting || authLoading}
            >
              {isSubmitting ? "Вхід..." : "Login"}
            </Button>

            {/* Link to Register */}
            <p className="text-center text-sm text-grey-500">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-primary-100 hover:underline"
              >
                Signup
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
