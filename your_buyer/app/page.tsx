import { HeroSection } from "@/app/components/sections/HeroSection"
import { ShopByCategories } from "@/app/components/sections/ShopByCategories"
import { BestsellerSection } from "@/app/components/sections/BestsellerSection"
import { DealsOfTheMonth } from "@/app/components/sections/DealsOfTheMonth"
import { TestimonialsSection } from "@/app/components/sections/TestimonialsSection"
import { InstagramStories } from "@/app/components/sections/InstagramStories"
import { ServiceDifferentiators } from "@/app/components/sections/ServiceDifferentiators"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <ShopByCategories />
      <BestsellerSection />
      <DealsOfTheMonth />
      <TestimonialsSection />
      <InstagramStories />
      <ServiceDifferentiators />
    </div>
  )
}
