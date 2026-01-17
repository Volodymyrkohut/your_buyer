"use client"

import { useState, useEffect, useRef } from "react"
import { ProductCard } from "@/app/components/products/ProductCard"
import { ProductFilters } from "@/app/components/products/ProductFilters"
import { ProductSort, SortOption } from "@/app/components/products/ProductSort"
import { Pagination } from "@/app/components/products/Pagination"
import { getProductsList, type Product as ApiProduct, type ProductsListParams } from "@/lib/api"
import { ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Product } from "@/lib/products"

const PRODUCTS_PER_PAGE = 16

// Convert API Product to ProductCard Product
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

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortOption, setSortOption] = useState<SortOption>("default")
  const [currentPage, setCurrentPage] = useState(1)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000])

  // Map sort option to API sort parameter
  const getApiSortParam = (sort: SortOption): ProductsListParams['sort'] => {
    switch (sort) {
      case "price-low":
        return "price_asc"
      case "price-high":
        return "price_desc"
      case "name-asc":
        return "name_asc"
      case "name-desc":
        return "name_desc"
      default:
        return "default"
    }
  }

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const params: ProductsListParams = {
          page: currentPage,
          per_page: PRODUCTS_PER_PAGE,
          sort: getApiSortParam(sortOption),
        }

        if (searchQuery) {
          params.search = searchQuery
        }

        if (selectedCategoryId) {
          params.category_id = selectedCategoryId
        }

        if (priceRange[0] > 0) {
          params.min_price = priceRange[0]
        }

        if (priceRange[1] < 2000) {
          params.max_price = priceRange[1]
        }

        const response = await getProductsList(params)
        
        const convertedProducts = response.data.products.map(convertApiProductToProduct)
        setProducts(convertedProducts)
        setTotalPages(response.data.pagination.last_page)
        setTotalProducts(response.data.pagination.total)
      } catch (err: any) {
        setError(err.message || "Failed to load products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage, sortOption, searchQuery, selectedCategoryId, priceRange])

  // Reset to page 1 when filters change (but not when page changes)
  const prevFiltersRef = useRef({ searchQuery, selectedCategoryId, priceRange, sortOption })
  useEffect(() => {
    const prevFilters = prevFiltersRef.current
    const filtersChanged = 
      prevFilters.searchQuery !== searchQuery ||
      prevFilters.selectedCategoryId !== selectedCategoryId ||
      prevFilters.priceRange[0] !== priceRange[0] ||
      prevFilters.priceRange[1] !== priceRange[1] ||
      prevFilters.sortOption !== sortOption
    
    if (filtersChanged && currentPage !== 1) {
      setCurrentPage(1)
    }
    
    prevFiltersRef.current = { searchQuery, selectedCategoryId, priceRange, sortOption }
  }, [searchQuery, selectedCategoryId, priceRange, sortOption, currentPage])

  return (
    <div className="min-h-screen bg-grey-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-grey-600">
          <Link href="/shop" className="hover:text-primary-100">
            Shop
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-primary-100">All Products</span>
        </nav>


        {/* Main Content */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <ProductFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                selectedCategoryId={selectedCategoryId}
                onCategoryChange={setSelectedCategoryId}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
              />
            </div>
          </aside>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Sort and View Controls */}
            <div className="mb-6">
              <ProductSort
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                sortOption={sortOption}
                onSortChange={setSortOption}
                totalProducts={totalProducts}
                currentPage={currentPage}
                productsPerPage={PRODUCTS_PER_PAGE}
              />
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-grey-600">Loading products...</div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-red-600">Error: {error}</div>
              </div>
            )}

            {/* Products Grid/List */}
            {!loading && !error && (
              <>
                {products.length === 0 ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-grey-600">No products found</div>
                  </div>
                ) : (
                  <>
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-6"
              }
            >
                      {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
