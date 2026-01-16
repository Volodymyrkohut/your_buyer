const API_BASE_URL = 'http://localhost:8000/api'

export interface RegisterRequest {
  name: string
  surname: string
  email: string
  phone: string
  sex: string
  password: string
  password_confirmation: string
}

export interface LoginRequest {
  login: string // email або phone
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    user: {
      id: number
      name: string
      surname: string
      email: string
      phone: string
      sex: string
      created_at: string
      updated_at: string
    }
    access_token: string
    token_type: string
  }
}

export interface UserResponse {
  id: number
  name: string
  surname?: string
  email: string
  phone?: string
  sex?: string
  email_verified_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface GetUserResponse {
  success: boolean
  data: {
    user: UserResponse
  }
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}

/**
 * Отримує токен з localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('auth_token')
}

/**
 * Зберігає токен в localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('auth_token', token)
}

/**
 * Видаляє токен з localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('auth_token')
}

/**
 * Виконує API запит з обробкою помилок
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: headers as HeadersInit,
  })

  // Перевіряємо Content-Type перед парсингом JSON
  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    // Якщо сервер повернув HTML (наприклад, 404 сторінку), викидаємо помилку
    const text = await response.text()
    const error: ApiError = {
      message: `Сервер повернув некоректну відповідь (HTML замість JSON). Можливо, неправильний URL. Статус: ${response.status}. URL: ${API_BASE_URL}${endpoint}`,
      errors: {},
    }
    throw error
  }

  let data: any
  try {
    data = await response.json()
  } catch (parseError) {
    // Якщо не вдалося розпарсити JSON, викидаємо помилку
    const error: ApiError = {
      message: `Помилка парсингу відповіді сервера. Можливо, сервер повернув HTML замість JSON. URL: ${API_BASE_URL}${endpoint}`,
      errors: {},
    }
    throw error
  }

  if (!response.ok) {
    // Логуємо помилку перед викиданням
    console.error('=== API ERROR ===')
    console.error('Status:', response.status)
    console.error('Response data:', JSON.stringify(data, null, 2))
    console.error('Errors:', data.errors)
    
    const error: ApiError = {
      message: data.message || data.error || 'Помилка запиту',
      errors: data.errors || {},
    }
    console.error('Throwing error object:', JSON.stringify(error, null, 2))
    throw error
  }

  return data
}

/**
 * Реєстрація нового користувача
 */
export async function register(data: RegisterRequest): Promise<AuthResponse> {
  console.log('api.register called with:', data)
  try {
    const result = await apiRequest<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    console.log('api.register success:', result)
    return result
  } catch (error) {
    console.log('api.register error caught:', error)
    throw error
  }
}

/**
 * Авторизація користувача
 */
export async function login(data: LoginRequest): Promise<AuthResponse> {
  return apiRequest<AuthResponse>('/login', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Отримання поточного користувача
 */
export async function getUser(): Promise<UserResponse> {
  const response = await apiRequest<GetUserResponse>('/user', {
    method: 'GET',
  })
  return response.data.user
}

/**
 * Вихід з акаунту
 */
export async function logout(): Promise<void> {
  await apiRequest<void>('/logout', {
    method: 'POST',
  })
}
