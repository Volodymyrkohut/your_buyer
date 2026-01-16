"use client"

import { useEffect, useRef } from "react"
import { AccountLayout } from "@/app/components/account/AccountLayout"
import { ProductCard } from "@/app/components/products/ProductCard"
import { useWishlist } from "@/app/contexts/WishlistContext"
import { useCart } from "@/app/contexts/CartContext"
import { Heart } from "lucide-react"
import type { Product } from "@/lib/products"

export default function WishlistPage() {
  const { items: wishlistItems, removeItem: removeFromWishlist, addItem: addToWishlist } = useWishlist()
  const { addItem: addToCart } = useCart()
  const initializedRef = useRef(false)

  // Mock wishlist products matching the design
  const mockWishlistProducts: Product[] = [
    {
      id: 101,
      name: "Women Textured Handheld Bag",
      brand: "Allen Solly",
      price: 80.00,
      originalPrice: 100.00,
      image: "/images/products/product-1.jpg",
    },
    {
      id: 102,
      name: "Polo Collar T-Shirt",
      brand: "Louis Philippe Sport",
      price: 50.00,
      originalPrice: 55.00,
      image: "/images/products/product-2.jpg",
    },
    {
      id: 103,
      name: "Men adi-dash Running Shoes",
      brand: "Adidas",
      price: 60.00,
      originalPrice: 75.00,
      image: "/images/products/product-3.jpg",
    },
    {
      id: 104,
      name: "Brown Leather Jacket",
      brand: "Allen Solly",
      price: 60.00,
      originalPrice: 70.00,
      image: "/images/products/product-4.jpg",
    },
    {
      id: 105,
      name: "Casual Shoe for Men",
      brand: "US Polo",
      price: 40.00,
      originalPrice: 50.00,
      image: "/images/products/product-5.jpg",
    },
    {
      id: 106,
      name: "Leather Hand Purse",
      brand: "Gucci",
      price: 40.00,
      originalPrice: 60.00,
      image: "/images/products/product-6.jpg",
    },
    {
      id: 107,
      name: "Graphic Print T-Shirt",
      brand: "Roadstar",
      price: 35.00,
      originalPrice: 45.00,
      image: "/images/products/product-7.jpg",
    },
    {
      id: 108,
      name: "Patterned Long Sleeve Jacket",
      brand: "Allen Solly",
      price: 70.00,
      originalPrice: 85.00,
      image: "/images/products/product-8.jpg",
    },
    {
      id: 109,
      name: "Quilted Handbag",
      brand: "Zyla",
      price: 55.00,
      originalPrice: 70.00,
      image: "/images/products/product-9.jpg",
    },
  ]

  // Initialize wishlist with mock data if empty (only once)
  useEffect(() => {
    if (!initializedRef.current && wishlistItems.length === 0) {
      initializedRef.current = true
      mockWishlistProducts.forEach((product) => {
        addToWishlist(product)
      })
    }
  }, [wishlistItems.length, addToWishlist])

  return (
    <AccountLayout>
      <div>
        {/* Wishlist Products Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {wishlistItems.map((item) => (
            <ProductCard
              key={item.product.id}
              product={item.product}
              isWishlistMode={true}
              onRemoveFromWishlist={removeFromWishlist}
              onMoveToCart={(product) => {
                addToCart(product, 1)
                removeFromWishlist(product.id)
              }}
            />
          ))}
        </div>

        {/* Empty State */}
        {wishlistItems.length === 0 && (
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
