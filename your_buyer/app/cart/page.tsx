"use client"

import { Home, ChevronRight, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { CartItem } from "@/app/components/cart/CartItem"
import { CartSummary } from "@/app/components/cart/CartSummary"
import { useCart } from "@/app/contexts/CartContext"

export default function CartPage() {
  const { items: cartItems, updateQuantity, removeItem, clearCart } = useCart()

  const isEmpty = cartItems.length === 0

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
          <span className="text-primary-100">Cart</span>
        </nav>

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-primary-100 md:text-4xl">
            Checkout
          </h1>
        </div>

        {isEmpty ? (
          /* Empty Cart State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-6 rounded-full bg-grey-100 p-8">
              <ShoppingCart className="h-16 w-16 text-grey-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-primary-100">
              Your cart is empty
            </h2>
            <p className="mb-6 text-grey-600">
              Looks like you haven't added anything to your cart yet.
            </p>
            <Link href="/shop">
              <button className="rounded-md bg-primary-100 px-6 py-3 text-white transition-colors hover:bg-primary-200">
                Start Shopping
              </button>
            </Link>
          </div>
        ) : (
          /* Cart Content */
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            {/* Cart Items Table */}
            <div className="lg:col-span-2">
              <div className="rounded-lg bg-white p-6">
                {/* Table Header */}
                <div className="mb-4 hidden grid-cols-12 gap-4 border-b border-grey-200 pb-3 text-sm font-semibold text-primary-100 md:grid">
                  <div className="col-span-5">Products</div>
                  <div className="col-span-2 text-center">Price</div>
                  <div className="col-span-2 text-center">Quantity</div>
                  <div className="col-span-3 text-right">Subtotal</div>
                </div>
                {/* Table Body */}
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <CartItem
                      key={item.product.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeItem}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <CartSummary items={cartItems} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
