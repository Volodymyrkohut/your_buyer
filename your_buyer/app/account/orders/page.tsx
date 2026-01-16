"use client"

import { useState } from "react"
import { AccountLayout } from "@/app/components/account/AccountLayout"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Search, Filter } from "lucide-react"

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("")

  // Mock orders data matching the design
  const orders = [
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
      status: "In Process",
      statusMessage: "Your product has been Inprocess",
      image: "/images/products/product-2.jpg",
      canReview: false,
    },
    {
      id: "ORD-003",
      productName: "Tailored Cotton Casual Shirt",
      size: "M",
      quantity: 1,
      price: 40.00,
      status: "In Process",
      statusMessage: "Your product has been Inprocess",
      image: "/images/products/product-3.jpg",
      canReview: false,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Delivered":
        return "bg-[#E6F7ED] text-[#34C759]"
      case "In Process":
        return "bg-[#FDF2E2] text-[#A47A3A]"
      default:
        return "bg-grey-100 text-grey-700"
    }
  }

  return (
    <AccountLayout>
      <div>
        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-grey-400" />
            <Input
              type="text"
              placeholder="Search"
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
          {orders.map((order, index) => (
            <div
              key={order.id}
              className={`bg-white py-6 ${index !== orders.length - 1 ? 'border-b border-[#F0F0F0]' : ''}`}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                {/* Product Image */}
                <div className="flex-shrink-0">
                  <div className="h-24 w-24 overflow-hidden rounded-lg bg-grey-100">
                    <img
                      src={order.image}
                      alt={order.productName}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3C/svg%3E"
                      }}
                    />
                  </div>
                </div>

                {/* Product Details - Middle Column */}
                <div className="flex-1">
                  <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2 text-lg font-semibold text-primary-100">
                        {order.productName}
                      </h3>
                      <div className="space-y-1 text-sm text-grey-600">
                        <p>Size: {order.size}</p>
                        <p>Qyt: {order.quantity}</p>
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
                    <p className="text-sm text-grey-600">
                      {order.statusMessage}
                    </p>
                  </div>
                </div>

                {/* Action Buttons - Right Column */}
                <div className="flex flex-col items-start gap-2 sm:items-end">
                  <Button variant="outline" size="sm" className="w-full sm:w-auto">
                    View Order
                  </Button>
                  {order.canReview ? (
                    <Button variant="default" size="sm" className="w-full sm:w-auto">
                      Write A Review
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      className="w-full bg-[#F58D76] text-white hover:bg-[#E67E68] sm:w-auto"
                    >
                      Cancel Order
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AccountLayout>
  )
}
