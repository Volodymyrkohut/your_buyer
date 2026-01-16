"use client"

import { Button } from "@/app/components/ui/button"
import { ArrowRight } from "lucide-react"
import { SafeImage } from "@/app/components/ui/safe-image"

export const HeroSection = () => {
  return (
    <section className="relative bg-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left side - Text Content */}
          <div className="relative z-10 space-y-6">
            <p className="text-sm font-medium uppercase tracking-wider text-grey-500">
              Classic Exclusive
            </p>
            <h1 className="text-4xl font-bold leading-tight text-primary-100 md:text-5xl lg:text-6xl">
              Women&apos;s Collection
            </h1>
            <p className="text-2xl font-semibold text-secondary-100">
              UPTO 40% OFF
            </p>
            <Button size="lg" className="mt-4">
              Shop Now
              <ArrowRight className="ml-2 h-5 w-5 text-white" />
            </Button>
            {/* Decorative background text */}
            <div className="absolute -left-4 -top-4 -z-10 text-[120px] font-bold leading-none text-grey-100 opacity-20 md:-left-8 md:-top-8 md:text-[180px]">
              BEST
            </div>
          </div>

          {/* Right side - Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border-4 border-white shadow-2xl bg-grey-100">
              <img
                src="https://fashion-ua.com.ua/img/uploads/10913/premed/photo_2024-06-15_13-20-224o6nn_med.jpg"
                alt="Women's Collection"
            
                className="object-cover"
      
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
