// Product type definition
export interface Product {
  id: number
  name: string
  brand?: string
  price: number
  originalPrice?: number
  image: string
  category?: string
}

// Mock products data - in production, this would come from an API or database
export const allProducts: Product[] = [
  {
    id: 1,
    name: "Polo Collar T-Shirt",
    brand: "Louis Philippe Sport",
    price: 50.00,
    originalPrice: 55.00,
    image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
    category: "Men",
  },
  {
    id: 2,
    name: "Women Textured Handheld Bag",
    brand: "Allen Solly",
    price: 80.00,
    originalPrice: 100.00,
    image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
    category: "Bags",
  },
  {
    id: 3,
    name: "Men adi-dash Running Shoes",
    brand: "Adidas",
    price: 60.00,
    originalPrice: 75.00,
    image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
    category: "Men",
  },
  {
    id: 4,
    name: "T-Shirt",
    brand: "Roadstar",
    price: 50.00,
    originalPrice: 55.00,
    image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
    category: "Women",
  },
  {
    id: 5,
    name: "Short Sleeve Shirt",
    brand: "US Polo",
    price: 50.00,
    originalPrice: 55.00,
    image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
    category: "Men",
  },
  {
    id: 6,
    name: "High Heel Sandals",
    brand: "Zyla",
    price: 50.00,
    originalPrice: 55.00,
    image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
    category: "Women",
  },
  {
    id: 7,
    name: "High Heel Sandals",
    brand: "Zyla",
    price: 50.00,
    originalPrice: 55.00,
    image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
    category: "Women",
  },
  {
    id: 8,
    name: "Leopard Print Handbag",
    brand: "Allen Solly",
    price: 54.99,
    image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
    category: "Bags",
  },
  ...Array.from({ length: 64 }, (_, i) => {
    const brands = ["Allen Solly", "Louis Philippe Sport", "Adidas", "Roadstar", "US Polo", "Zyla", "Nike", "Puma"]
    const categories = ["Men", "Women", "Kids", "Bags", "Belts", "Wallets", "Watches", "Accessories"]
    const productNames = [
      "T-Shirt", "Shirt", "Dress", "Shoes", "Handbag", "Belt", "Wallet", "Watch",
      "Jacket", "Jeans", "Sweater", "Skirt", "Sneakers", "Boots", "Sandals", "Sunglasses"
    ]
    return {
      id: 9 + i,
      name: `${productNames[i % productNames.length]} ${i + 1}`,
      brand: brands[i % brands.length],
      price: 30 + (i % 20) * 5,
      originalPrice: 40 + (i % 20) * 5,
      image: "https://d3k81ch9hvuctc.cloudfront.net/company/Yf2Qca/images/b51365b1-4932-4dcd-a560-f53f66845845.jpeg",
      category: categories[i % categories.length],
    }
  }),
]

// Extended product type for detail page
export interface ProductDetail extends Product {
  description?: string
  images?: string[]
  sizes?: string[]
  colors?: string[]
  inStock?: boolean
  sku?: string
}

// Generate slug from product name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

// Get product by slug
export function getProductBySlug(slug: string): ProductDetail | undefined {
  const product = allProducts.find(
    (p) => generateSlug(p.name) === slug
  )

  if (!product) return undefined

  // Extend with detail page data
  return {
    ...product,
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
    images: [
      product.image,
      product.image,
      product.image,
      product.image,
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Black", "White", "Grey", "Navy"],
    inStock: true,
    sku: `SKU-${product.id.toString().padStart(4, "0")}`,
  }
}

// Get related products (same category, excluding current product)
export function getRelatedProducts(
  currentProductId: number,
  limit: number = 4
): Product[] {
  const currentProduct = allProducts.find((p) => p.id === currentProductId)
  if (!currentProduct) return []

  return allProducts
    .filter(
      (p) =>
        p.id !== currentProductId &&
        p.category === currentProduct.category
    )
    .slice(0, limit)
}
