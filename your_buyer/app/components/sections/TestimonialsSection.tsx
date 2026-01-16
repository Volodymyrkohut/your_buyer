"use client"

import { Card } from "@/app/components/ui/card"
import { Star, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { SafeImage } from "@/app/components/ui/safe-image"

interface Testimonial {
  id: number
  name: string
  rating: number
  text: string
  avatar: string
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: "Leslie Alexander",
    rating: 5,
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.",
    avatar: "/images/testimonials/avatar-1.jpg",
  },
  {
    id: 2,
    name: "Jacob Jones",
    rating: 5,
    text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
    avatar: "/images/testimonials/avatar-2.jpg",
  },
  {
    id: 3,
    name: "Jenny Wilson",
    rating: 5,
    text: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.",
    avatar: "/images/testimonials/avatar-3.jpg",
  },
]

export const TestimonialsSection = () => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    )
  }

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold text-primary-100 md:text-4xl">
            What our Customer say&apos;s
          </h2>
          <div className="flex gap-2">
            <button
              onClick={prevTestimonial}
              className="rounded-full border border-grey-300 p-2 text-primary-100 transition-colors hover:bg-grey-100"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5 text-primary-100" />
            </button>
            <button
              onClick={nextTestimonial}
              className="rounded-full border border-grey-300 p-2 text-primary-100 transition-colors hover:bg-grey-100"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5 text-primary-100" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              className="border-0 bg-grey-50 p-6 shadow-sm"
            >
              {/* Rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="mb-6 text-grey-600">{testimonial.text}</p>

              {/* Customer Info */}
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-grey-200">
                  <SafeImage
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>
                <span className="font-semibold text-primary-100">
                  {testimonial.name}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
