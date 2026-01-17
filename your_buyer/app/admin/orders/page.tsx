"use client"

import { useState, useEffect } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Search, Filter, Loader2 } from "lucide-react"
import { getOrders, type Order } from "@/lib/api"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true)
        const ordersData = await getOrders()
        setOrders(ordersData)
      } catch (err: any) {
        console.error("Failed to load orders:", err)
        setError(err.message || "Не вдалося завантажити замовлення")
      } finally {
        setLoading(false)
      }
    }
    loadOrders()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-[#E6F7ED] text-[#34C759]"
      case "processing":
        return "bg-[#FDF2E2] text-[#A47A3A]"
      case "shipped":
        return "bg-[#E3F2FD] text-[#2196F3]"
      case "pending":
        return "bg-[#FFF3E0] text-[#FF9800]"
      case "cancelled":
        return "bg-[#FFEBEE] text-[#F44336]"
      default:
        return "bg-grey-100 text-grey-700"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered"
      case "processing":
        return "Processing"
      case "shipped":
        return "Shipped"
      case "pending":
        return "Pending"
      case "cancelled":
        return "Cancelled"
      default:
        return status
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("uk-UA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const toNumber = (value: string | number): number => {
    return typeof value === 'number' ? value : parseFloat(value)
  }

  const filteredOrders = orders.filter((order) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      order.id.toString().includes(searchLower) ||
      order.name.toLowerCase().includes(searchLower) ||
      order.surname.toLowerCase().includes(searchLower) ||
      order.phone.includes(searchLower) ||
      order.order_items?.some((item) =>
        item.product.name.toLowerCase().includes(searchLower)
      )
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary-100" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
        {error}
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-100">Замовлення</h2>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-grey-400" />
          <Input
            type="text"
            placeholder="Пошук замовлень..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="default" className="gap-2">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
      </div>

      {/* Orders List */}
      <div className="space-y-0">
        {filteredOrders.length === 0 ? (
          <div className="rounded-lg border border-[#F0F0F0] bg-white p-8 text-center">
            <p className="text-grey-600">Замовлень не знайдено</p>
          </div>
        ) : (
          filteredOrders.map((order, index) => (
            <div
              key={order.id}
              className={`bg-white py-6 ${
                index !== filteredOrders.length - 1
                  ? "border-b border-[#F0F0F0]"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-4">
                {/* Order Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    <h3 className="mb-2 text-lg font-semibold text-primary-100">
                      Замовлення #{order.id}
                    </h3>
                    <div className="space-y-1 text-sm text-grey-600">
                      <p>Дата: {formatDate(order.created_at)}</p>
                      <p>
                        Користувач: {order.name} {order.surname}
                        {order.middlename && ` ${order.middlename}`}
                      </p>
                      <p>Телефон: {order.phone}</p>
                      <p>
                        Доставка: {order.delivery_city}, {order.delivery_department}
                      </p>
                      {order.dont_call && (
                        <p className="text-orange-600">Не телефонувати для підтвердження</p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-lg font-bold text-primary-100">
                      ${toNumber(order.total_amount).toFixed(2)}
                    </div>
                    <span
                      className={`inline-block rounded px-3 py-1 text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                {order.order_items && order.order_items.length > 0 && (
                  <div className="mt-4 space-y-3 border-t border-grey-200 pt-4">
                    <h4 className="text-sm font-semibold text-primary-100">
                      Товари ({order.order_items.length}):
                    </h4>
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-md bg-grey-50 p-3"
                      >
                        {item.product.primary_image_url && (
                          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-grey-100">
                            <img
                              src={item.product.primary_image_url}
                              alt={item.product.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-primary-100">
                            {item.product.name}
                          </p>
                          <p className="text-sm text-grey-600">
                            Кількість: {item.quantity} × ${toNumber(item.price_at_order).toFixed(2)}
                          </p>
                        </div>
                        <div className="text-sm font-semibold text-primary-100">
                          ${(item.quantity * toNumber(item.price_at_order)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
