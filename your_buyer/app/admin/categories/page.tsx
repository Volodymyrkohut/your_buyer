"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { Search, Edit, Trash2, Plus } from "lucide-react"
import { getCategories, deleteCategory, updateCategory, type Category } from "@/lib/api"

export default function CategoriesPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState("")

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)
      const categoriesData = await getCategories()
      setCategories(categoriesData)
    } catch (err: any) {
      console.error("Failed to load categories:", err)
      setError(err?.message || "Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      return
    }

    try {
      setDeletingId(id)
      await deleteCategory(id)
      setCategories((prev) => prev.filter((c) => c.id !== id))
    } catch (err: any) {
      console.error("Failed to delete category:", err)
      alert("Failed to delete category: " + (err?.message || "Unknown error"))
    } finally {
      setDeletingId(null)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
  }

  const handleSaveEdit = async (id: number) => {
    if (!editName.trim()) {
      alert("Name cannot be empty")
      return
    }

    try {
      const updated = await updateCategory(id, { name: editName.trim() })
      setCategories((prev) =>
        prev.map((c) => (c.id === id ? updated : c))
      )
      setEditingId(null)
      setEditName("")
    } catch (err: any) {
      console.error("Failed to update category:", err)
      alert("Failed to update category: " + (err?.message || "Unknown error"))
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName("")
  }

  const filteredCategories = categories.filter((category) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      category.name.toLowerCase().includes(searchLower) ||
      String(category.id).includes(searchLower)
    )
  })

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"
    try {
      return new Date(dateString).toLocaleDateString("uk-UA", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    } catch {
      return dateString
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary-100">Categories</h2>
        <Link href="/admin/categories/create">
          <Button className="bg-primary-100 text-white hover:bg-primary-200">
            <Plus className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-grey-400" />
          <Input
            type="text"
            placeholder="Search categories by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="rounded-lg border border-[#F0F0F0] bg-white p-8 text-center">
          <p className="text-grey-600">Loading categories...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Categories List */}
      {!loading && !error && (
        <div className="space-y-0">
          {filteredCategories.length === 0 ? (
            <div className="rounded-lg border border-[#F0F0F0] bg-white p-8 text-center">
              <p className="text-grey-600">
                {searchQuery ? "No categories found matching your search" : "No categories found"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#F0F0F0] bg-grey-50">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      ID
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Created
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-primary-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category, index) => (
                    <tr
                      key={category.id}
                      className={`border-b border-[#F0F0F0] ${
                        index % 2 === 0 ? "bg-white" : "bg-grey-50"
                      } hover:bg-grey-100`}
                    >
                      <td className="px-4 py-3 text-sm text-grey-700">{category.id}</td>
                      <td className="px-4 py-3">
                        {editingId === category.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSaveEdit(category.id)
                                } else if (e.key === "Escape") {
                                  handleCancelEdit()
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(category.id)}
                              className="bg-primary-100 text-white hover:bg-primary-200"
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="text-grey-600 hover:bg-grey-200"
                            >
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="font-medium text-primary-100">{category.name}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-grey-700">
                        {formatDate(category.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === category.id ? (
                          <div className="text-xs text-grey-500">Editing...</div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(category)}
                              className="h-8 w-8 p-0 hover:bg-grey-200"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category.id)}
                              disabled={deletingId === category.id}
                              className="h-8 w-8 p-0 text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Categories Count */}
      {!loading && !error && (
        <div className="mt-4 text-sm text-grey-600">
          Showing {filteredCategories.length} of {categories.length} categories
        </div>
      )}
    </div>
  )
}
