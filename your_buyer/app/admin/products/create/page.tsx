"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Textarea } from "@/app/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select"
import { X, Upload, Star } from "lucide-react"
import {
  createProduct,
  getCategories,
  uploadProductImages,
  setPrimaryImage,
  deleteProductImage,
  type ProductRequest,
  type Category,
  type ProductImage,
} from "@/lib/api"

interface ImagePreview {
  file: File
  preview: string
  id: string
}

export default function CreateProductPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [discount, setDiscount] = useState("")
  const [categoryId, setCategoryId] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ImagePreview[]>([])
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0)
  const [createdProductId, setCreatedProductId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories()
        setCategories(cats)
      } catch (err) {
        console.error("Failed to load categories:", err)
      }
    }
    loadCategories()
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const newImages: ImagePreview[] = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
    }))
    setImages((prev) => [...prev, ...newImages])
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => {
      const updated = prev.filter((img) => img.id !== id)
      // Update primary index if needed
      if (primaryImageIndex >= updated.length && updated.length > 0) {
        setPrimaryImageIndex(0)
      } else if (updated.length === 0) {
        setPrimaryImageIndex(0)
      }
      return updated
    })
  }

  const removeUploadedImage = async (imageId: number) => {
    if (!createdProductId) return
    try {
      await deleteProductImage(createdProductId, imageId)
      setUploadedImages((prev) => prev.filter((img) => img.id !== imageId))
    } catch (err) {
      console.error("Failed to delete image:", err)
      alert("Failed to delete image")
    }
  }

  const setPrimary = async (imageId: number) => {
    if (!createdProductId) return
    try {
      await setPrimaryImage(createdProductId, imageId)
      setUploadedImages((prev) =>
        prev.map((img) => ({
          ...img,
          is_primary: img.id === imageId,
        }))
      )
    } catch (err) {
      console.error("Failed to set primary image:", err)
      alert("Failed to set primary image")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setFieldErrors({})

    // Validation
    if (!name.trim()) {
      setFieldErrors({ name: "Name is required" })
      return
    }
    if (!price || parseFloat(price) <= 0) {
      setFieldErrors({ price: "Price must be greater than 0" })
      return
    }

    try {
      setIsSubmitting(true)
      const productData: ProductRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : 0,
        category_id: categoryId ? parseInt(categoryId) : undefined,
      }

      const product = await createProduct(productData)
      setCreatedProductId(product.id)

      // Upload images if any
      if (images.length > 0) {
        setIsUploadingImages(true)
        try {
          const files = images.map((img) => img.file)
          const uploaded = await uploadProductImages(
            product.id,
            files,
            primaryImageIndex
          )
          setUploadedImages(uploaded)
          setImages([])
          setPrimaryImageIndex(0)
        } catch (err: any) {
          console.error("Failed to upload images:", err)
          alert("Product created but failed to upload images: " + (err?.message || "Unknown error"))
        } finally {
          setIsUploadingImages(false)
        }
      }

      // Reset form
      setName("")
      setDescription("")
      setPrice("")
      setDiscount("")
      setCategoryId("")
      setCreatedProductId(null)
      setUploadedImages([])
      alert("Product created successfully!")
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to create product"
      setError(errorMessage)

      if (err?.errors && typeof err.errors === 'object') {
        setFieldErrors(err.errors as Record<string, string>)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  // Cleanup preview URLs
  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview))
    }
  }, [images])

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-100">Create Product</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && Object.keys(fieldErrors).length === 0 && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

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

        {/* Description Field */}
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium text-primary-100">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              if (fieldErrors.description) {
                setFieldErrors((prev) => ({ ...prev, description: undefined }))
              }
            }}
            className={`w-full border ${
              fieldErrors.description ? "border-red-500" : "border-primary-100"
            }`}
            rows={4}
          />
          {fieldErrors.description && (
            <p className="text-sm text-red-600">{fieldErrors.description}</p>
          )}
        </div>

        {/* Price Field */}
        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium text-primary-100">
            Price *
          </label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value)
              if (fieldErrors.price) {
                setFieldErrors((prev) => ({ ...prev, price: undefined }))
              }
            }}
            className={`w-full border ${
              fieldErrors.price ? "border-red-500" : "border-primary-100"
            }`}
            required
          />
          {fieldErrors.price && (
            <p className="text-sm text-red-600">{fieldErrors.price}</p>
          )}
        </div>

        {/* Discount Field */}
        <div className="space-y-2">
          <label htmlFor="discount" className="text-sm font-medium text-primary-100">
            Discount (%)
          </label>
          <Input
            id="discount"
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={discount}
            onChange={(e) => {
              setDiscount(e.target.value)
              if (fieldErrors.discount) {
                setFieldErrors((prev) => ({ ...prev, discount: undefined }))
              }
            }}
            className={`w-full border ${
              fieldErrors.discount ? "border-red-500" : "border-primary-100"
            }`}
          />
          {fieldErrors.discount && (
            <p className="text-sm text-red-600">{fieldErrors.discount}</p>
          )}
        </div>

        {/* Category Field */}
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-primary-100">
            Category
          </label>
          <Select
            value={categoryId || undefined}
            onValueChange={(value) => {
              setCategoryId(value)
              if (fieldErrors.category_id) {
                setFieldErrors((prev) => ({ ...prev, category_id: undefined }))
              }
            }}
          >
            <SelectTrigger
              id="category"
              className={`w-full border ${
                fieldErrors.category_id
                  ? "border-red-500"
                  : "border-primary-100"
              } bg-white`}
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={String(category.id)}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.category_id && (
            <p className="text-sm text-red-600">{fieldErrors.category_id}</p>
          )}
        </div>

        {/* Images Upload Field */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary-100">
            Product Images
          </label>
          <div className="space-y-4">
            {/* Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full gap-2"
              >
                <Upload className="h-4 w-4" />
                Upload Images
              </Button>
              <p className="mt-1 text-xs text-grey-500">
                You can upload multiple images. Click on an image to set it as primary.
              </p>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-grey-300"
                  >
                    <img
                      src={image.preview}
                      alt={`Preview ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(image.id)}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrimaryImageIndex(index)}
                      className={`absolute left-2 top-2 rounded-full p-1 ${
                        primaryImageIndex === index
                          ? "bg-yellow-500 text-white"
                          : "bg-white/80 text-grey-600 opacity-0 transition-opacity group-hover:opacity-100"
                      }`}
                      title="Set as primary"
                    >
                      <Star
                        className={`h-4 w-4 ${
                          primaryImageIndex === index ? "fill-current" : ""
                        }`}
                      />
                    </button>
                    {primaryImageIndex === index && (
                      <div className="absolute bottom-2 left-2 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                        Primary
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Uploaded Images (if product was created) */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-primary-100">
                  Uploaded Images:
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-grey-300"
                    >
                      <img
                        src={`http://localhost:8000/storage/${image.image_path}`}
                        alt={`Product image ${image.id}`}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3C/svg%3E"
                        }}
                      />
                      {image.is_primary && (
                        <div className="absolute left-2 top-2 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                          Primary
                        </div>
                      )}
                      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        {!image.is_primary && (
                          <button
                            type="button"
                            onClick={() => setPrimary(image.id)}
                            className="rounded-full bg-blue-500 p-1 text-white"
                            title="Set as primary"
                          >
                            <Star className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removeUploadedImage(image.id)}
                          className="rounded-full bg-red-500 p-1 text-white"
                          title="Delete"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-primary-100 text-white hover:bg-primary-200 active:bg-primary-300 disabled:opacity-50"
          size="lg"
          disabled={isSubmitting || isUploadingImages}
        >
          {isSubmitting
            ? "Creating..."
            : isUploadingImages
            ? "Uploading Images..."
            : "Create Product"}
        </Button>
      </form>
    </div>
  )
}
