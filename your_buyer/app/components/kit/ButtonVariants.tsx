"use client"

import { Button } from "@/app/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { ArrowRight, Heart, ShoppingCart, Search } from "lucide-react"

export const ButtonVariants = () => {
  return (
    <div className="space-y-8">
      {/* Primary Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Primary Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
          </div>
        </CardContent>
      </Card>

      {/* Secondary Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Secondary Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary">Secondary</Button>
            <Button variant="secondary" disabled>
              Disabled
            </Button>
            <Button variant="secondary" size="sm">
              Small
            </Button>
            <Button variant="secondary" size="lg">
              Large
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Outline Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Outline Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">Outline</Button>
            <Button variant="outline" disabled>
              Disabled
            </Button>
            <Button variant="outline" size="sm">
              Small
            </Button>
            <Button variant="outline" size="lg">
              Large
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Ghost Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Ghost Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="ghost">Ghost</Button>
            <Button variant="ghost" disabled>
              Disabled
            </Button>
            <Button variant="ghost" size="sm">
              Small
            </Button>
            <Button variant="ghost" size="lg">
              Large
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Link Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Link Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="link">Link</Button>
            <Button variant="link" disabled>
              Disabled
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Buttons with Icons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons with Icons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4 text-white" />
              Add to Cart
            </Button>
            <Button>
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4 text-white" />
            </Button>
            <Button variant="outline">
              <Heart className="mr-2 h-4 w-4 text-primary-100" />
              Wishlist
            </Button>
            <Button size="icon">
              <Search className="h-4 w-4 text-white" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
