"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Search, Edit, Trash2, Plus, Image as ImageIcon } from "lucide-react"
import { getProducts, deleteProduct, type Product } from "@/lib/api"

export default function ProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const productsData = await getProducts()
      setProducts(productsData)
    } catch (err: any) {
      console.error("Failed to load products:", err)
      setError(err?.message || "Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      return
    }

    try {
      setDeletingId(id)
      await deleteProduct(id)
      setProducts((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      console.error("Failed to delete product:", err)
      alert("Failed to delete product: " + (err?.message || "Unknown error"))
    } finally {
      setDeletingId(null)
    }
  }

  const filteredProducts = products.filter((product) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description?.toLowerCase().includes(searchLower) ||
      String(product.id).includes(searchLower) ||
      product.category?.name.toLowerCase().includes(searchLower)
    )
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency: "UAH",
    }).format(price)
  }

  const getImageUrl = (product: Product) => {
    if (product.primary_image_url) return product.primary_image_url
    if (product.images && product.images.length > 0) {
      const primaryImage = product.images.find((img) => img.is_primary)
      if (primaryImage?.image_path) {
        return `http://localhost:5000/storage/${primaryImage.image_path}`
      }
      if (product.images[0]?.image_path) {
        return `http://localhost:5000/storage/${product.images[0].image_path}`
      }
    }
    return null
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-100">Products</h2>
        <Link href="/admin/products/create">
          <Button className="bg-primary-100 text-white hover:bg-primary-200">
            <Plus className="mr-2 h-4 w-4" />
            Create Product
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-grey-400" />
          <Input
            type="text"
            placeholder="Search products by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-lg border border-[#F0F0F0] bg-white p-8 text-center">
          <p className="text-grey-600">Loading products...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Products List */}
      {!loading && !error && (
        <div className="space-y-0">
          {filteredProducts.length === 0 ? (
            <div className="rounded-lg border border-[#F0F0F0] bg-white p-8 text-center">
              <p className="text-grey-600">
                {searchQuery ? "No products found matching your search" : "No products found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F0F0] bg-grey-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Image
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Category
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Price
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => {
                    const imageUrl = getImageUrl(product)
                    return (
                      <tr
                        key={product.id}
                        className={`border-b border-[#F0F0F0] ${
                          index % 2 === 0 ? "bg-white" : "bg-grey-50"
                        } hover:bg-grey-100`}
                      >
                        <td className="px-4 py-3">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={product.name}
                              className="h-16 w-16 rounded object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 items-center justify-center rounded bg-grey-200">
                              <ImageIcon className="h-6 w-6 text-grey-400" />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-primary-100">{product.name}</div>
                          {product.description && (
                            <div className="mt-1 text-xs text-grey-600 line-clamp-2">
                              {product.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-grey-700">
                          {product.category?.name || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-grey-700">
                          {formatPrice(product.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-grey-700">
                          {product.discount > 0 ? `${product.discount}%` : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
                              product.status === "in_stock"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.status === "in_stock" ? "In Stock" : "Out of Stock"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                              className="h-8 w-8 p-0 hover:bg-grey-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(product.id)}
                              disabled={deletingId === product.id}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Products Count */}
      {!loading && !error && (
        <div className="mt-4 text-sm text-grey-600">
          Showing {filteredProducts.length} of {products.length} products
        </div>
      )}
    </div>
  )
}
