"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

interface ColorSwatchProps {
  name: string
  color: string
  className?: string
}

const ColorSwatch = ({ name, color, className }: ColorSwatchProps) => (
  <div className="flex flex-col items-center gap-2">
    <div
      className={`h-16 w-16 rounded-md border border-grey-200 ${className}`}
      style={{ backgroundColor: color }}
    />
    <span className="text-xs text-grey-600">{name}</span>
  </div>
)

export const ColorPalette = () => {
  return (
    <div className="space-y-8">
      {/* Primary Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Palette</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-9 gap-4">
            <ColorSwatch name="100" color="#1a1a1a" />
            <ColorSwatch name="200" color="#2d2d2d" />
            <ColorSwatch name="300" color="#404040" />
            <ColorSwatch name="400" color="#525252" />
            <ColorSwatch name="500" color="#666666" />
            <ColorSwatch name="600" color="#7a7a7a" />
            <ColorSwatch name="700" color="#8d8d8d" />
            <ColorSwatch name="800" color="#a0a0a0" />
            <ColorSwatch name="900" color="#b3b3b3" />
          </div>
        </CardContent>
      </Card>

      {/* Secondary Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Secondary Palette (Lime Green)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-9 gap-4">
            <ColorSwatch name="100" color="#84cc16" />
            <ColorSwatch name="200" color="#a3e635" />
            <ColorSwatch name="300" color="#bef264" />
            <ColorSwatch name="400" color="#d9f99d" />
            <ColorSwatch name="500" color="#ecfccb" />
            <ColorSwatch name="600" color="#f7fee7" />
            <ColorSwatch name="700" color="#f9fafb" />
            <ColorSwatch name="800" color="#fafbfc" />
            <ColorSwatch name="900" color="#fbfcfd" />
          </div>
        </CardContent>
      </Card>

      {/* Tertiary Palette */}
      <Card>
        <CardHeader>
          <CardTitle>Tertiary Palette (Magenta/Pink)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-9 gap-4">
            <ColorSwatch name="100" color="#d946ef" />
            <ColorSwatch name="200" color="#e879f9" />
            <ColorSwatch name="300" color="#f0abfc" />
            <ColorSwatch name="400" color="#f5d0fe" />
            <ColorSwatch name="500" color="#fae8ff" />
            <ColorSwatch name="600" color="#fce7f3" />
            <ColorSwatch name="700" color="#fdf2f8" />
            <ColorSwatch name="800" color="#fef7ff" />
            <ColorSwatch name="900" color="#fff7ff" />
          </div>
        </CardContent>
      </Card>

      {/* Monochromatic - Dark */}
      <Card>
        <CardHeader>
          <CardTitle>Monochromatic - Dark</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <ColorSwatch name="100" color="#0a0a0a" />
            <ColorSwatch name="200" color="#1a1a1a" />
            <ColorSwatch name="300" color="#2a2a2a" />
            <ColorSwatch name="400" color="#3a3a3a" />
            <ColorSwatch name="500" color="#4a4a4a" />
          </div>
        </CardContent>
      </Card>

      {/* Monochromatic - Grey */}
      <Card>
        <CardHeader>
          <CardTitle>Monochromatic - Grey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <ColorSwatch name="100" color="#f3f4f6" />
            <ColorSwatch name="200" color="#e5e7eb" />
            <ColorSwatch name="300" color="#d1d5db" />
            <ColorSwatch name="400" color="#9ca3af" />
            <ColorSwatch name="500" color="#6b7280" />
          </div>
        </CardContent>
      </Card>

      {/* Monochromatic - Light */}
      <Card>
        <CardHeader>
          <CardTitle>Monochromatic - Light</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <ColorSwatch name="100" color="#fafafa" />
            <ColorSwatch name="200" color="#f5f5f5" />
            <ColorSwatch name="300" color="#f0f0f0" />
            <ColorSwatch name="400" color="#e5e5e5" />
            <ColorSwatch name="500" color="#d9d9d9" />
          </div>
        </CardContent>
      </Card>

      {/* Monochromatic - White */}
      <Card>
        <CardHeader>
          <CardTitle>Monochromatic - White</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            <ColorSwatch name="100" color="#ffffff" />
            <ColorSwatch name="200" color="#fefefe" />
            <ColorSwatch name="300" color="#fdfdfd" />
            <ColorSwatch name="400" color="#fcfcfc" />
            <ColorSwatch name="500" color="#fbfbfb" />
          </div>
        </CardContent>
      </Card>

      {/* Gradient Colors */}
      <Card>
        <CardHeader>
          <CardTitle>Gradient Colors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <ColorSwatch name="Teal" color="#14b8a6" />
            <ColorSwatch name="Dark Blue" color="#1e40af" />
            <ColorSwatch name="Purple" color="#7c3aed" />
            <ColorSwatch name="Dark Pink" color="#be185d" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
