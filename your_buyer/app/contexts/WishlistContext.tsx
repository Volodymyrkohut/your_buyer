"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { Product } from "@/lib/products"

export interface WishlistItem {
  product: Product
}

export interface WishlistContextType {
  items: WishlistItem[]
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  isInWishlist: (productId: number) => boolean
  getTotalItems: () => number
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([])

  const addItem = useCallback((product: Product) => {
    setItems((prevItems) => {
      // Check if product already exists
      if (prevItems.some((item) => item.product.id === product.id)) {
        return prevItems
      }
      return [...prevItems, { product }]
    })
  }, [])

  const removeItem = useCallback((productId: number) => {
    setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
  }, [])

  const isInWishlist = useCallback((productId: number) => {
    return items.some((item) => item.product.id === productId)
  }, [items])

  const getTotalItems = useCallback(() => {
    return items.length
  }, [items])

  const value: WishlistContextType = {
    items,
    addItem,
    removeItem,
    isInWishlist,
    getTotalItems,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (context === undefined) {
    throw new Error("useWishlist must be used within a WishlistProvider")
  }
  return context
}
