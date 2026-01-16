import { notFound } from "next/navigation"
import { ProductImageGallery } from "@/app/components/products/ProductImageGallery"
import { ProductInfo } from "@/app/components/products/ProductInfo"
import { ProductCard } from "@/app/components/products/ProductCard"
import { getProductBySlug, getRelatedProducts } from "@/lib/products"
import { Home, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} | KKrist`,
    description: product.description || `Shop ${product.name} at KKrist`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: product.images || [product.image],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = getRelatedProducts(product.id, 4)

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-grey-600">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-primary-100 transition-colors"
          >
            <Home className="h-4 w-4" />
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link
            href="/shop"
            className="hover:text-primary-100 transition-colors"
          >
            Shop
          </Link>
          <ChevronRight className="h-4 w-4" />
          {product.category && (
            <>
              <Link
                href={`/shop?category=${product.category.toLowerCase().replace(/\s+/g, "-")}`}
                className="hover:text-primary-100 transition-colors"
              >
                {product.category}
              </Link>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
          <span className="text-primary-100">{product.name}</span>
        </nav>

        {/* Product Detail Section */}
        <div className="mb-16 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div>
            <ProductImageGallery
              images={product.images || [product.image]}
              productName={product.name}
            />
          </div>

          {/* Product Info */}
          <div>
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="border-t border-grey-200 pt-12">
            <h2 className="mb-8 text-2xl font-bold text-primary-100">
              Related Products
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
