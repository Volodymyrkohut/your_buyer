"use client"

import { useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useCart } from "@/app/contexts/CartContext"
import { generateSlug } from "@/lib/products"
import Link from "next/link"
import { ShoppingBag, X } from "lucide-react"
import { Button } from "@/app/components/ui/button"

interface CartDropdownProps {
  className?: string
  triggerRef?: React.RefObject<HTMLElement | null>
}

export const CartDropdown = ({ className, triggerRef }: CartDropdownProps) => {
  const { items, removeItem, getTotalPrice } = useCart()
  const [position, setPosition] = useState({ top: 0, right: 0 })
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const totalPrice = getTotalPrice()

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = () => {
    if (triggerRef?.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      
      setPosition({
        top: triggerRect.bottom + window.scrollY + 8,
        right: window.innerWidth - triggerRect.right,
      })
    }
  }

  useEffect(() => {
    updatePosition()
    
    const handleScroll = () => updatePosition()
    const handleResize = () => updatePosition()
    
    window.addEventListener("scroll", handleScroll, true)
    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("scroll", handleScroll, true)
      window.removeEventListener("resize", handleResize)
    }
  }, [triggerRef, items])

  if (!mounted) return null

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`fixed z-[9999] w-80 rounded-md bg-white shadow-lg ${className || ""}`}
      style={{
        top: `${position.top}px`,
        right: `${position.right}px`,
      }}
    >
      <div className="max-h-96 overflow-y-auto">
        {/* Header */}
        <div className="p-4">
          <h3 className="text-sm font-semibold text-primary-100">
            Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
          </h3>
        </div>

        {/* Cart Items */}
        <div className="space-y-2">
          {items.map((item) => {
            const productSlug = generateSlug(item.product.name)
            return (
              <div
                key={item.product.id}
                className="flex gap-3 p-4 hover:bg-grey-50 transition-colors"
              >
                <Link
                  href={`/products/${productSlug}`}
                  className="flex-shrink-0"
                >
                  <div className="h-16 w-16 overflow-hidden rounded-md bg-grey-100">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </Link>
                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    href={`/products/${productSlug}`}
                    className="text-sm font-medium text-primary-100 hover:text-primary-200 transition-colors line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary-100">
                      ${item.product.price.toFixed(2)}
                    </span>
                    <span className="text-xs text-grey-500">x {item.quantity}</span>
                  </div>
                  <p className="text-xs font-semibold text-primary-100">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
                <button
                  onClick={() => removeItem(item.product.id)}
                  className="flex-shrink-0 p-1 text-grey-400 hover:text-red-500 transition-colors"
                  aria-label="Remove item"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="p-4 pt-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-primary-100">Total:</span>
            <span className="text-lg font-bold text-primary-100">
              ${totalPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href="/cart">View Cart</Link>
            </Button>
            <Button className="flex-1" asChild>
              <Link href="/checkout">Checkout</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  if (items.length === 0) {
    return createPortal(
      <div
        ref={dropdownRef}
        className={`fixed z-[9999] w-80 rounded-md bg-white shadow-lg ${className || ""}`}
        style={{
          top: `${position.top}px`,
          right: `${position.right}px`,
        }}
      >
        <div className="p-6 text-center">
          <ShoppingBag className="mx-auto mb-4 h-12 w-12 text-grey-400" />
          <p className="text-sm text-grey-600">Your cart is empty</p>
        </div>
      </div>,
      document.body
    )
  }

  return createPortal(dropdownContent, document.body)
}
