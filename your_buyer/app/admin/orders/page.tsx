"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Search, Filter } from "lucide-react"
import type { Order } from "@/lib/api"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock orders data
  const orders: Order[] = [
    {
      id: "ORD-001",
      productName: "Girls Pink Moana Printed Dress",
      size: "S",
      quantity: 1,
      price: 80.00,
      status: "Delivered",
      statusMessage: "Your product has been delivered",
      image: "/images/products/product-1.jpg",
      canReview: true,
    },
    {
      id: "ORD-002",
      productName: "Women Textured Handheld Bag",
      size: "Regular",
      quantity: 1,
      price: 80.00,
      status: "Processing",
      statusMessage: "Your product is being processed",
      image: "/images/products/product-2.jpg",
      canReview: false,
    },
    {
      id: "ORD-003",
      productName: "Tailored Cotton Casual Shirt",
      size: "M",
      quantity: 2,
      price: 40.00,
      status: "Shipped",
      statusMessage: "Your product has been shipped",
      image: "/images/products/product-3.jpg",
      canReview: false,
    },
    {
      id: "ORD-004",
      productName: "Men adi-dash Running Shoes",
      size: "42",
      quantity: 1,
      price: 60.00,
      status: "Pending",
      statusMessage: "Order is pending",
      image: "/images/products/product-4.jpg",
      canReview: false,
    },
    {
      id: "ORD-005",
      productName: "High Heel Sandals",
      size: "38",
      quantity: 1,
      price: 50.00,
      status: "Cancelled",
      statusMessage: "Order has been cancelled",
      image: "/images/products/product-5.jpg",
      canReview: false,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-[#E6F7ED] text-[#34C759]"
      case "Processing":
        return "bg-[#FDF2E2] text-[#A47A3A]"
      case "Shipped":
        return "bg-[#E3F2FD] text-[#2196F3]"
      case "Pending":
        return "bg-[#FFF3E0] text-[#FF9800]"
      case "Cancelled":
        return "bg-[#FFEBEE] text-[#F44336]"
      default:
        return "bg-grey-100 text-grey-700"
    }
  }

  const filteredOrders = orders.filter((order) =>
    order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-100">Orders</h2>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-grey-400" />
          <Input
            type="text"
            placeholder="Search orders..."
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
            <p className="text-grey-600">No orders found</p>
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
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Order Info - Left Column */}
                <div className="flex-1">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-primary-100">
                        {order.productName}
                      </h3>
                      <div className="space-y-1 text-sm text-grey-600">
                        <p>Order ID: {order.id}</p>
                        {order.size && <p>Size: {order.size}</p>}
                        <p>Quantity: {order.quantity}</p>
                      </div>
                    </div>
                    {/* Price - aligned with product name */}
                    <div className="text-lg font-bold text-primary-100 sm:text-right">
                      ${order.price.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block rounded px-3 py-1 text-xs font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                    {order.statusMessage && (
                      <p className="text-sm text-grey-600">
                        {order.statusMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
