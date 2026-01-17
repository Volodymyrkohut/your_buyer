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

// Admin interfaces
export interface Category {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

export interface CategoryRequest {
  id: number
  name: string
}

export interface CategoryResponse {
  success: boolean
  message?: string
  data: {
    category: Category
  }
}

export interface CategoriesResponse {
  success: boolean
  data: {
    categories: Category[]
  }
}

export interface ProductImage {
  id: number
  product_id: number
  image_path: string
  is_primary: boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: number
  name: string
  slug?: string | null
  description?: string | null
  short_description?: string | null
  price: number
  discount: number
  status?: 'in_stock' | 'out_of_stock'
  category_id?: number | null
  category?: Category | null
  images?: ProductImage[]
  primary_image_url?: string | null
  created_at?: string
  updated_at?: string
}

export interface ProductRequest {
  name: string
  slug?: string
  description?: string
  short_description?: string
  price: number
  discount?: number
  status?: 'in_stock' | 'out_of_stock'
  category_id?: number
}

export interface ProductResponse {
  success: boolean
  message?: string
  data: {
    product: Product
  }
}

export interface ProductsResponse {
  success: boolean
  data: {
    products: Product[]
  }
}

export interface ProductsListParams {
  page?: number
  per_page?: number
  search?: string
  category_id?: number
  min_price?: number
  max_price?: number
  sort?: 'default' | 'price_asc' | 'price_desc' | 'name_asc' | 'name_desc'
}

export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
}

export interface PaginatedProductsResponse {
  success: boolean
  data: {
    products: Product[]
    pagination: PaginationMeta
  }
}

export interface Order {
  id: string
  productName: string
  size?: string
  quantity: number
  price: number
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  statusMessage?: string
  image?: string
  canReview?: boolean
}

export interface UserListResponse {
  success: boolean
  data: {
    users: UserResponse[]
  }
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
 * Генерує новий UUID токен для анонімного користувача
 */
export function generateAnonymousToken(): string {
  // Generate UUID v4
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

/**
 * Отримує анонімний токен з localStorage або генерує новий
 */
export function getAnonymousToken(): string {
  if (typeof window === 'undefined') return ''
  const token = localStorage.getItem('anonymous_token')
  if (token) {
    return token
  }
  const newToken = generateAnonymousToken()
  localStorage.setItem('anonymous_token', newToken)
  return newToken
}

/**
 * Видаляє анонімний токен з localStorage (після мерджу)
 */
export function clearAnonymousToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('anonymous_token')
}

/**
 * Виконує API запит з обробкою помилок
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken()
  const anonymousToken = !token ? getAnonymousToken() : null
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  // Add anonymous token header if user is not authenticated
  if (!token && anonymousToken) {
    headers['X-Anonymous-Token'] = anonymousToken
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

/**
 * Admin API functions
 */

/**
 * Отримати всі категорії (публічний endpoint)
 */
export async function getCategories(): Promise<Category[]> {
  const response = await apiRequest<CategoriesResponse>('/categories', {
    method: 'GET',
  })
  return response.data.categories
}

/**
 * Створити категорію
 */
export async function createCategory(data: CategoryRequest): Promise<Category> {
  const response = await apiRequest<CategoryResponse>('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.data.category
}

/**
 * Оновити категорію
 */
export async function updateCategory(id: number, data: { name: string }): Promise<Category> {
  const response = await apiRequest<CategoryResponse>(`/admin/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.data.category
}

/**
 * Видалити категорію
 */
export async function deleteCategory(id: number): Promise<void> {
  await apiRequest<void>(`/admin/categories/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Отримати всі продукти
 */
export async function getProducts(): Promise<Product[]> {
  const response = await apiRequest<ProductsResponse>('/admin/products', {
    method: 'GET',
  })
  return response.data.products
}

/**
 * Отримати продукт по ID (admin endpoint)
 */
export async function getProductById(id: number): Promise<Product> {
  const response = await apiRequest<ProductResponse>(`/admin/products/${id}`, {
    method: 'GET',
  })
  return response.data.product
}

/**
 * Отримати список продуктів з пагінацією, фільтрами та пошуком (публічний endpoint)
 */
export async function getProductsList(params: ProductsListParams = {}): Promise<PaginatedProductsResponse> {
  const queryParams = new URLSearchParams()
  
  if (params.page) queryParams.append('page', params.page.toString())
  if (params.per_page) queryParams.append('per_page', params.per_page.toString())
  if (params.search) queryParams.append('search', params.search)
  if (params.category_id) queryParams.append('category_id', params.category_id.toString())
  if (params.min_price !== undefined) queryParams.append('min_price', params.min_price.toString())
  if (params.max_price !== undefined) queryParams.append('max_price', params.max_price.toString())
  if (params.sort) queryParams.append('sort', params.sort)

  const queryString = queryParams.toString()
  const endpoint = `/products${queryString ? `?${queryString}` : ''}`

  return apiRequest<PaginatedProductsResponse>(endpoint, {
    method: 'GET',
  })
}

/**
 * Отримати продукт по slug (публічний endpoint)
 */
export async function getProductBySlug(slug: string): Promise<Product> {
  const response = await apiRequest<ProductResponse>(`/products/${slug}`, {
    method: 'GET',
  })
  return response.data.product
}

/**
 * Створити продукт
 */
export async function createProduct(data: ProductRequest): Promise<Product> {
  const response = await apiRequest<ProductResponse>('/admin/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return response.data.product
}

/**
 * Оновити продукт
 */
export async function updateProduct(id: number, data: Partial<ProductRequest>): Promise<Product> {
  const response = await apiRequest<ProductResponse>(`/admin/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
  return response.data.product
}

/**
 * Видалити продукт
 */
export async function deleteProduct(id: number): Promise<void> {
  await apiRequest<void>(`/admin/products/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Отримати всіх користувачів
 */
export async function getAllUsers(): Promise<UserResponse[]> {
  const response = await apiRequest<UserListResponse>('/admin/users', {
    method: 'GET',
  })
  return response.data.users
}

/**
 * Upload images for a product
 */
export async function uploadProductImages(
  productId: number,
  images: File[],
  primaryIndex?: number
): Promise<ProductImage[]> {
  const token = getAuthToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  const formData = new FormData()
  images.forEach((image) => {
    formData.append('images[]', image)
  })
  if (primaryIndex !== undefined) {
    formData.append('primary_index', String(primaryIndex))
  }

  const response = await fetch(`${API_BASE_URL}/admin/products/${productId}/images`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  })

  const contentType = response.headers.get('content-type')
  if (!contentType || !contentType.includes('application/json')) {
    const text = await response.text()
    const error: ApiError = {
      message: `Server returned invalid response. Status: ${response.status}`,
      errors: {},
    }
    throw error
  }

  const data = await response.json()

  if (!response.ok) {
    const error: ApiError = {
      message: data.message || data.error || 'Failed to upload images',
      errors: data.errors || {},
    }
    throw error
  }

  return data.data.images
}

/**
 * Set primary image for a product
 */
export async function setPrimaryImage(
  productId: number,
  imageId: number
): Promise<ProductImage> {
  const response = await apiRequest<{ success: boolean; data: { image: ProductImage } }>(
    `/admin/products/${productId}/images/${imageId}/primary`,
    {
      method: 'PUT',
    }
  )
  return response.data.image
}

/**
 * Delete an image
 */
export async function deleteProductImage(
  productId: number,
  imageId: number
): Promise<void> {
  await apiRequest<void>(`/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
  })
}

/**
 * Cart interfaces
 */
export interface CartItem {
  id: number
  user_id?: number | null
  anonymous_token?: string | null
  product_id: number
  quantity: number
  product: Product
  created_at?: string
  updated_at?: string
}

export interface CartResponse {
  success: boolean
  message?: string
  data: {
    cart_item?: CartItem
    cart_items?: CartItem[]
  }
}

/**
 * Add item to cart
 */
export async function addToCart(
  productId: number,
  quantity: number = 1
): Promise<CartItem> {
  const response = await apiRequest<CartResponse>('/cart/add', {
    method: 'POST',
    body: JSON.stringify({
      product_id: productId,
      quantity,
    }),
  })
  return response.data.cart_item!
}

/**
 * Get cart items
 */
export async function getCart(): Promise<CartItem[]> {
  const response = await apiRequest<CartResponse>('/cart', {
    method: 'GET',
  })
  return response.data.cart_items || []
}

/**
 * Update cart item quantity
 */
export async function updateCartItem(
  id: number,
  quantity: number
): Promise<CartItem> {
  const response = await apiRequest<CartResponse>(`/cart/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ quantity }),
  })
  return response.data.cart_item!
}

/**
 * Remove item from cart
 */
export async function removeCartItem(id: number): Promise<void> {
  await apiRequest<void>(`/cart/${id}`, {
    method: 'DELETE',
  })
}

/**
 * Clear cart
 */
export async function clearCart(): Promise<void> {
  await apiRequest<void>('/cart/clear', {
    method: 'DELETE',
  })
}

/**
 * Merge anonymous cart with user cart (only for authenticated users)
 */
export async function mergeCart(anonymousToken: string): Promise<CartItem[]> {
  const response = await apiRequest<CartResponse>('/cart/merge', {
    method: 'POST',
    body: JSON.stringify({ anonymous_token: anonymousToken }),
  })
  return response.data.cart_items || []
}
