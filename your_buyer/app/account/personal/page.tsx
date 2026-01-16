"use client"

import { useState, useEffect } from "react"
import { AccountLayout } from "@/app/components/account/AccountLayout"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/app/components/ui/button"
import { useUser } from "@/app/contexts/UserContext"
import { Pencil, User } from "lucide-react"
import { cn } from "@/lib/utils"

interface FormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  address: string
}

interface FormErrors {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
  address?: string
}

export default function PersonalPage() {
  const { user } = useUser()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    address: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (user) {
      // Якщо є firstName та lastName, використовуємо їх
      // Інакше розбиваємо name на частини
      let firstName = user.firstName || ""
      let lastName = user.lastName || ""
      
      if (!firstName && !lastName && user.name) {
        const nameParts = user.name.trim().split(" ").filter(Boolean)
        firstName = nameParts[0] || ""
        lastName = nameParts.slice(1).join(" ") || ""
      }
      
      setFormData({
        firstName: firstName,
        lastName: lastName,
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
      })
    }
  }, [user])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required"
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters"
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else {
      // Basic phone validation - allows various formats
      const phoneRegex = /^[\d\s()+-]+$/
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = "Please enter a valid phone number"
      } else if (formData.phone.replace(/\D/g, "").length < 10) {
        newErrors.phone = "Phone number must contain at least 10 digits"
      }
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required"
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = "Please enter a valid email address"
      }
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required"
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Address must be at least 5 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Here you would typically update the user data via an API
    console.log("Form submitted:", formData)
    
    setIsSubmitting(false)
    setIsEditing(false)
    
    // Show success message (you can add a toast notification here)
    alert("Profile updated successfully!")
  }

  const handleCancel = () => {
    // Reset form to original user data
    if (user) {
      let firstName = user.firstName || ""
      let lastName = user.lastName || ""
      
      if (!firstName && !lastName && user.name) {
        const nameParts = user.name.trim().split(" ").filter(Boolean)
        firstName = nameParts[0] || ""
        lastName = nameParts.slice(1).join(" ") || ""
      }
      
      setFormData({
        firstName: firstName,
        lastName: lastName,
        phone: user.phone || "",
        email: user.email || "",
        address: user.address || "",
      })
    }
    setErrors({})
    setIsEditing(false)
  }

  const getUserInitials = (name: string | undefined) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"
  }

  return (
    <AccountLayout>
      <div className="rounded-lg border border-[#A4A1AA] bg-white p-6">
        {/* Profile Picture and Edit Button Section */}
        <div className="mb-8 flex items-start gap-6">
          <div className="relative">
            <div className="relative h-24 w-24 overflow-hidden rounded-full bg-black">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <User className="h-12 w-12 text-white" />
                </div>
              )}
            </div>
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-black text-white hover:bg-black/90 transition-colors"
              onClick={() => {
                if (isEditing) {
                  // Handle profile picture upload
                  alert("Profile picture upload functionality would go here")
                }
              }}
              title="Edit profile picture"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="flex items-center">
            <Button
              type="button"
              onClick={() => {
                if (isEditing) {
                  handleCancel()
                } else {
                  setIsEditing(true)
                }
              }}
              className="h-10"
            >
              <Pencil className="h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-black"
              >
                First Name
              </label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                disabled={!isEditing}
                className={cn(
                  "border-black bg-white",
                  !isEditing && "cursor-default",
                  errors.firstName && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.firstName && (
                <p className="mt-1 text-xs text-red-500">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-black"
              >
                Last Name
              </label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                disabled={!isEditing}
                className={cn(
                  "border-black bg-white",
                  !isEditing && "cursor-default",
                  errors.lastName && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.lastName && (
                <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block text-sm font-medium text-black"
              >
                Phone Number
              </label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing}
                className={cn(
                  "border-black bg-white",
                  !isEditing && "cursor-default",
                  errors.phone && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-red-500">{errors.phone}</p>
              )}
            </div>

            {/* Email Address */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-black"
              >
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={!isEditing}
                className={cn(
                  "border-black bg-white",
                  !isEditing && "cursor-default",
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email}</p>
              )}
            </div>

            {/* Address - Full Width */}
            <div className="md:col-span-2">
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-black"
              >
                Address
              </label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing}
                className={cn(
                  "border-black bg-white",
                  !isEditing && "cursor-default",
                  errors.address && "border-red-500 focus-visible:ring-red-500"
                )}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-red-500">{errors.address}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          {isEditing && (
            <div className="mt-6 flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>
    </AccountLayout>
  )
}
