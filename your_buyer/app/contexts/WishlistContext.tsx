"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import type { Product } from "@/lib/products"
import { 
  addToWishlist as apiAddToWishlist, 
  getWishlist as apiGetWishlist,
  removeFromWishlist as apiRemoveFromWishlist,
  clearWishlist as apiClearWishlist,
  type WishlistItem as ApiWishlistItem,
  type Product as ApiProduct
} from "@/lib/api"
import { useUser } from "./UserContext"

export interface WishlistItem {
  product: Product
}

export interface WishlistContextType {
  items: WishlistItem[]
  loading: boolean
  addItem: (product: Product) => Promise<void>
  removeItem: (productId: number) => Promise<void>
  isInWishlist: (productId: number) => boolean
  getTotalItems: () => number
  clearWishlist: () => Promise<void>
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

// Convert API Product to local Product
function convertApiProductToProduct(apiProduct: ApiProduct): Product {
  const originalPrice = apiProduct.discount > 0 
    ? apiProduct.price / (1 - apiProduct.discount / 100)
    : undefined

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    brand: apiProduct.category?.name,
    price: Number(apiProduct.price),
    originalPrice: originalPrice ? Number(originalPrice.toFixed(2)) : undefined,
    image: apiProduct.primary_image_url || "",
    category: apiProduct.category?.name,
  }
}

// Convert API WishlistItem to local WishlistItem
function convertApiWishlistItemToWishlistItem(apiWishlistItem: ApiWishlistItem): WishlistItem {
  return {
    product: convertApiProductToProduct(apiWishlistItem.product),
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: userLoading } = useUser()
  const [items, setItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load wishlist from API on mount or when auth state changes
  useEffect(() => {
    if (userLoading) return

    if (!isAuthenticated) {
      // If not authenticated, clear wishlist
      setItems([])
      setLoading(false)
      return
    }

    const loadWishlist = async () => {
      try {
        setLoading(true)
        const apiWishlistItems = await apiGetWishlist()
        const convertedItems = apiWishlistItems.map(convertApiWishlistItemToWishlistItem)
        setItems(convertedItems)
      } catch (error) {
        console.error('Failed to load wishlist:', error)
        // On error, keep empty wishlist
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    loadWishlist()
  }, [isAuthenticated, userLoading])

  const addItem = useCallback(async (product: Product) => {
    try {
      // Find the wishlist item ID from API if we need it
      const apiWishlistItem = await apiAddToWishlist(product.id)
      const newItem = convertApiWishlistItemToWishlistItem(apiWishlistItem)
      
      setItems((prevItems) => {
        // Check if product already exists
        if (prevItems.some((item) => item.product.id === product.id)) {
          return prevItems
        }
        return [...prevItems, newItem]
      })
    } catch (error) {
      console.error('Failed to add item to wishlist:', error)
      throw error
    }
  }, [])

  const removeItem = useCallback(async (productId: number) => {
    try {
      // Find the wishlist item ID from API
      const apiWishlistItems = await apiGetWishlist()
      const apiWishlistItem = apiWishlistItems.find(item => item.product_id === productId)
      
      if (apiWishlistItem) {
        await apiRemoveFromWishlist(apiWishlistItem.id)
        setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
      }
    } catch (error) {
      console.error('Failed to remove item from wishlist:', error)
      throw error
    }
  }, [])

  const clearWishlist = useCallback(async () => {
    try {
      await apiClearWishlist()
      setItems([])
    } catch (error) {
      console.error('Failed to clear wishlist:', error)
      throw error
    }
  }, [])

  const isInWishlist = useCallback((productId: number) => {
    return items.some((item) => item.product.id === productId)
  }, [items])

  const getTotalItems = useCallback(() => {
    return items.length
  }, [items])

  const value: WishlistContextType = {
    items,
    loading,
    addItem,
    removeItem,
    isInWishlist,
    getTotalItems,
    clearWishlist,
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
