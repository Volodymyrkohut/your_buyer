"use client"

import { useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/app/components/ui/button"
import { Search, Heart, ShoppingBag, ChevronDown, User, LogOut } from "lucide-react"
import Link from "next/link"
import { useCart } from "@/app/contexts/CartContext"
import { useUser } from "@/app/contexts/UserContext"
import { CartDropdown } from "@/app/components/cart/CartDropdown"

export const Header = () => {
  const router = useRouter()
  const pathname = usePathname()
  const { getTotalItems, items } = useCart()
  const { user, isAuthenticated, logout } = useUser()
  const cartItemsCount = getTotalItems()
  const [showCartDropdown, setShowCartDropdown] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const userTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)
  const userButtonRef = useRef<HTMLButtonElement>(null)
  const hasItemsInCart = items.length > 0

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (hasItemsInCart) {
      setShowCartDropdown(true)
    }
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShowCartDropdown(false)
    }, 200)
  }

  const handleUserMouseEnter = () => {
    if (userTimeoutRef.current) {
      clearTimeout(userTimeoutRef.current)
    }
    setShowUserDropdown(true)
  }

  const handleUserMouseLeave = () => {
    userTimeoutRef.current = setTimeout(() => {
      setShowUserDropdown(false)
    }, 200)
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

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserDropdown(false)
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
      // Навіть якщо помилка, перенаправляємо на головну
      setShowUserDropdown(false)
      router.push("/")
    }
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b border-grey-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-primary-100">
          KKrist
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-primary-100 transition-colors hover:text-primary-200"
          >
            Home
          </Link>
          <div className="relative group">
            <Link
              href="/shop"
              className="flex items-center gap-1 text-sm font-medium text-primary-100 transition-colors hover:text-primary-200"
            >
              Shop
              <ChevronDown className="h-4 w-4 text-primary-100" />
            </Link>
            <div className="absolute left-0 top-full mt-2 hidden w-48 rounded-md border border-grey-200 bg-white shadow-lg group-hover:block">
              <div className="py-2">
                <Link
                  href="/shop"
                  className="block px-4 py-2 text-sm text-primary-100 hover:bg-grey-100"
                >
                  All Products
                </Link>
                <Link
                  href="/shop?category=women"
                  className="block px-4 py-2 text-sm text-primary-100 hover:bg-grey-100"
                >
                  Women
                </Link>
                <Link
                  href="/shop?category=men"
                  className="block px-4 py-2 text-sm text-primary-100 hover:bg-grey-100"
                >
                  Men
                </Link>
                <Link
                  href="/shop?category=kids"
                  className="block px-4 py-2 text-sm text-primary-100 hover:bg-grey-100"
                >
                  Kids
                </Link>
              </div>
            </div>
          </div>
          <Link
            href="/our-story"
            className="text-sm font-medium text-primary-100 transition-colors hover:text-primary-200"
          >
            Our Story
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-primary-100 transition-colors hover:text-primary-200"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-primary-100 transition-colors hover:text-primary-200"
          >
            Contact Us
          </Link>
        </nav>

        {/* Right side icons and button */}
        <div className="flex items-center gap-4">
          <button className="hidden p-2 text-primary-100 transition-colors hover:text-primary-200 md:block">
            <Search className="h-5 w-5 text-primary-100" />
          </button>
          <button className="hidden p-2 text-primary-100 transition-colors hover:text-primary-200 md:block">
            <Heart className="h-5 w-5 text-primary-100" />
          </button>
          <div className="relative hidden md:block">
            <Link
              ref={linkRef}
              href="/cart"
              className="relative p-2 text-primary-100 transition-colors hover:text-primary-200"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <ShoppingBag className="h-5 w-5 text-primary-100" />
              {cartItemsCount > 0 && (
                <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary-100 text-xs font-bold text-white">
                  {cartItemsCount > 99 ? "99+" : cartItemsCount}
                </span>
              )}
            </Link>
            {showCartDropdown && hasItemsInCart && (
              <div
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <CartDropdown triggerRef={linkRef} />
              </div>
            )}
          </div>
          {isAuthenticated && user ? (
            <div className="relative hidden md:block">
              <button
                ref={userButtonRef}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-primary-100 transition-colors hover:bg-grey-100"
                onMouseEnter={handleUserMouseEnter}
                onMouseLeave={handleUserMouseLeave}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-white">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    getUserInitials(user.name)
                  )}
                </div>
                <span className="hidden lg:inline">{user.name || "User"}</span>
                <ChevronDown className="h-4 w-4" />
              </button>
              {showUserDropdown && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-md border border-grey-200 bg-white shadow-lg"
                  onMouseEnter={handleUserMouseEnter}
                  onMouseLeave={handleUserMouseLeave}
                >
                  <div className="py-2">
                    <div className="border-b border-grey-200 px-4 py-3">
                      <p className="text-sm font-semibold text-primary-100">{user.name || "User"}</p>
                      <p className="text-xs text-grey-500">{user.email || ""}</p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-primary-100 transition-colors hover:bg-grey-100"
                    >
                      <User className="h-4 w-4" />
                      My Account
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 transition-colors hover:bg-grey-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Link
              href={
                pathname && pathname !== "/" && pathname !== "/login"
                  ? `/login?returnUrl=${encodeURIComponent(pathname)}`
                  : "/login"
              }
            >
              <Button className="hidden md:flex">Login</Button>
            </Link>
          )}
          <button className="p-2 text-primary-100 md:hidden">
            <Search className="h-5 w-5 text-primary-100" />
          </button>
        </div>
      </div>
    </header>
  )
}
