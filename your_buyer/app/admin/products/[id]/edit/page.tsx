"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
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
  getProductById,
  updateProduct,
  getCategories,
  uploadProductImages,
  setPrimaryImage,
  deleteProductImage,
  type ProductRequest,
  type Category,
  type ProductImage,
  type Product,
} from "@/lib/api"

interface ImagePreview {
  file: File
  preview: string
  id: string
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = parseInt(params.id as string)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [product, setProduct] = useState<Product | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [discount, setDiscount] = useState("")
  const [status, setStatus] = useState<"in_stock" | "out_of_stock">("in_stock")
  const [categoryId, setCategoryId] = useState<string>("")
  const [categories, setCategories] = useState<Category[]>([])
  const [images, setImages] = useState<ImagePreview[]>([])
  const [uploadedImages, setUploadedImages] = useState<ProductImage[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUploadingImages, setIsUploadingImages] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [productData, categoriesData] = await Promise.all([
          getProductById(productId),
          getCategories(),
        ])
        
        setProduct(productData)
        setCategories(categoriesData)
        
        // Fill form with product data
        setName(productData.name || "")
        setDescription(productData.description || "")
        setPrice(productData.price.toString() || "")
        setDiscount(productData.discount?.toString() || "0")
        setStatus(productData.status || "in_stock")
        setCategoryId(productData.category_id?.toString() || "")
        
        // Set existing images
        if (productData.images) {
          setUploadedImages(productData.images)
          const primaryIndex = productData.images.findIndex((img) => img.is_primary)
          if (primaryIndex >= 0) {
            setPrimaryImageIndex(primaryIndex)
          }
        }
      } catch (err: any) {
        console.error("Failed to load product:", err)
        setError(err?.message || "Failed to load product")
        if (err?.message?.includes("404") || err?.message?.includes("not found")) {
          router.push("/admin/products")
        }
      } finally {
        setLoading(false)
      }
    }
    
    if (productId) {
      loadData()
    }
  }, [productId, router])

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
      if (primaryImageIndex >= uploadedImages.length + updated.length && updated.length > 0) {
        setPrimaryImageIndex(0)
      } else if (uploadedImages.length === 0 && updated.length === 0) {
        setPrimaryImageIndex(0)
      }
      return updated
    })
  }

  const removeUploadedImage = async (imageId: number) => {
    if (!productId) return
    try {
      await deleteProductImage(productId, imageId)
      setUploadedImages((prev) => {
        const updated = prev.filter((img) => img.id !== imageId)
        // Update primary index if needed
        if (primaryImageIndex >= updated.length && updated.length > 0) {
          setPrimaryImageIndex(0)
        }
        return updated
      })
    } catch (err) {
      console.error("Failed to delete image:", err)
      alert("Failed to delete image")
    }
  }

  const setPrimary = async (imageId: number) => {
    if (!productId) return
    try {
      await setPrimaryImage(productId, imageId)
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

  const setPrimaryForNewImage = (index: number) => {
    setPrimaryImageIndex(uploadedImages.length + index)
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
      const productData: Partial<ProductRequest> = {
        name: name.trim(),
        description: description.trim() || undefined,
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : 0,
        status: status,
        category_id: categoryId ? parseInt(categoryId) : undefined,
      }

      await updateProduct(productId, productData)

      // Upload new images if any
      if (images.length > 0) {
        setIsUploadingImages(true)
        try {
          const files = images.map((img) => img.file)
          const primaryIdx = primaryImageIndex >= uploadedImages.length 
            ? primaryImageIndex - uploadedImages.length 
            : undefined
          const uploaded = await uploadProductImages(productId, files, primaryIdx)
          setUploadedImages((prev) => [...prev, ...uploaded])
          setImages([])
          setPrimaryImageIndex(uploadedImages.length)
        } catch (err: any) {
          console.error("Failed to upload images:", err)
          alert("Product updated but failed to upload images: " + (err?.message || "Unknown error"))
        } finally {
          setIsUploadingImages(false)
        }
      }

      alert("Product updated successfully!")
      router.push("/admin/products")
    } catch (err: any) {
      const errorMessage = err?.message || "Failed to update product"
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

  const getImageUrl = (imagePath: string) => {
    return `http://localhost:8000/storage/${imagePath}`
  }

  if (loading) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-primary-100">Edit Product</h2>
        <div className="rounded-lg border border-[#F0F0F0] bg-white p-8 text-center">
          <p className="text-grey-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div>
        <h2 className="mb-6 text-2xl font-bold text-primary-100">Edit Product</h2>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold text-primary-100">Edit Product</h2>

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

        {/* Status Field */}
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-primary-100">
            Status
          </label>
          <Select
            value={status}
            onValueChange={(value: "in_stock" | "out_of_stock") => {
              setStatus(value)
            }}
          >
            <SelectTrigger
              id="status"
              className="w-full border border-primary-100 bg-white"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="in_stock">In Stock</SelectItem>
              <SelectItem value="out_of_stock">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
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

        {/* Images Section */}
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
                Upload New Images
              </Button>
              <p className="mt-1 text-xs text-grey-500">
                You can upload multiple images. Click on an image to set it as primary.
              </p>
            </div>

            {/* Existing Images */}
            {uploadedImages.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-primary-100">
                  Existing Images:
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {uploadedImages.map((image) => (
                    <div
                      key={image.id}
                      className="group relative aspect-square overflow-hidden rounded-lg border border-grey-300"
                    >
                      <img
                        src={getImageUrl(image.image_path)}
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

            {/* New Image Previews */}
            {images.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-primary-100">
                  New Images (to be uploaded):
                </p>
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {images.map((image, index) => {
                    const totalIndex = uploadedImages.length + index
                    const isPrimary = primaryImageIndex === totalIndex
                    return (
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
                          onClick={() => setPrimaryForNewImage(index)}
                          className={`absolute left-2 top-2 rounded-full p-1 ${
                            isPrimary
                              ? "bg-yellow-500 text-white"
                              : "bg-white/80 text-grey-600 opacity-0 transition-opacity group-hover:opacity-100"
                          }`}
                          title="Set as primary"
                        >
                          <Star
                            className={`h-4 w-4 ${isPrimary ? "fill-current" : ""}`}
                          />
                        </button>
                        {isPrimary && (
                          <div className="absolute bottom-2 left-2 rounded bg-yellow-500 px-2 py-1 text-xs font-medium text-white">
                            Primary
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-primary-100 text-white hover:bg-primary-200 active:bg-primary-300 disabled:opacity-50"
            size="lg"
            disabled={isSubmitting || isUploadingImages}
          >
            {isSubmitting
              ? "Updating..."
              : isUploadingImages
              ? "Uploading Images..."
              : "Update Product"}
          </Button>
        </div>
      </form>
    </div>
  )
}
