"use client"

import { Card } from "@/app/components/ui/card"
import { Truck, DollarSign, Headphones, CreditCard } from "lucide-react"

interface Service {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
}

const services: Service[] = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Free Shipping for order above $199",
  },
  {
    icon: DollarSign,
    title: "Money Guarantee",
    description: "Within 30 days for an exchange",
  },
  {
    icon: Headphones,
    title: "Online Support",
    description: "24 hours a day, 7 days a week",
  },
  {
    icon: CreditCard,
    title: "Flexible Payment",
    description: "Pay with multiple credit cards",
  },
]

export const ServiceDifferentiators = () => {
  return (
    <section className="bg-grey-50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Card
                key={index}
                className="border-0 bg-white p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex justify-center">
                  <div className="rounded-full bg-secondary-100/20 p-4">
                    <Icon className="h-8 w-8 text-secondary-100" />
                  </div>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-primary-100">
                  {service.title}
                </h3>
                <p className="text-sm text-grey-600">{service.description}</p>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
