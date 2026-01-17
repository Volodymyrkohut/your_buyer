import { notFound } from "next/navigation"
import { ProductImageGallery } from "@/app/components/products/ProductImageGallery"
import { ProductInfo } from "@/app/components/products/ProductInfo"
import { ProductCard } from "@/app/components/products/ProductCard"
import { getProductBySlug as getProductBySlugApi, type Product as ApiProduct } from "@/lib/api"
import { getProductsList } from "@/lib/api"
import { Home, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Metadata } from "next"
import type { ProductDetail } from "@/lib/products"

// Convert API Product to ProductDetail
function convertApiProductToProductDetail(apiProduct: ApiProduct): ProductDetail {
  const originalPrice = apiProduct.discount > 0 
    ? apiProduct.price / (1 - apiProduct.discount / 100)
    : undefined

  // Get image URLs
  const imageUrls = apiProduct.images?.map(img => {
    // Check if url is already set (from API), otherwise construct from image_path
    if ((img as any).url) {
      return (img as any).url
    }
    return img.image_path ? `http://localhost:8000/storage/${img.image_path}` : ""
  }).filter(Boolean) || []
  
  const primaryImage = apiProduct.primary_image_url || imageUrls[0] || ""

  return {
    id: apiProduct.id,
    name: apiProduct.name,
    brand: apiProduct.category?.name,
    price: Number(apiProduct.price),
    originalPrice: originalPrice ? Number(originalPrice.toFixed(2)) : undefined,
    image: primaryImage,
    category: apiProduct.category?.name,
    description: apiProduct.description || undefined,
    short_description: apiProduct.short_description || undefined,
    images: imageUrls.length > 0 ? imageUrls : [primaryImage],
    sizes: ["S", "M", "L", "XL", "XXL"], // Default sizes, can be extended later
    colors: ["Black", "White", "Grey", "Navy"], // Default colors, can be extended later
    inStock: apiProduct.status === 'in_stock',
    sku: `SKU-${apiProduct.id.toString().padStart(4, "0")}`,
  }
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  try {
    const { slug } = await params
    const apiProduct = await getProductBySlugApi(slug)
    const product = convertApiProductToProductDetail(apiProduct)

    return {
      title: `${product.name} | KKrist`,
      description: product.description || `Shop ${product.name} at KKrist`,
      openGraph: {
        title: product.name,
        description: product.description,
        images: product.images || [product.image],
      },
    }
  } catch {
    return {
      title: "Product Not Found",
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  
  let apiProduct: ApiProduct
  try {
    apiProduct = await getProductBySlugApi(slug)
  } catch {
    notFound()
  }

  const product = convertApiProductToProductDetail(apiProduct)

  // Get related products (same category)
  let relatedProducts: ProductDetail[] = []
  if (apiProduct.category_id) {
    try {
      const response = await getProductsList({
        category_id: apiProduct.category_id,
        per_page: 5,
      })
      relatedProducts = response.data.products
        .filter(p => p.id !== apiProduct.id)
        .slice(0, 4)
        .map(convertApiProductToProductDetail)
    } catch {
      // If related products fail to load, continue without them
    }
  }

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
