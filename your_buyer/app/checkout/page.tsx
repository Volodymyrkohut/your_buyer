"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Home, ChevronRight, Loader2 } from "lucide-react"
import Link from "next/link"
import Select from "react-select"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { useCart } from "@/app/contexts/CartContext"
import { useUser } from "@/app/contexts/UserContext"
import { 
  createOrder, 
  getNovaPoshtaCities, 
  getNovaPoshtaDepartments,
  type CreateOrderRequest,
  type NovaPoshtaCity,
  type NovaPoshtaDepartment
} from "@/lib/api"
import type { CartItem as CartItemType } from "@/lib/cart"

// Custom styles for react-select
const selectStyles = {
  control: (base: any, state: any) => ({
    ...base,
    borderColor: state.isFocused ? '#4A90E2' : '#D1D5DB',
    boxShadow: state.isFocused ? '0 0 0 2px rgba(74, 144, 226, 0.2)' : 'none',
    '&:hover': {
      borderColor: '#4A90E2',
    },
    minHeight: '40px',
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? '#4A90E2'
      : state.isFocused
      ? '#E5F0FF'
      : 'white',
    color: state.isSelected ? 'white' : '#1F2937',
    '&:active': {
      backgroundColor: '#4A90E2',
    },
  }),
  placeholder: (base: any) => ({
    ...base,
    color: '#9CA3AF',
  }),
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items: cartItems, clearCart } = useCart()
  const { user, isAuthenticated } = useUser()

  const [formData, setFormData] = useState<CreateOrderRequest>({
    name: "",
    surname: "",
    middlename: "",
    phone: "",
    delivery_city: "",
    delivery_department: "",
    dont_call: false,
  })

  const [cities, setCities] = useState<NovaPoshtaCity[]>([])
  const [departments, setDepartments] = useState<NovaPoshtaDepartment[]>([])
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string } | null>(null)
  const [selectedDepartment, setSelectedDepartment] = useState<{ value: string; label: string } | null>(null)
  const [citySearchInput, setCitySearchInput] = useState("")
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Auto-fill form if user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.firstName || "",
        surname: user.lastName || "",
        phone: user.phone || "",
      }))
    }
  }, [isAuthenticated, user])

  // Load cities with debounce on search input change or on mount
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const loadCities = async () => {
        setLoadingCities(true)
        try {
          const searchQuery = citySearchInput.trim()
          const citiesData = await getNovaPoshtaCities(searchQuery || undefined)
          setCities(citiesData)
        } catch (err) {
          console.error("Failed to load cities:", err)
          setError("Не вдалося завантажити список міст")
        } finally {
          setLoadingCities(false)
        }
      }
      loadCities()
    }, citySearchInput ? 300 : 0) // Debounce 300ms for search, immediate for initial load

    return () => clearTimeout(timeoutId)
  }, [citySearchInput])

  // Load departments when city is selected
  useEffect(() => {
    if (!selectedCity) {
      setDepartments([])
      setSelectedDepartment(null)
      setFormData((prev) => ({ ...prev, delivery_department: "" }))
      return
    }

    const loadDepartments = async () => {
      setLoadingDepartments(true)
      try {
        const departmentsData = await getNovaPoshtaDepartments(selectedCity.value)
        setDepartments(departmentsData)
      } catch (err) {
        console.error("Failed to load departments:", err)
        setError("Не вдалося завантажити список відділень")
      } finally {
        setLoadingDepartments(false)
      }
    }
    loadDepartments()
  }, [selectedCity])

  // Redirect if cart is empty
  useEffect(() => {
    if (cartItems.length === 0) {
      router.push("/cart")
    }
  }, [cartItems, router])

  const handleInputChange = (field: keyof CreateOrderRequest, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCityChange = (option: { value: string; label: string } | null) => {
    setSelectedCity(option)
    if (option) {
      setFormData((prev) => ({ ...prev, delivery_city: option.label }))
    } else {
      setFormData((prev) => ({ ...prev, delivery_city: "" }))
    }
  }

  const handleDepartmentChange = (option: { value: string; label: string } | null) => {
    setSelectedDepartment(option)
    if (option) {
      setFormData((prev) => ({ ...prev, delivery_department: option.label }))
    } else {
      setFormData((prev) => ({ ...prev, delivery_department: "" }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name.trim()) {
      setError("Ім'я обов'язкове")
      return
    }
    if (!formData.surname.trim()) {
      setError("Прізвище обов'язкове")
      return
    }
    if (!formData.phone.trim()) {
      setError("Телефон обов'язковий")
      return
    }
    if (!formData.delivery_city.trim()) {
      setError("Місто доставки обов'язкове")
      return
    }
    if (!formData.delivery_department.trim()) {
      setError("Відділення доставки обов'язкове")
      return
    }

    setIsSubmitting(true)
    try {
      const order = await createOrder(formData)
      // Clear cart after successful order creation
      await clearCart()
      // Redirect to success page or orders page
      router.push(`/account/orders?order_id=${order.id}`)
    } catch (err: any) {
      console.error("Failed to create order:", err)
      setError(err.message || "Не вдалося створити замовлення")
    } finally {
      setIsSubmitting(false)
    }
  }

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  // Prepare options for react-select
  const cityOptions = useMemo(() => {
    return cities.map((city) => ({
      value: city.Ref,
      label: city.Description,
    }))
  }, [cities])

  const departmentOptions = useMemo(() => {
    return departments.map((dept) => ({
      value: dept.Ref,
      label: dept.Description,
    }))
  }, [departments])

  if (cartItems.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen bg-grey-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-grey-600">
          <Link href="/" className="flex items-center gap-1 hover:text-primary-100">
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/cart" className="hover:text-primary-100">
            Cart
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-primary-100">Checkout</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-primary-100 md:text-4xl">
            Оформлення замовлення
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Order Form */}
            <div className="lg:col-span-2">
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="rounded-lg bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-primary-100">
                    Особиста інформація
                  </h2>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-grey-700">
                        Ім'я *
                      </label>
                      <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        required
                        className="border-grey-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-grey-700">
                        Прізвище *
                      </label>
                      <Input
                        type="text"
                        value={formData.surname}
                        onChange={(e) => handleInputChange("surname", e.target.value)}
                        required
                        className="border-grey-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-grey-700">
                        По батькові
                      </label>
                      <Input
                        type="text"
                        value={formData.middlename || ""}
                        onChange={(e) => handleInputChange("middlename", e.target.value)}
                        className="border-grey-300"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-grey-700">
                        Телефон *
                      </label>
                      <Input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        required
                        className="border-grey-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Delivery Information */}
                <div className="rounded-lg bg-white p-6">
                  <h2 className="mb-4 text-xl font-semibold text-primary-100">
                    Доставка (Нова Пошта)
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-grey-700">
                        Місто *
                      </label>
                      <Select
                        options={cityOptions}
                        value={selectedCity}
                        onChange={handleCityChange}
                        onInputChange={setCitySearchInput}
                        inputValue={citySearchInput}
                        isLoading={loadingCities}
                        isSearchable={true}
                        placeholder={loadingCities ? "Завантаження..." : "Виберіть або знайдіть місто"}
                        noOptionsMessage={({ inputValue }) =>
                          inputValue
                            ? `Не знайдено міст за запитом "${inputValue}"`
                            : "Введіть назву міста для пошуку"
                        }
                        styles={selectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-grey-700">
                        Відділення *
                      </label>
                      <Select
                        options={departmentOptions}
                        value={selectedDepartment}
                        onChange={handleDepartmentChange}
                        isLoading={loadingDepartments}
                        isSearchable={true}
                        isDisabled={!selectedCity || loadingDepartments}
                        placeholder={
                          !selectedCity
                            ? "Спочатку виберіть місто"
                            : loadingDepartments
                            ? "Завантаження..."
                            : "Виберіть або знайдіть відділення"
                        }
                        noOptionsMessage={() => "Не знайдено відділень"}
                        styles={selectStyles}
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="dont_call"
                        checked={formData.dont_call}
                        onChange={(e) => handleInputChange("dont_call", e.target.checked)}
                        className="h-4 w-4 rounded border-grey-300 text-primary-100 focus:ring-primary-100"
                      />
                      <label htmlFor="dont_call" className="text-sm text-grey-700">
                        Не телефонувати для підтвердження
                      </label>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg bg-red-50 p-4 text-red-600">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 rounded-lg bg-white p-6">
                <h2 className="mb-4 text-xl font-semibold text-primary-100">
                  Ваше замовлення
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item: CartItemType) => (
                    <div key={item.product.id} className="flex gap-3 border-b border-grey-200 pb-3">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-grey-100">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-primary-100">
                          {item.product.name}
                        </p>
                        <p className="text-xs text-grey-500">
                          Кількість: {item.quantity}
                        </p>
                        <p className="text-sm font-semibold text-primary-100">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="border-t border-grey-200 pt-3">
                    <div className="flex justify-between text-lg font-bold text-primary-100">
                      <span>Всього:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Обробка...
                      </>
                    ) : (
                      "Оформити замовлення"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
