"use client"

import { Card } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { ChevronUp, ChevronDown, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { getCategories, type Category } from "@/lib/api"

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

interface ProductFiltersProps {
  searchQuery?: string
  onSearchChange?: (query: string) => void
  selectedCategoryId?: number
  onCategoryChange?: (categoryId: number | undefined) => void
  priceRange?: [number, number]
  onPriceRangeChange?: (range: [number, number]) => void
}

export const ProductFilters = ({
  searchQuery = "",
  onSearchChange,
  selectedCategoryId,
  onCategoryChange,
  priceRange = [0, 2000],
  onPriceRangeChange,
}: ProductFiltersProps) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([])
  const [selectedColors, setSelectedColors] = useState<string[]>([])

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true)
      try {
        // Try to load categories, but it might require auth
        // For now, we'll catch the error and continue without categories
        const cats = await getCategories()
        setCategories(cats)
      } catch (error) {
        // Categories endpoint might require auth, so we'll continue without them
        console.warn("Could not load categories:", error)
      } finally {
        setLoadingCategories(false)
      }
    }
    loadCategories()
  }, [])

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

  const handleCategoryToggle = (categoryId: number) => {
    if (onCategoryChange) {
      onCategoryChange(selectedCategoryId === categoryId ? undefined : categoryId)
    }
  }

  const handlePriceChange = (index: number, value: number) => {
    if (onPriceRangeChange) {
      const newRange: [number, number] = [...priceRange] as [number, number]
      newRange[index] = value
      onPriceRangeChange(newRange)
    }
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

  return (
    <Card className="border-0 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold text-primary-100">Filters</h2>

      <div className="space-y-6">
        {/* Search */}
        <FilterSection title="Search" defaultOpen={true}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-grey-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="w-full rounded-md border border-grey-300 px-10 py-2 text-sm focus:border-primary-100 focus:outline-none focus:ring-1 focus:ring-primary-100"
            />
          </div>
        </FilterSection>

        {/* Product Categories */}
        {categories.length > 0 && (
          <FilterSection title="Product Categories" defaultOpen={true}>
            <div className="space-y-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex cursor-pointer items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategoryId === category.id}
                      onChange={() => handleCategoryToggle(category.id)}
                      className="h-4 w-4 border-grey-300 text-primary-100"
                    />
                    <span className="text-sm text-grey-600">{category.name}</span>
                  </div>
                </label>
              ))}
              {selectedCategoryId && (
                <button
                  onClick={() => onCategoryChange?.(undefined)}
                  className="mt-2 text-xs text-primary-100 hover:underline"
                >
                  Clear filter
                </button>
              )}
            </div>
          </FilterSection>
        )}

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
