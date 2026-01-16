import Link from "next/link"
import { Button } from "@/app/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-primary-100">404</h1>
        <h2 className="mb-4 text-2xl font-semibold text-primary-100">
          Product Not Found
        </h2>
        <p className="mb-8 text-grey-600">
          The product you're looking for doesn't exist or has been removed.
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild>
            <Link href="/shop">
              <Home className="mr-2 h-4 w-4" />
              Back to Shop
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Go Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
