import type { Product } from "./products"

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clearCart: () => void
  getTotalItems: () => number
  getTotalPrice: () => number
  getItemQuantity: (productId: number) => number
}

// Mock cart data for development
export const mockCartItems: CartItem[] = [
  {
    product: {
      id: 1,
      name: "Rondelle Printed Cotton T-Shirt",
      price: 29.99,
      originalPrice: 39.99,
      image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
      category: "Casual Wear",
    },
    quantity: 2,
  },
  {
    product: {
      id: 2,
      name: "Allen Solly Women Textured Handbag Bag",
      price: 49.99,
      image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
      category: "Women Top",
    },
    quantity: 1,
  },
  {
    product: {
      id: 3,
      name: "Grey Sneakers",
      price: 79.99,
      originalPrice: 99.99,
      image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
      category: "Casual Wear",
    },
    quantity: 1,
  },
]
