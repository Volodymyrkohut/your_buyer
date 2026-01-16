"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "@/app/components/products/ProductCard"
import type { Product } from "@/lib/products"
import { ProductFilters } from "@/app/components/products/ProductFilters"
import { ProductSort, SortOption } from "@/app/components/products/ProductSort"
import { Pagination } from "@/app/components/products/Pagination"
import { allProducts } from "@/lib/products"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

const PRODUCTS_PER_PAGE = 16

export default function ShopPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortOption, setSortOption] = useState<SortOption>("default")
  const [currentPage, setCurrentPage] = useState(1)

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let products = [...allProducts]

    // Apply sorting
    switch (sortOption) {
      case "price-low":
        products.sort((a, b) => a.price - b.price)
        break
      case "price-high":
        products.sort((a, b) => b.price - a.price)
        break
      case "name-asc":
        products.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "name-desc":
        products.sort((a, b) => b.name.localeCompare(a.name))
        break
      default:
        break
    }

    return products
  }, [sortOption])

  // Paginate products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredAndSortedProducts.slice(
      startIndex,
      startIndex + PRODUCTS_PER_PAGE
    )
  }, [filteredAndSortedProducts, currentPage])

  const totalPages = Math.ceil(
    filteredAndSortedProducts.length / PRODUCTS_PER_PAGE
  )

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
              <ProductFilters />
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
                totalProducts={filteredAndSortedProducts.length}
                currentPage={currentPage}
                productsPerPage={PRODUCTS_PER_PAGE}
              />
            </div>

            {/* Products Grid/List */}
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-6"
              }
            >
              {paginatedProducts.map((product) => (
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
          </div>
        </div>
      </div>
    </div>
  )
}
