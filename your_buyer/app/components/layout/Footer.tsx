"use client"

import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { ArrowRight, Facebook, Instagram, Twitter, Phone, Mail, MapPin } from "lucide-react"
import Link from "next/link"

export const Footer = () => {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Company Info */}
          <div>
            <h3 className="mb-4 text-2xl font-bold">Krist</h3>
            <div className="space-y-3 text-sm text-white">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>(704) 555-0127</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>krist@example.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>3891 Ranchview Dr. Richardson, California 62639</span>
              </div>
            </div>
          </div>

          {/* Information Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Information</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/my-account"
                  className="text-white transition-colors hover:text-white/80"
                >
                  My Account
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-white transition-colors hover:text-white/80"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/cart"
                  className="text-white transition-colors hover:text-white/80"
                >
                  My Cart
                </Link>
              </li>
              <li>
                <Link
                  href="/wishlist"
                  className="text-white transition-colors hover:text-white/80"
                >
                  My Wishlist
                </Link>
              </li>
              <li>
                <Link
                  href="/checkout"
                  className="text-white transition-colors hover:text-white/80"
                >
                  Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Service Links */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-white transition-colors hover:text-white/80"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-white transition-colors hover:text-white/80"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery"
                  className="text-white transition-colors hover:text-white/80"
                >
                  Delivery Information
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-white transition-colors hover:text-white/80"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-white transition-colors hover:text-white/80"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Subscribe */}
          <div>
            <h4 className="mb-4 text-lg font-semibold">Subscribe</h4>
            <p className="mb-4 text-sm text-white">
              Enter your email below to be the first to know about new collections and product launches
            </p>
            <div className="flex gap-0">
              <Input
                type="email"
                placeholder="Your Email"
                className="rounded-r-none border-white bg-transparent text-white placeholder:text-white/60 focus-visible:ring-white"
              />
              <Button 
                size="icon" 
                className="rounded-l-none border border-l-0 border-white bg-transparent hover:bg-white/10"
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-white/20 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            {/* Payment Methods */}
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <div className="flex h-6 w-12 items-center justify-center rounded bg-white text-[10px] font-bold text-black">
                  VISA
                </div>
                <div className="flex h-6 w-16 items-center justify-center rounded bg-white text-[10px] font-bold text-black">
                  Apple Pay
                </div>
                <div className="flex h-6 w-16 items-center justify-center rounded bg-white text-[10px] font-bold text-black">
                  Google Pay
                </div>
                <div className="flex h-6 w-14 items-center justify-center rounded bg-white text-[10px] font-bold text-black">
                  MC
                </div>
                <div className="flex h-6 w-14 items-center justify-center rounded bg-white text-[10px] font-bold text-black">
                  PayPal
                </div>
              </div>
            </div>

            {/* Copyright */}
            <p className="text-sm text-white">
              ©2023 Krist All Rights are reserved
            </p>

            {/* Social Media */}
            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-white transition-colors hover:text-white/80"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-white transition-colors hover:text-white/80"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-white transition-colors hover:text-white/80"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
