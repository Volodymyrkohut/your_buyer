"use client"

import { useState, useRef } from "react"
import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Heart, Eye, ShoppingCart, GitCompare, Trash2 } from "lucide-react"
import Link from "next/link"
import { generateSlug, type Product } from "@/lib/products"
import { useCart } from "@/app/contexts/CartContext"
import { useWishlist } from "@/app/contexts/WishlistContext"
import { CartDropdown } from "@/app/components/cart/CartDropdown"

export type { Product }

interface ProductCardProps {
  product: Product
  onRemoveFromWishlist?: (productId: number) => void
  onMoveToCart?: (product: Product) => void
  isWishlistMode?: boolean
}

export const ProductCard = ({ 
  product, 
  onRemoveFromWishlist,
  onMoveToCart,
  isWishlistMode = false 
}: ProductCardProps) => {
  const { addItem, getItemQuantity, items } = useCart()
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlist()
  const [showCartDropdown, setShowCartDropdown] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const productSlug = generateSlug(product.name)
  const productUrl = `/products/${productSlug}`
  const cartQuantity = getItemQuantity(product.id)
  const hasItemsInCart = items.length > 0
  const inWishlist = isInWishlist(product.id)

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (isWishlistMode && onMoveToCart) {
      onMoveToCart(product)
    } else {
      addItem(product, 1)
    }
  }

  const handleRemoveFromWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRemoveFromWishlist) {
      onRemoveFromWishlist(product.id)
    }
  }

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (inWishlist) {
        await removeFromWishlist(product.id)
      } else {
        await addToWishlist(product)
      }
    } catch (error) {
      console.error('Failed to toggle wishlist:', error)
    }
  }

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

  return (
    <Card className={`group relative overflow-hidden ${isWishlistMode ? 'border border-[#A4A1AA]' : 'border-0'} bg-white shadow-sm transition-shadow hover:shadow-lg`}>
      {/* Product Image */}
      <Link href={productUrl} className="relative block aspect-square w-full overflow-hidden bg-grey-100">
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3C/svg%3E"
          }}
        />
        {/* Trash Icon for Wishlist Mode - Top Right */}
        {isWishlistMode && onRemoveFromWishlist && (
          <button
            onClick={handleRemoveFromWishlist}
            className="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-black transition-colors hover:bg-white hover:text-red-600"
            aria-label="Remove from wishlist"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
        {/* Hover Overlay with Actions - Only show if not in wishlist mode */}
        {!isWishlistMode && (
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-primary-100/90 opacity-0 transition-opacity group-hover:opacity-100">
            <Link
              href={productUrl}
              className="rounded-full bg-white p-2 text-primary-100 transition-colors hover:bg-grey-100"
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="h-4 w-4 text-primary-100" />
            </Link>
            <button
              onClick={handleToggleWishlist}
              className={`rounded-full bg-white p-2 transition-colors hover:bg-grey-100 ${
                inWishlist ? 'text-red-500' : 'text-primary-100'
              }`}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart className={`h-4 w-4 ${inWishlist ? 'fill-current' : ''}`} />
            </button>
            <button className="rounded-full bg-white p-2 text-primary-100 transition-colors hover:bg-grey-100">
              <GitCompare className="h-4 w-4 text-primary-100" />
            </button>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-4">
        {product.brand && (
          <Link href={productUrl}>
            <p className="mb-1 text-sm font-semibold text-primary-100 hover:text-primary-200 transition-colors">
              {product.brand}
            </p>
          </Link>
        )}
        <Link href={productUrl}>
          <h3 className="mb-2 line-clamp-2 text-sm font-normal text-primary-100 hover:text-primary-200 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-primary-100">
            ${product.price.toFixed(2)}
          </span>
          {product.originalPrice && (
            <span className="text-sm text-grey-400 line-through">
              ${product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>
        <div className="relative">
          {isWishlistMode ? (
            <Button
              variant="outline"
              className="mt-3 w-full border border-[#A4A1AA] bg-white text-black hover:bg-grey-100"
              size="sm"
              onClick={handleAddToCart}
            >
              Move to Cart
            </Button>
          ) : (
            <>
              <Button
                ref={buttonRef}
                className="mt-3 w-full"
                size="sm"
                variant={cartQuantity > 0 ? "default" : "outline"}
                onClick={handleAddToCart}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {cartQuantity > 0 ? `In Cart (${cartQuantity})` : "Add to Cart"}
              </Button>
              {showCartDropdown && hasItemsInCart && (
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <CartDropdown triggerRef={buttonRef} />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Card>
  )
}
