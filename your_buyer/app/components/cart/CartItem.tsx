"use client"

import { useState } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Plus, Minus } from "lucide-react"
import Link from "next/link"
import { generateSlug, type Product } from "@/lib/products"
import type { CartItem as CartItemType } from "@/lib/cart"

interface CartItemProps {
  item: CartItemType
  onUpdateQuantity: (productId: number, quantity: number) => void
  onRemove: (productId: number) => void
}

export const CartItem = ({ item, onUpdateQuantity, onRemove }: CartItemProps) => {
  const [quantity, setQuantity] = useState(item.quantity)
  const productSlug = generateSlug(item.product.name)
  const productUrl = `/products/${productSlug}`

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity < 1) return
    setQuantity(newQuantity)
    onUpdateQuantity(item.product.id, newQuantity)
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      handleQuantityChange(quantity - 1)
    }
  }

  const handleIncrease = () => {
    handleQuantityChange(quantity + 1)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    handleQuantityChange(Math.max(1, value))
  }

  const itemTotal = item.product.price * quantity

  return (
    <div className="grid grid-cols-12 gap-4 items-center max-md:gap-2">
      {/* Products Column */}
      <div className="col-span-5 flex items-center gap-3">
        <Link href={productUrl} className="flex-shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-md bg-grey-100">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="h-full w-full object-cover"
            />
          </div>
        </Link>
        <div className="flex flex-col">
          <Link href={productUrl}>
            <h3 className="text-sm font-medium text-primary-100 hover:text-primary-200 transition-colors">
              {item.product.name}
            </h3>
          </Link>
          {item.product.category && (
            <p className="text-xs text-grey-500">Size {item.product.category}</p>
          )}
        </div>
      </div>

      {/* Price Column */}
      <div className="col-span-2 text-center">
        <span className="text-sm font-medium text-primary-100">
          ${item.product.price.toFixed(2)}
        </span>
      </div>

      {/* Quantity Column */}
      <div className="col-span-2 flex items-center justify-center">
        <div className="flex items-center border border-grey-300 rounded-md">
          <button
            onClick={handleDecrease}
            className="p-1 hover:bg-grey-100 transition-colors"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3 w-3" />
          </button>
          <Input
            type="number"
            min="1"
            value={quantity}
            onChange={handleInputChange}
            className="w-12 border-0 text-center focus-visible:ring-0 h-8 px-1"
          />
          <button
            onClick={handleIncrease}
            className="p-1 hover:bg-grey-100 transition-colors"
            aria-label="Increase quantity"
          >
            <Plus className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Subtotal Column */}
      <div className="col-span-3 text-right">
        <p className="text-sm font-medium text-primary-100">
          ${itemTotal.toFixed(2)}
        </p>
      </div>
    </div>
  )
}
