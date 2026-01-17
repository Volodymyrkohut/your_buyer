"use client"

import { createContext, useContext, ReactNode, useState, useEffect } from "react"
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
  getUser,
  setAuthToken,
  removeAuthToken,
  getAuthToken,
  getAnonymousToken,
  clearAnonymousToken,
  mergeCart,
  type LoginRequest,
  type RegisterRequest,
  type UserResponse,
  type ApiError,
  type AuthResponse,
} from "@/lib/api"

export interface User {
  id: string
  name: string
  firstName?: string
  lastName?: string
  email: string
  phone?: string
  address?: string
  avatar?: string
}

export interface UserContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (login: string, password: string) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

/**
 * Конвертує UserResponse з API в User для внутрішнього використання
 */
function mapUserResponseToUser(userResponse: UserResponse | AuthResponse['data']['user']): User {
  // Обробляємо null та undefined значення
  const name = (userResponse.name ?? "").toString().trim()
  const surname = (userResponse.surname ?? "").toString().trim()
  const email = (userResponse.email ?? "").toString().trim()
  const phone = (userResponse.phone ?? "").toString().trim()
  const id = userResponse.id ? String(userResponse.id) : ""
  
  // Формуємо повне ім'я
  const fullName = surname 
    ? `${name} ${surname}`.trim()
    : name
  
  console.log('mapUserResponseToUser: input:', userResponse)
  console.log('mapUserResponseToUser: mapped:', { id, name: fullName, firstName: name, lastName: surname, email, phone })
  
  return {
    id,
    name: fullName || "User",
    firstName: name || "",
    lastName: surname || "",
    email: email || "",
    phone: phone || "",
    address: undefined,
    avatar: undefined,
  }
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Завантажує дані користувача з API
   */
  const fetchUser = async () => {
    const token = getAuthToken()
    if (!token) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const userData = await getUser()
      console.log('fetchUser: received userData:', userData)
      const mappedUser = mapUserResponseToUser(userData)
      console.log('fetchUser: mapped user:', mappedUser)
      setUser(mappedUser)
      setIsAuthenticated(true)
    } catch (err) {
      console.error('fetchUser: error:', err)
      // Токен невалідний або застарів
      removeAuthToken()
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Автоматично завантажує користувача при монтуванні
   */
  useEffect(() => {
    fetchUser()
  }, [])

  /**
   * Авторизація користувача
   */
  const login = async (loginValue: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      const loginData: LoginRequest = {
        login: loginValue,
        password,
      }
      const response = await apiLogin(loginData)
      
      // Зберігаємо токен
      setAuthToken(response.data.access_token)
      
      // Завантажуємо дані користувача
      if (response.data.user) {
        setUser(mapUserResponseToUser(response.data.user))
        setIsAuthenticated(true)
      } else {
        await fetchUser()
      }

      // Мердж анонімного кошика з кошиком користувача
      try {
        const anonymousToken = getAnonymousToken()
        if (anonymousToken) {
          await mergeCart(anonymousToken)
          clearAnonymousToken()
        }
      } catch (mergeError) {
        // Якщо мердж не вдався, не блокуємо логін
        console.error('Failed to merge cart:', mergeError)
      }
    } catch (err) {
      const apiError = err as ApiError
      setError(apiError.message || "Помилка авторизації")
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Реєстрація нового користувача
   */
  const register = async (data: RegisterRequest) => {
    try {
      console.log('UserContext.register: Starting registration')
      setLoading(true)
    
      setError(null)
      console.log('UserContext.register: Calling apiRegister')
      const response = await apiRegister(data)
      console.log('UserContext.register: apiRegister success', response)
      
      // Зберігаємо токен
      setAuthToken(response.data.access_token)
      
      // Завантажуємо дані користувача
      if (response.data.user) {
        setUser(mapUserResponseToUser(response.data.user))
        setIsAuthenticated(true)
      } else {
        await fetchUser()
      }

      // Мердж анонімного кошика з кошиком користувача
      try {
        const anonymousToken = getAnonymousToken()
        if (anonymousToken) {
          await mergeCart(anonymousToken)
          clearAnonymousToken()
        }
      } catch (mergeError) {
        // Якщо мердж не вдався, не блокуємо реєстрацію
        console.error('Failed to merge cart:', mergeError)
      }
    } catch (err) {
      console.error('UserContext.register: Error caught!', err)
      const apiError = err as ApiError
      console.error('UserContext register error:', err)
      console.error('UserContext apiError:', apiError)
      console.error('UserContext apiError.errors:', apiError.errors)
      setError(apiError.message || "Помилка реєстрації")
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Вихід з акаунту
   */
  const logout = async () => {
    try {
      setLoading(true)
      setError(null)
      await apiLogout()
    } catch (err) {
      // Навіть якщо API викликав помилку, очищаємо локальний стан
      console.error("Logout error:", err)
    } finally {
      removeAuthToken()
      setUser(null)
      setIsAuthenticated(false)
      setLoading(false)
    }
  }

  /**
   * Очищення помилки
   */
  const clearError = () => {
    setError(null)
  }

  const value: UserContextType = {
    user,
    isAuthenticated,
    loading,
    error,
    login,
    register,
    logout,
    clearError,
  }

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
