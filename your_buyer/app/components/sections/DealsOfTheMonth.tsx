"use client"

import { Button } from "@/app/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useState, useEffect } from "react"
import { SafeImage } from "@/app/components/ui/safe-image"

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

export const DealsOfTheMonth = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 15,
    hours: 10,
    minutes: 30,
    seconds: 45,
  })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { days, hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else if (minutes > 0) {
          minutes--
          seconds = 59
        } else if (hours > 0) {
          hours--
          minutes = 59
          seconds = 59
        } else if (days > 0) {
          days--
          hours = 23
          minutes = 59
          seconds = 59
        }

        return { days, hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          {/* Left side - Text and Countdown */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary-100 md:text-4xl">
              Deals of the Month
            </h2>
            <p className="text-grey-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation.
            </p>

            {/* Countdown Timer */}
            <div className="flex gap-4">
              <div className="flex flex-col items-center rounded-md bg-primary-100 px-4 py-3 text-white">
                <span className="text-2xl font-bold">{timeLeft.days}</span>
                <span className="text-xs uppercase">Days</span>
              </div>
              <div className="flex flex-col items-center rounded-md bg-primary-100 px-4 py-3 text-white">
                <span className="text-2xl font-bold">{timeLeft.hours}</span>
                <span className="text-xs uppercase">Hours</span>
              </div>
              <div className="flex flex-col items-center rounded-md bg-primary-100 px-4 py-3 text-white">
                <span className="text-2xl font-bold">{timeLeft.minutes}</span>
                <span className="text-xs uppercase">Mins</span>
              </div>
              <div className="flex flex-col items-center rounded-md bg-primary-100 px-4 py-3 text-white">
                <span className="text-2xl font-bold">{timeLeft.seconds}</span>
                <span className="text-xs uppercase">Secs</span>
              </div>
            </div>

            <Button size="lg" className="mt-4">
              View All Product
              <ArrowRight className="ml-2 h-5 w-5 text-white" />
            </Button>
          </div>

          {/* Right side - Image */}
          <div className="relative">
            <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-grey-100">
              <SafeImage
                src="/images/deals/deals-image.jpg"
                alt="Deals of the Month"
                fill
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
