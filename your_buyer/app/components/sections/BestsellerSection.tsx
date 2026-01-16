"use client"

import { ProductCard } from "@/app/components/products/ProductCard"
import { allProducts } from "@/lib/products"

export const BestsellerSection = () => {
  // Get first 8 products as bestsellers
  const bestsellerProducts = allProducts.slice(0, 8)

  return (
    <section className="bg-grey-50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold text-primary-100 md:text-4xl">
          Our Bestseller
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {bestsellerProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}
