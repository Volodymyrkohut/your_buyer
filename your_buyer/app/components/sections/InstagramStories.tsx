"use client"

import { SafeImage } from "@/app/components/ui/safe-image"

export const InstagramStories = () => {
  const images = [
    { id: 1, image: "https://fashion-ua.com.ua/img/uploads/10913/premed/photo_2024-06-15_13-20-224o6nn_med.jpg" },
    { id: 2, image: "https://fashion-ua.com.ua/img/uploads/10913/premed/photo_2024-06-15_13-20-224o6nn_med.jpg" },
    { id: 3, image: "https://fashion-ua.com.ua/img/uploads/10913/premed/photo_2024-06-15_13-20-224o6nn_med.jpg" },
    { id: 4, image: "https://fashion-ua.com.ua/img/uploads/10913/premed/photo_2024-06-15_13-20-224o6nn_med.jpg" },
  ]

  return (
    <section className="bg-white py-12 md:py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold text-primary-100 md:text-4xl">
          Our Instagram Stories
        </h2>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((item) => (
            <div
              key={item.id}
              className="relative aspect-square w-full overflow-hidden rounded-lg bg-grey-100"
            >
              <img
                src={item.image}
                alt={`Instagram story ${item.id}`}
         
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
