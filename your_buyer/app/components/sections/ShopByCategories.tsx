"use client"

import { Card } from "@/app/components/ui/card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { SafeImage } from "@/app/components/ui/safe-image"

interface Category {
  name: string
  image: string
}

const categories: Category[] = [
  { name: "Casual Wear", image: "https://www.burkerwatches.com/cdn/shop/files/Sophie_petite_gold_white_1.png?v=1767816051" },
  { name: "Women Top", image: "https://www.burkerwatches.com/cdn/shop/files/Sophie_petite_gold_white_1.png?v=1767816051" },
  { name: "Ethnic Wear", image: "https://www.burkerwatches.com/cdn/shop/files/Sophie_petite_gold_white_1.png?v=1767816051" },
  { name: "Kids Wear", image: "https://www.burkerwatches.com/cdn/shop/files/Sophie_petite_gold_white_1.png?v=1767816051" },
]

export const ShopByCategories = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextCategory = () => {
    setCurrentIndex((prev) => (prev + 1) % categories.length)
  }

  const prevCategory = () => {
    setCurrentIndex((prev) => (prev - 1 + categories.length) % categories.length)
  }

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-primary-100 md:text-4xl">
            Shop by Categories
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prevCategory}
              className="rounded-full border border-grey-300 p-2 text-primary-100 transition-colors hover:bg-grey-100"
              aria-label="Previous category"
            >
              <ChevronLeft className="h-5 w-5 text-primary-100" />
            </button>
            <button
              onClick={nextCategory}
              className="rounded-full border border-grey-300 p-2 text-primary-100 transition-colors hover:bg-grey-100"
              aria-label="Next category"
            >
              <ChevronRight className="h-5 w-5 text-primary-100" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((category, index) => (
            <Card
              key={category.name}
              className="group relative overflow-hidden border-0 bg-grey-100 transition-transform hover:scale-105"
            >
              <div className="relative aspect-square w-full">
                <img
                  src={category.image}
                  alt={category.name}
              
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-primary-100/90 to-transparent p-4">
                  <h3 className="text-center font-semibold text-white">
                    {category.name}
                  </h3>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
