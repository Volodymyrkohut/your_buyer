"use client"

import { useUser } from "@/app/contexts/UserContext"
import {
  User,
  Package,
  Heart,
  MapPin,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

interface MenuItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

interface AccountLayoutProps {
  children: ReactNode
}

export function AccountLayout({ children }: AccountLayoutProps) {
  const { user } = useUser()
  const pathname = usePathname()

  const menuItems: MenuItem[] = [
    { id: "personal", label: "Personal Information", icon: User, href: "/account/personal" },
    { id: "orders", label: "My Orders", icon: Package, href: "/account/orders" },
    { id: "wishlist", label: "My Wishlists", icon: Heart, href: "/account/wishlist" },
    { id: "addresses", label: "Manage Addresses", icon: MapPin, href: "/account/addresses" },
    { id: "cards", label: "Saved Cards", icon: CreditCard, href: "/account/cards" },
    { id: "notifications", label: "Notifications", icon: Bell, href: "/account/notifications" },
    { id: "settings", label: "Settings", icon: Settings, href: "/account/settings" },
  ]

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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Page Title */}
        <h1 className="mb-8 text-3xl font-bold text-primary-100 md:text-4xl">
          My Profile
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Left Sidebar */}
          <aside className="lg:col-span-1">
            {/* User Info and Navigation Card */}
            <div className="rounded-lg border border-[#A4A1AA] bg-white">
              {/* User Info Section */}
              <div className="flex items-center gap-4 p-6">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-black">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-semibold text-white">
                      {getUserInitials(user?.name || "RF")}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-grey-500">
                    Hello 👋
                  </div>
                  <div className="text-lg font-bold text-black">
                    {user?.name || "User"}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-b border-[#A4A1AA]"></div>

              {/* Navigation Menu */}
              <nav className="p-2">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors ${
                        isActive
                          ? "bg-black text-white"
                          : "bg-white text-black hover:bg-grey-100"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? "text-white" : "text-black"}`} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
