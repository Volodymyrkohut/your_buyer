"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { createCategory, type CategoryRequest } from "@/lib/api"

export default function CreateCategoryPage() {
  const router = useRouter()
  const [id, setId] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validation
    if (!id.trim()) {
      setFieldErrors({ id: "ID is required" })
      return
    }
    if (!/^\d+$/.test(id.trim())) {
      setFieldErrors({ id: "ID must be a number" })
      return
    }
    if (!name.trim()) {
      setFieldErrors({ name: "Name is required" })
      return
    }

    try {
      setIsSubmitting(true)
      const categoryData: CategoryRequest = {
        id: parseInt(id.trim()),
        name: name.trim(),
      }

      await createCategory(categoryData)
      router.push("/admin/categories/create")
      // Reset form
      setId("")
      setName("")
      alert("Category created successfully!")
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create category"
      setError(errorMessage)

      if (err?.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors as Record<string, string>)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-100">Create Category</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && Object.keys(fieldErrors).length === 0 && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* ID Field */}
        <div className="space-y-2">
          <label htmlFor="id" className="text-sm font-medium text-primary-100">
            ID *
          </label>
          <Input
            id="id"
            type="text"
            value={id}
            onChange={(e) => {
              setId(e.target.value)
              if (fieldErrors.id) {
                setFieldErrors((prev) => ({ ...prev, id: undefined }))
              }
            }}
            className={`w-full border ${
              fieldErrors.id ? "border-red-500" : "border-primary-100"
            }`}
            placeholder="Enter category ID (number)"
            required
          />
          {fieldErrors.id && (
            <p className="text-sm text-red-600">{fieldErrors.id}</p>
          )}
        </div>

        {/* Name Field */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium text-primary-100">
            Name *
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (fieldErrors.name) {
                setFieldErrors((prev) => ({ ...prev, name: undefined }))
              }
            }}
            className={`w-full border ${
              fieldErrors.name ? "border-red-500" : "border-primary-100"
            }`}
            required
          />
          {fieldErrors.name && (
            <p className="text-sm text-red-600">{fieldErrors.name}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary-100 text-white hover:bg-primary-200 active:bg-primary-300 disabled:opacity-50"
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Category"}
        </Button>
      </form>
    </div>
  )
}
