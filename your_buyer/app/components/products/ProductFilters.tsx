"use client"

import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { ChevronUp, ChevronDown } from "lucide-react"
import { useState } from "react"

interface FilterSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

const FilterSection = ({ title, children, defaultOpen = true }: FilterSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="border-b border-grey-200 pb-6 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mb-4 flex w-full items-center justify-between font-semibold text-primary-100"
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      {isOpen && children}
    </div>
  )
}

export const ProductFilters = () => {
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  const categories = [
    { name: "Men", count: 0 },
    { name: "Women", count: 0 },
    { name: "Kids", count: 0 },
    { name: "Bags", count: 0 },
    { name: "Belts", count: 0 },
    { name: "Wallets", count: 0 },
    { name: "Watches", count: 0 },
    { name: "Accessories", count: 0 },
    { name: "Winter Wear", count: 0 },
  ]
  const sizes = [
    { name: "S", count: 6 },
    { name: "M", count: 20 },
    { name: "L", count: 7 },
    { name: "XL", count: 16 },
    { name: "XXL", count: 5 },
  ]
  const colors = [
    { name: "Red", value: "#FF0000", count: 10 },
    { name: "Blue", value: "#0000FF", count: 14 },
    { name: "Orange", value: "#FFA500", count: 8 },
    { name: "Black", value: "#000000", count: 9 },
    { name: "Green", value: "#00FF00", count: 4 },
    { name: "Yellow", value: "#FFFF00", count: 2 },
  ]

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    )
  }

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    )
  }

  const handlePriceChange = (index: number, value: number) => {
    const newRange = [...priceRange]
    newRange[index] = value
    setPriceRange(newRange)
  }

  return (
    <Card className="border-0 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-primary-100">Filters</h2>

      <div className="space-y-6">
        {/* Product Categories */}
        <FilterSection title="Product Categories" defaultOpen={true}>
          <div className="space-y-2">
            {categories.map((category) => (
              <label
                key={category.name}
                className="flex cursor-pointer items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.name)}
                    onChange={() => toggleCategory(category.name)}
                    className="h-4 w-4 rounded border-grey-300 text-primary-100"
                  />
                  <span className="text-sm text-grey-600">{category.name}</span>
                </div>
                {category.count > 0 && (
                  <span className="text-xs text-grey-400">({category.count})</span>
                )}
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Filter by Price */}
        <FilterSection title="Filter by Price" defaultOpen={true}>
          <div className="space-y-4">
            <div className="text-sm text-grey-600">
              Price: ${priceRange[0]} - ${priceRange[1]}
            </div>
            <div className="relative h-2 w-full">
              <div className="absolute h-2 w-full rounded-full bg-grey-200"></div>
              <div
                className="absolute h-2 rounded-full bg-primary-100"
                style={{
                  left: `${(priceRange[0] / 2000) * 100}%`,
                  width: `${((priceRange[1] - priceRange[0]) / 2000) * 100}%`,
                }}
              ></div>
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={priceRange[0]}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (val <= priceRange[1]) {
                    handlePriceChange(0, val)
                  }
                }}
                className="absolute top-0 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-100 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-100 [&::-moz-range-thumb]:border-0"
              />
              <input
                type="range"
                min="0"
                max="2000"
                step="10"
                value={priceRange[1]}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (val >= priceRange[0]) {
                    handlePriceChange(1, val)
                  }
                }}
                className="absolute top-0 h-2 w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary-100 [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary-100 [&::-moz-range-thumb]:border-0"
              />
            </div>
          </div>
        </FilterSection>

        {/* Filter by Color */}
        <FilterSection title="Filter by Color" defaultOpen={true}>
          <div className="space-y-2">
            {colors.map((color) => (
              <label
                key={color.name}
                className="flex cursor-pointer items-center justify-between gap-2"
                onClick={() => toggleColor(color.name)}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`h-4 w-4 rounded border-2 ${
                      selectedColors.includes(color.name)
                        ? "border-primary-100"
                        : "border-grey-300"
                    }`}
                    style={{ backgroundColor: color.value }}
                  />
                  <span className="text-sm text-grey-600">{color.name}</span>
                </div>
                <span className="text-xs text-grey-400">({color.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>

        {/* Filter by Size */}
        <FilterSection title="Filter by Size" defaultOpen={true}>
          <div className="space-y-2">
            {sizes.map((size) => (
              <label
                key={size.name}
                className="flex cursor-pointer items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size.name)}
                    onChange={() => toggleSize(size.name)}
                    className="h-4 w-4 rounded border-grey-300 text-primary-100"
                  />
                  <span className="text-sm text-grey-600">{size.name}</span>
                </div>
                <span className="text-xs text-grey-400">({size.count})</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>
    </Card>
  )
}
