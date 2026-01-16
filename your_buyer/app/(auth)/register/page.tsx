"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { useUser } from "@/app/contexts/UserContext"
import type { RegisterRequest } from "@/lib/api"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const { register: registerUser, isAuthenticated, loading: authLoading } = useUser()
  
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [gender, setGender] = useState("")
  const [phone, setPhone] = useState("")
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string
    surname?: string
    email?: string
    phone?: string
    sex?: string
    password?: string
    password_confirmation?: string
  }>({})

  // Перенаправлення якщо вже авторизований
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      const returnUrl = searchParams.get("returnUrl") || "/"
      router.push(returnUrl)
    }
  }, [isAuthenticated, authLoading, router, searchParams])

  // Дебаг: відстежуємо зміни fieldErrors
  useEffect(() => {
    if (Object.keys(fieldErrors).length > 0) {
      console.log('Field errors updated:', fieldErrors)
    }
  }, [fieldErrors])

  // Глобальний обробник помилок для дебагу
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error handler:', event.error)
    }
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason)
    }
    
    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)
    
    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Валідація
    if (!firstName.trim()) {
      setFieldErrors({ name: "Ім'я обов'язкове" })
      return
    }
    if (!lastName.trim()) {
      setFieldErrors({ surname: "Прізвище обов'язкове" })
      return
    }
    if (!email.trim()) {
      setFieldErrors({ email: "Email обов'язковий" })
      return
    }
    if (!phone.trim()) {
      setFieldErrors({ phone: "Телефон обов'язковий" })
      return
    }
    if (!gender) {
      setFieldErrors({ sex: "Стать обов'язкова" })
      return
    }
    if (!password) {
      setFieldErrors({ password: "Пароль обов'язковий" })
      return
    }
    if (password.length < 6) {
      setFieldErrors({ password: "Пароль повинен містити мінімум 6 символів" })
      return
    }
    if (!passwordConfirmation) {
      setFieldErrors({ password_confirmation: "Підтвердження пароля обов'язкове" })
      return
    }
    if (password !== passwordConfirmation) {
      setFieldErrors({ password_confirmation: "Паролі не співпадають" })
      return
    }
    if (!agreeToTerms) {
      alert("Будь ласка, прийміть умови використання")
      return
    }

    try {
      console.log('=== STARTING REGISTRATION ===')
      setIsSubmitting(true)
      const registerData: RegisterRequest = {
        name: firstName.trim(),
        surname: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        sex: gender,
        password,
        password_confirmation: passwordConfirmation,
      }
      
      console.log('Calling registerUser with data:', registerData)
      try {
        await registerUser(registerData)
        console.log('Registration successful')
      } catch (registerError) {
        console.error('Error in registerUser call:', registerError)
        throw registerError
      }
      
      // Успішна реєстрація - перенаправлення
      const returnUrl = searchParams.get("returnUrl") || "/"
      router.push(returnUrl)
    } catch (err: any) {
      console.log('=== REGISTRATION ERROR ===')
      console.log('Full error object:', err)
      console.log('Error message:', err?.message)
      console.log('Error errors:', err?.errors)
      console.log('Error errors type:', typeof err?.errors)
      console.log('Error errors keys:', err?.errors ? Object.keys(err.errors) : 'none')
      
      const errorMessage = err?.message || "Помилка реєстрації. Спробуйте ще раз."
      setError(errorMessage)
      
      // Встановлюємо inline помилки для полів
      // Перевіряємо, чи є об'єкт помилок (422 validation errors)
      if (err?.errors && typeof err.errors === 'object' && err.errors !== null) {
        const newFieldErrors: typeof fieldErrors = {}
        
        console.log('Processing errors object...')
        
        // Обробляємо всі поля помилок з API
        Object.keys(err.errors).forEach((key) => {
          console.log(`Processing error key: ${key}`)
          // Перевіряємо, чи це поле, яке ми підтримуємо
          if (
            key === 'name' ||
            key === 'surname' ||
            key === 'email' ||
            key === 'phone' ||
            key === 'sex' ||
            key === 'password' ||
            key === 'password_confirmation'
          ) {
            const errorValue = err.errors[key]
            console.log(`Error value for ${key}:`, errorValue, 'Type:', typeof errorValue, 'IsArray:', Array.isArray(errorValue))
            
            // Якщо помилка - це масив, беремо перший елемент
            if (Array.isArray(errorValue) && errorValue.length > 0) {
              newFieldErrors[key as keyof typeof fieldErrors] = errorValue[0]
              console.log(`Set field error ${key} to:`, errorValue[0])
            } 
            // Якщо помилка - це рядок
            else if (typeof errorValue === 'string') {
              newFieldErrors[key as keyof typeof fieldErrors] = errorValue
              console.log(`Set field error ${key} to:`, errorValue)
            }
          } else {
            console.log(`Skipping unsupported key: ${key}`)
          }
        })
        
        console.log('Final newFieldErrors:', newFieldErrors)
        // Встановлюємо помилки полів
        setFieldErrors(newFieldErrors)
      } else {
        console.log('No errors object found or invalid format')
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

      {/* Right Side - Registration Form (1/3 width) */}
      <div className="flex w-full items-center justify-center overflow-y-auto bg-white px-8 py-8 lg:w-1/3">
        <div className="w-full max-w-md">
          {/* Create New Account Heading */}
          <h1 className="mb-2 text-4xl font-bold text-primary-100">
            Create New Account
          </h1>
          <p className="mb-8 text-sm text-grey-500">Please enter details</p>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message - показуємо тільки якщо немає помилок полів */}
            {error && Object.keys(fieldErrors).length === 0 && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* First Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="firstName"
                className="text-sm font-medium text-primary-100"
              >
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => {
                  setFirstName(e.target.value)
                  if (fieldErrors.name) {
                    setFieldErrors((prev) => ({ ...prev, name: undefined }))
                  }
                }}
                className={`w-full border ${
                  fieldErrors.name
                    ? "border-red-500"
                    : "border-primary-100"
                }`}
                required
              />
              {fieldErrors.name && (
                <p className="text-sm text-red-600">{fieldErrors.name}</p>
              )}
            </div>

            {/* Last Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="lastName"
                className="text-sm font-medium text-primary-100"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => {
                  setLastName(e.target.value)
                  if (fieldErrors.surname) {
                    setFieldErrors((prev) => ({ ...prev, surname: undefined }))
                  }
                }}
                className={`w-full border ${
                  fieldErrors.surname
                    ? "border-red-500"
                    : "border-primary-100"
                }`}
                required
              />
              {fieldErrors.surname && (
                <p className="text-sm text-red-600">{fieldErrors.surname}</p>
              )}
            </div>

            {/* Email Address Field */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-primary-100"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (fieldErrors.email) {
                    setFieldErrors((prev) => ({ ...prev, email: undefined }))
                  }
                }}
                className={`w-full border ${
                  fieldErrors.email
                    ? "border-red-500"
                    : "border-primary-100"
                }`}
                required
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="text-sm font-medium text-primary-100"
              >
                Phone
              </label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value)
                  if (fieldErrors.phone) {
                    setFieldErrors((prev) => ({ ...prev, phone: undefined }))
                  }
                }}
                className={`w-full border ${
                  fieldErrors.phone
                    ? "border-red-500"
                    : "border-primary-100"
                }`}
                placeholder="+380 XX XXX XX XX"
                required
              />
              {fieldErrors.phone && (
                <p className="text-sm text-red-600">{fieldErrors.phone}</p>
              )}
            </div>

            {/* Gender Field */}
            <div className="space-y-2">
              <label
                htmlFor="gender"
                className="text-sm font-medium text-primary-100"
              >
                Gender
              </label>
              <Select
                value={gender}
                onValueChange={(value) => {
                  setGender(value)
                  if (fieldErrors.sex) {
                    setFieldErrors((prev) => ({ ...prev, sex: undefined }))
                  }
                }}
                required
              >
                <SelectTrigger
                  id="gender"
                  className={`w-full border ${
                    fieldErrors.sex
                      ? "border-red-500"
                      : "border-primary-100"
                  } bg-white`}
                >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.sex && (
                <p className="text-sm text-red-600">{fieldErrors.sex}</p>
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
                  // Очищаємо помилку підтвердження, якщо паролі тепер співпадають
                  if (fieldErrors.password_confirmation && e.target.value === passwordConfirmation) {
                    setFieldErrors((prev) => ({ ...prev, password_confirmation: undefined }))
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <label
                htmlFor="passwordConfirmation"
                className="text-sm font-medium text-primary-100"
              >
                Confirm Password
              </label>
              <Input
                id="passwordConfirmation"
                type="password"
                value={passwordConfirmation}
                onChange={(e) => {
                  setPasswordConfirmation(e.target.value)
                  if (fieldErrors.password_confirmation) {
                    setFieldErrors((prev) => ({ ...prev, password_confirmation: undefined }))
                  }
                }}
                className={`w-full border ${
                  fieldErrors.password_confirmation
                    ? "border-red-500"
                    : "border-primary-100"
                }`}
                required
              />
              {fieldErrors.password_confirmation && (
                <p className="text-sm text-red-600">{fieldErrors.password_confirmation}</p>
              )}
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-2">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="peer h-4 w-4 cursor-pointer appearance-none rounded border border-primary-100 bg-white transition-colors checked:border-primary-100 checked:bg-primary-100 focus:outline-none focus:ring-2 focus:ring-primary-100 focus:ring-offset-0"
                  required
                />
                {agreeToTerms && (
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
              <label
                htmlFor="terms"
                className="cursor-pointer text-sm text-primary-100"
              >
                I agree to the{" "}
                <Link
                  href="/terms"
                  className="font-bold text-primary-100 hover:underline"
                >
                  Terms & Conditions
                </Link>
              </label>
            </div>

            {/* Signup Button */}
            <Button
              type="submit"
              className="w-full bg-primary-100 text-white hover:bg-primary-200 active:bg-primary-300 disabled:opacity-50"
              size="lg"
              disabled={isSubmitting || authLoading}
            >
              {isSubmitting ? "Реєстрація..." : "Signup"}
            </Button>

            {/* Link to Login */}
            <p className="text-center text-sm text-grey-500">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary-100 hover:underline"
              >
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
