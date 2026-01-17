"use client"

import { AccountLayout } from "@/app/components/account/AccountLayout"
import { ProductCard } from "@/app/components/products/ProductCard"
import { useWishlist } from "@/app/contexts/WishlistContext"
import { useCart } from "@/app/contexts/CartContext"
import { Heart } from "lucide-react"

export default function WishlistPage() {
  const { items: wishlistItems, loading, removeItem: removeFromWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()

  const handleMoveToCart = async (product: { id: number }) => {
    try {
      await addToCart(product as any, 1)
      await removeFromWishlist(product.id)
    } catch (error) {
      console.error('Failed to move product to cart:', error)
    }
  }

  // Loading State
  if (loading) {
    return (
      <AccountLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-grey-600">Loading wishlist...</div>
        </div>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout>
      <div>
        {/* Wishlist Products Grid */}
        {wishlistItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {wishlistItems.map((item) => (
              <ProductCard
                key={item.product.id}
                product={item.product}
                isWishlistMode={true}
                onRemoveFromWishlist={removeFromWishlist}
                onMoveToCart={handleMoveToCart}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="rounded-lg border border-[#A4A1AA] bg-white p-12 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-grey-400" />
            <h3 className="mb-2 text-xl font-semibold text-primary-100">
              Your wishlist is empty
            </h3>
            <p className="text-grey-600">
              Start adding products to your wishlist
            </p>
          </div>
        )}
      </div>
    </AccountLayout>
  )
}
