"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { Grid3x3, List } from "lucide-react"
import { Button } from "@/app/components/ui/button"

export type ViewMode = "grid" | "list"
export type SortOption = "default" | "price-low" | "price-high" | "name-asc" | "name-desc"

interface ProductSortProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
  sortOption: SortOption
  onSortChange: (option: SortOption) => void
  totalProducts: number
  currentPage: number
  productsPerPage: number
}

export const ProductSort = ({
  viewMode,
  onViewModeChange,
  sortOption,
  onSortChange,
  totalProducts,
  currentPage,
  productsPerPage,
}: ProductSortProps) => {
  const startIndex = (currentPage - 1) * productsPerPage + 1
  const endIndex = Math.min(currentPage * productsPerPage, totalProducts)

  const sortLabels: Record<SortOption, string> = {
    default: "Shot by latest",
    "price-low": "Price: Low to High",
    "price-high": "Price: High to Low",
    "name-asc": "Name: A to Z",
    "name-desc": "Name: Z to A",
  }

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-4">
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 rounded-md border border-grey-300 p-1">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("grid")}
            className="h-8 w-8 p-0"
          >
            <Grid3x3
              className={`h-4 w-4 ${
                viewMode === "grid" ? "text-white" : "text-primary-100"
              }`}
            />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => onViewModeChange("list")}
            className="h-8 w-8 p-0"
          >
            <List
              className={`h-4 w-4 ${
                viewMode === "list" ? "text-white" : "text-primary-100"
              }`}
            />
          </Button>
        </div>

        {/* Result Count */}
        <span className="text-sm text-grey-600">
          Showing {startIndex}-{endIndex} of {totalProducts} results
        </span>
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2">
        <Select
          value={sortOption}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue>{sortLabels[sortOption]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Shot by latest</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name-asc">Name: A to Z</SelectItem>
            <SelectItem value="name-desc">Name: Z to A</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
