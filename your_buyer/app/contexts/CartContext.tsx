"use client"

import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import type { Product } from "@/lib/products"
import type { CartItem, CartContextType } from "@/lib/cart"
import { 
  addToCart as apiAddToCart, 
  getCart as apiGetCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
  clearCart as apiClearCart,
  type CartItem as ApiCartItem,
  type Product as ApiProduct
} from "@/lib/api"
import { useUser } from "./UserContext"

const CartContext = createContext<CartContextType | undefined>(undefined)

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

// Convert API CartItem to local CartItem
function convertApiCartItemToCartItem(apiCartItem: ApiCartItem): CartItem {
  return {
    product: convertApiProductToProduct(apiCartItem.product),
    quantity: apiCartItem.quantity,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: userLoading } = useUser()
  const [items, setItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  // Load cart from API on mount or when auth state changes
  useEffect(() => {
    if (userLoading) return

    const loadCart = async () => {
      try {
        setLoading(true)
        const apiCartItems = await apiGetCart()
        const convertedItems = apiCartItems.map(convertApiCartItemToCartItem)
        setItems(convertedItems)
      } catch (error) {
        console.error('Failed to load cart:', error)
        // On error, keep empty cart
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [isAuthenticated, userLoading])

  const addItem = useCallback(async (product: Product, quantity: number = 1) => {
    try {
      const apiCartItem = await apiAddToCart(product.id, quantity)
      const newItem = convertApiCartItemToCartItem(apiCartItem)
      
      setItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.product.id === product.id)
        
        if (existingItem) {
          return prevItems.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: newItem.quantity }
              : item
          )
        }
        
        return [...prevItems, newItem]
      })
    } catch (error) {
      console.error('Failed to add item to cart:', error)
      throw error
    }
  }, [])

  const removeItem = useCallback(async (productId: number) => {
    try {
      // Find the cart item ID from API
      const apiCartItems = await apiGetCart()
      const apiCartItem = apiCartItems.find(item => item.product_id === productId)
      
      if (apiCartItem) {
        await apiRemoveCartItem(apiCartItem.id)
        setItems((prevItems) => prevItems.filter((item) => item.product.id !== productId))
      }
    } catch (error) {
      console.error('Failed to remove item from cart:', error)
      throw error
    }
  }, [])

  const updateQuantity = useCallback(async (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }
    
    try {
      // Find the cart item ID from API
      const apiCartItems = await apiGetCart()
      const apiCartItem = apiCartItems.find(item => item.product_id === productId)
      
      if (apiCartItem) {
        const updatedApiCartItem = await apiUpdateCartItem(apiCartItem.id, quantity)
        const updatedItem = convertApiCartItemToCartItem(updatedApiCartItem)
        
        setItems((prevItems) =>
          prevItems.map((item) =>
            item.product.id === productId ? updatedItem : item
          )
        )
      }
    } catch (error) {
      console.error('Failed to update cart item quantity:', error)
      throw error
    }
  }, [removeItem])

  const clearCart = useCallback(async () => {
    try {
      await apiClearCart()
      setItems([])
    } catch (error) {
      console.error('Failed to clear cart:', error)
      throw error
    }
  }, [])

  const getTotalItems = useCallback(() => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }, [items])

  const getTotalPrice = useCallback(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  }, [items])

  const getItemQuantity = useCallback((productId: number) => {
    const item = items.find((item) => item.product.id === productId)
    return item?.quantity || 0
  }, [items])

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalItems,
    getTotalPrice,
    getItemQuantity,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
