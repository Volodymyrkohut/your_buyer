"use client"

import Image from "next/image"
import { useState } from "react"

interface SafeImageProps {
  src: string
  alt: string
  fill?: boolean
  width?: number
  height?: number
  className?: string
  sizes?: string
  priority?: boolean
}

export const SafeImage = ({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
}: SafeImageProps) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-grey-100 text-grey-400 ${className}`}
        style={fill ? undefined : { width, height }}
      >
        <span className="text-sm">Image not found</span>
      </div>
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill}
      width={width}
      height={height}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => {
        setHasError(true)
      }}
    />
  )
}
