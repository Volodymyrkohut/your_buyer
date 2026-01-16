"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import type { CartItem } from "@/lib/cart"

interface CartSummaryProps {
  items: CartItem[]
}

export const CartSummary = ({ items }: CartSummaryProps) => {
  const [discountCode, setDiscountCode] = useState("FLAT50")
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )
  const deliveryCharge = 5.0
  const grandTotal = subtotal + deliveryCharge

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-primary-100">
          Order Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Details */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-grey-600">Subtotal</span>
            <span className="font-medium text-primary-100">
              ${subtotal.toFixed(2)}
            </span>
          </div>

          {/* Discount Code */}
          <div className="space-y-2">
            <label className="text-sm text-grey-600">Enter Discount Code</label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="flex-1 border-grey-300"
                placeholder="FLAT50"
              />
              <Button variant="outline" className="bg-primary-100 text-white hover:bg-primary-200">
                Apply
              </Button>
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-grey-600">Delivery Charge</span>
            <span className="font-medium text-primary-100">
              ${deliveryCharge.toFixed(2)}
            </span>
          </div>

          <div className="border-t border-grey-200 pt-3">
            <div className="flex justify-between">
              <span className="text-lg font-bold text-primary-100">Grand Total</span>
              <span className="text-lg font-bold text-primary-100">
                ${grandTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Checkout Button */}
        <Button className="w-full" size="lg">
          Proceed to Checkout
        </Button>
      </CardContent>
    </Card>
  )
}
