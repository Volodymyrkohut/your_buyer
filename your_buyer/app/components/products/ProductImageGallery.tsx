"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/app/components/ui/button"

interface ProductImageGalleryProps {
  images: string[]
  productName: string
}

export const ProductImageGallery = ({
  images,
  productName,
}: ProductImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [mainViewportRef, mainEmbla] = useEmblaCarousel({
    loop: true,
    skipSnaps: false,
    dragFree: false,
  })
  const [thumbViewportRef, thumbEmbla] = useEmblaCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  })

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainEmbla || !thumbEmbla) return
      mainEmbla.scrollTo(index)
    },
    [mainEmbla, thumbEmbla]
  )

  const onSelect = useCallback(() => {
    if (!mainEmbla) return
    setSelectedIndex(mainEmbla.selectedScrollSnap())
    thumbEmbla?.scrollTo(mainEmbla.selectedScrollSnap())
  }, [mainEmbla, thumbEmbla])

  useEffect(() => {
    if (!mainEmbla) return
    onSelect()
    mainEmbla.on("select", onSelect)
    
    return () => {
      mainEmbla.off("select", onSelect)
    }
  }, [mainEmbla, onSelect])

  const scrollPrev = useCallback(() => {
    if (mainEmbla) mainEmbla.scrollPrev()
  }, [mainEmbla])

  const scrollNext = useCallback(() => {
    if (mainEmbla) mainEmbla.scrollNext()
  }, [mainEmbla])

  const canScrollPrev = mainEmbla?.canScrollPrev() ?? false
  const canScrollNext = mainEmbla?.canScrollNext() ?? false

  return (
    <div className="space-y-4">
      {/* Main Image Carousel */}
      <div className="relative">
        <div
          className="overflow-hidden rounded-lg bg-grey-100"
          ref={mainViewportRef}
        >
          <div className="flex">
            {images.map((image, index) => (
              <div
                key={index}
                className="relative min-w-0 flex-[0_0_100%]"
                style={{ aspectRatio: "1 / 1" }}
              >
                <img
                  src={image}
                  alt={`${productName} - Image ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white disabled:opacity-50"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              aria-label="Previous image"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white disabled:opacity-50"
              onClick={scrollNext}
              disabled={!canScrollNext}
              aria-label="Next image"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Carousel */}
      {images.length > 1 && (
        <div className="overflow-hidden" ref={thumbViewportRef}>
          <div className="flex gap-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => onThumbClick(index)}
                className={`relative min-w-0 flex-[0_0_25%] overflow-hidden rounded-lg border-2 transition-all ${
                  selectedIndex === index
                    ? "border-primary-100"
                    : "border-transparent hover:border-grey-300"
                }`}
                style={{ aspectRatio: "1 / 1" }}
                aria-label={`View image ${index + 1}`}
                aria-pressed={selectedIndex === index}
              >
                <img
                  src={image}
                  alt={`${productName} thumbnail ${index + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
