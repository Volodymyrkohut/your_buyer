"use client"

import { useState, useRef } from "react"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { ShoppingCart, Heart, GitCompare, Minus, Plus } from "lucide-react"
import { ProductDetail } from "@/lib/products"
import { useCart } from "@/app/contexts/CartContext"
import { CartDropdown } from "@/app/components/cart/CartDropdown"

interface ProductInfoProps {
  product: ProductDetail
}

export const ProductInfo = ({ product }: ProductInfoProps) => {
  const { addItem, getItemQuantity, items } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [showCartDropdown, setShowCartDropdown] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const cartQuantity = getItemQuantity(product.id)
  const hasItemsInCart = items.length > 0

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (hasItemsInCart) {
      setShowCartDropdown(true)
    }
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowCartDropdown(false)
    }, 200)
  }

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const increaseQuantity = () => {
    setQuantity(quantity + 1)
  }

  const handleAddToCart = () => {
    addItem(product, quantity)
  }

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0

  return (
    <div className="space-y-6">
      {/* Product Title */}
      <div>
        <h1 className="mb-2 text-3xl font-bold text-primary-100 md:text-4xl">
          {product.name}
        </h1>
        {product.sku && (
          <p className="text-sm text-grey-500">SKU: {product.sku}</p>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center gap-3">
        <span className="text-3xl font-bold text-primary-100">
          ${product.price.toFixed(2)}
        </span>
        {product.originalPrice && (
          <>
            <span className="text-xl text-grey-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
            {discountPercentage > 0 && (
              <span className="rounded bg-secondary-100 px-2 py-1 text-sm font-semibold text-white">
                -{discountPercentage}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Short Description */}
      {product.short_description && (
        <div>
          <p className="text-grey-600 leading-relaxed text-lg">{product.short_description}</p>
        </div>
      )}

      {/* Description */}
      {product.description && (
        <div>
          <h2 className="mb-2 text-lg font-semibold text-primary-100">
            Description
          </h2>
          <p className="text-grey-600 leading-relaxed">{product.description}</p>
        </div>
      )}

      {/* Size Selection */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-primary-100">
            Size
          </label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`rounded-md border-2 px-4 py-2 text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? "border-tertiary-100 bg-tertiary-100 text-white hover:bg-tertiary-200 hover:border-tertiary-200 shadow-md"
                    : "border-grey-300 bg-white text-primary-100 hover:border-primary-200 hover:bg-grey-100"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selection */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <label className="mb-2 block text-sm font-medium text-primary-100">
            Color
          </label>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`rounded-md border-2 px-4 py-2 text-sm font-medium transition-colors ${
                  selectedColor === color
                    ? "border-tertiary-100 bg-tertiary-100 text-white hover:bg-tertiary-200 hover:border-tertiary-200 shadow-md"
                    : "border-grey-300 bg-white text-primary-100 hover:border-primary-200 hover:bg-grey-100"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity Selector */}
      <div>
        <label className="mb-2 block text-sm font-medium text-primary-100">
          Quantity
        </label>
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-grey-300 rounded-md">
            <button
              onClick={decreaseQuantity}
              className="p-2 hover:bg-grey-100 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="h-4 w-4" />
            </button>
            <Input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 1
                setQuantity(Math.max(1, value))
              }}
              className="w-16 border-0 text-center focus-visible:ring-0"
            />
            <button
              onClick={increaseQuantity}
              className="p-2 hover:bg-grey-100 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {product.inStock !== false && (
            <span className="text-sm text-grey-600">
              {product.inStock ? "In Stock" : "Out of Stock"}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Button
            ref={buttonRef}
            className="w-full"
            size="lg"
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            variant={cartQuantity > 0 ? "default" : "default"}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
          </Button>
          {showCartDropdown && hasItemsInCart && (
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <CartDropdown triggerRef={buttonRef} className="left-auto right-0" />
            </div>
          )}
        </div>
        <Button variant="outline" size="lg" className="sm:w-auto">
          <Heart className="mr-2 h-5 w-5" />
          Wishlist
        </Button>
        <Button variant="outline" size="lg" className="sm:w-auto">
          <GitCompare className="mr-2 h-5 w-5" />
          Compare
        </Button>
      </div>

      {/* Additional Info */}
      <div className="border-t border-grey-200 pt-6">
        <div className="space-y-2 text-sm text-grey-600">
          <p>
            <span className="font-medium text-primary-100">Free Shipping</span>{" "}
            on orders over $50
          </p>
          <p>
            <span className="font-medium text-primary-100">30-Day Returns</span>{" "}
            - Easy returns and exchanges
          </p>
          <p>
            <span className="font-medium text-primary-100">Secure Payment</span>{" "}
            - Your payment information is safe
          </p>
        </div>
      </div>
    </div>
  )
}
