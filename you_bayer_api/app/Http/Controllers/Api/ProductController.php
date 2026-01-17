<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    /**
     * Format storage URL with proper port
     */
    private function formatStorageUrl(string $path): string
    {
        // Try to get base URL from current request (includes port automatically)
        $baseUrl = request()->getSchemeAndHttpHost();
        
        // Fallback to config if request is not available (shouldn't happen in normal flow)
        if (empty($baseUrl) || $baseUrl === '://') {
            $baseUrl = config('app.url', 'http://localhost');
            
            // If APP_URL doesn't have a port but we're on localhost, try to get port from request
            if (strpos($baseUrl, 'localhost') !== false && strpos($baseUrl, ':') === false) {
                $port = request()->getPort();
                if ($port && !in_array($port, [80, 443])) {
                    $baseUrl .= ':' . $port;
                }
            }
        }
        
        // Remove trailing slash and add /storage
        $baseUrl = rtrim($baseUrl, '/');
        if (!Str::endsWith($baseUrl, '/storage')) {
            $baseUrl .= '/storage';
        }
        
        // Ensure path doesn't start with /
        $path = ltrim($path, '/');
        
        return $baseUrl . '/' . $path;
    }

    /**
     * Get all products (public endpoint with pagination, filters, and search)
     */
    public function publicIndex(Request $request): JsonResponse
    {
        try {
            $query = Product::query();

            // Load relationships
            $query->with(['category', 'primaryImage', 'images']);

            // Search by name
            if ($request->has('search') && !empty($request->search)) {
                $query->where('name', 'like', '%' . $request->search . '%');
            }

            // Filter by category
            if ($request->has('category_id') && $request->category_id) {
                $query->where('category_id', $request->category_id);
            }

            // Filter by price range
            if ($request->has('min_price') && $request->min_price) {
                $query->where('price', '>=', $request->min_price);
            }

            if ($request->has('max_price') && $request->max_price) {
                $query->where('price', '<=', $request->max_price);
            }

            // Sorting
            $sort = $request->get('sort', 'default');
            switch ($sort) {
                case 'price_asc':
                    $query->orderBy('price', 'asc');
                    break;
                case 'price_desc':
                    $query->orderBy('price', 'desc');
                    break;
                case 'name_asc':
                    $query->orderBy('name', 'asc');
                    break;
                case 'name_desc':
                    $query->orderBy('name', 'desc');
                    break;
                default:
                    $query->orderBy('created_at', 'desc');
                    break;
            }

            // Pagination
            $perPage = $request->get('per_page', 16);
            $perPage = min(max(1, (int)$perPage), 100); // Limit between 1 and 100

            $paginated = $query->paginate($perPage);

            // Format products with image URLs
            $products = $paginated->getCollection()->map(function ($product) {
                $productData = $product->toArray();
                
                // Format primary image URL
                if ($product->primaryImage) {
                    $productData['primary_image_url'] = $this->formatStorageUrl($product->primaryImage->image_path);
                } else {
                    // Fallback to first image if no primary
                    $firstImage = $product->images->first();
                    if ($firstImage) {
                        $productData['primary_image_url'] = $this->formatStorageUrl($firstImage->image_path);
                    } else {
                        $productData['primary_image_url'] = null;
                    }
                }

                // Format all images URLs
                if (isset($productData['images']) && is_array($productData['images'])) {
                    $productData['images'] = array_map(function ($image) {
                        if (isset($image['image_path'])) {
                            $image['url'] = $this->formatStorageUrl($image['image_path']);
                        }
                        return $image;
                    }, $productData['images']);
                }

                return $productData;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => $products,
                    'pagination' => [
                        'current_page' => $paginated->currentPage(),
                        'per_page' => $paginated->perPage(),
                        'total' => $paginated->total(),
                        'last_page' => $paginated->lastPage(),
                    ],
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all products
     */
    public function index(): JsonResponse
    {
        try {
            $products = Product::with(['category', 'images'])->orderBy('created_at', 'desc')->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'products' => $products,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch products',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a single product by ID
     */
    public function show(int $id): JsonResponse
    {
        try {
            $product = Product::with(['category', 'images'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => $product,
                ],
            ]);
        } catch (\Exception $e) {
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Create a new product
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:products,slug',
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'required|numeric|min:0',
                'discount' => 'nullable|numeric|min:0|max:100',
                'status' => 'nullable|in:in_stock,out_of_stock',
                'category_id' => 'nullable|integer|exists:categories,id',
            ]);

            // Generate slug from name if not provided
            $slug = $validated['slug'] ?? Str::slug($validated['name']);
            
            // Ensure slug is unique
            $originalSlug = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->exists()) {
                $slug = $originalSlug . '-' . $counter;
                $counter++;
            }

            $product = Product::create([
                'name' => $validated['name'],
                'slug' => $slug,
                'description' => $validated['description'] ?? null,
                'short_description' => $validated['short_description'] ?? null,
                'price' => $validated['price'],
                'discount' => $validated['discount'] ?? 0,
                'status' => $validated['status'] ?? 'in_stock',
                'category_id' => $validated['category_id'] ?? null,
            ]);

            $product->load(['category', 'images']);

            return response()->json([
                'success' => true,
                'message' => 'Product created successfully',
                'data' => [
                    'product' => $product,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Upload images for a product
     */
    public function uploadImages(Request $request, int $productId): JsonResponse
    {
        try {
            $product = Product::findOrFail($productId);

            $validated = $request->validate([
                'images' => 'required|array|min:1|max:10',
                'images.*' => 'required|image|mimes:jpeg,jpg,png,webp|max:5120', // 5MB max
                'primary_index' => 'nullable|integer|min:0',
            ]);

            $uploadedImages = [];
            $primaryIndex = $validated['primary_index'] ?? 0;

            // Ensure storage directory exists
            $storagePath = 'products/' . $productId;
            if (!Storage::disk('public')->exists($storagePath)) {
                Storage::disk('public')->makeDirectory($storagePath);
            }

            foreach ($validated['images'] as $index => $image) {
                $filename = time() . '_' . uniqid() . '.' . $image->getClientOriginalExtension();
                $path = $image->storeAs($storagePath, $filename, 'public');

                $isPrimary = ($index === $primaryIndex);

                // If this is marked as primary, unset other primary images
                if ($isPrimary) {
                    ProductImage::where('product_id', $productId)
                        ->where('is_primary', true)
                        ->update(['is_primary' => false]);
                }

                $productImage = ProductImage::create([
                    'product_id' => $productId,
                    'image_path' => $path,
                    'is_primary' => $isPrimary,
                    'sort_order' => $index,
                ]);

                $uploadedImages[] = $productImage;
            }

            // If no primary was set and images exist, set first as primary
            if (empty($primaryIndex) && count($uploadedImages) > 0) {
                $firstImage = ProductImage::where('product_id', $productId)
                    ->where('is_primary', true)
                    ->first();
                
                if (!$firstImage) {
                    $uploadedImages[0]->update(['is_primary' => true]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Images uploaded successfully',
                'data' => [
                    'images' => $uploadedImages,
                ],
            ], 201);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload images',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Set primary image for a product
     */
    public function setPrimaryImage(Request $request, int $productId, int $imageId): JsonResponse
    {
        try {
            $product = Product::findOrFail($productId);
            $image = ProductImage::where('product_id', $productId)
                ->findOrFail($imageId);

            // Unset all primary images for this product
            ProductImage::where('product_id', $productId)
                ->update(['is_primary' => false]);

            // Set this image as primary
            $image->update(['is_primary' => true]);

            return response()->json([
                'success' => true,
                'message' => 'Primary image updated successfully',
                'data' => [
                    'image' => $image->fresh(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to set primary image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete an image
     */
    public function deleteImage(int $productId, int $imageId): JsonResponse
    {
        try {
            $image = ProductImage::where('product_id', $productId)
                ->findOrFail($imageId);

            // Delete file from storage
            if (Storage::disk('public')->exists($image->image_path)) {
                Storage::disk('public')->delete($image->image_path);
            }

            $image->delete();

            return response()->json([
                'success' => true,
                'message' => 'Image deleted successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete image',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get product by slug (public endpoint)
     */
    public function getBySlug(string $slug): JsonResponse
    {
        try {
            $product = Product::with(['category', 'images'])
                ->where('slug', $slug)
                ->firstOrFail();

            $productData = $product->toArray();

            // Format primary image URL
            if ($product->primaryImage) {
                $productData['primary_image_url'] = $this->formatStorageUrl($product->primaryImage->image_path);
            } else {
                // Fallback to first image if no primary
                $firstImage = $product->images->first();
                if ($firstImage) {
                    $productData['primary_image_url'] = $this->formatStorageUrl($firstImage->image_path);
                } else {
                    $productData['primary_image_url'] = null;
                }
            }

            // Format all images URLs
            if (isset($productData['images']) && is_array($productData['images'])) {
                $productData['images'] = array_map(function ($image) {
                    if (isset($image['image_path'])) {
                        $image['url'] = $this->formatStorageUrl($image['image_path']);
                    }
                    return $image;
                }, $productData['images']);
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'product' => $productData,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Product not found',
                'error' => $e->getMessage(),
            ], 404);
        }
    }

    /**
     * Update a product
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);

            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'slug' => 'nullable|string|max:255|unique:products,slug,' . $id,
                'description' => 'nullable|string',
                'short_description' => 'nullable|string|max:500',
                'price' => 'sometimes|required|numeric|min:0',
                'discount' => 'nullable|numeric|min:0|max:100',
                'status' => 'nullable|in:in_stock,out_of_stock',
                'category_id' => 'nullable|integer|exists:categories,id',
            ]);

            // Update slug if name changed but slug not provided
            if (isset($validated['name']) && !isset($validated['slug'])) {
                $slug = Str::slug($validated['name']);
                $originalSlug = $slug;
                $counter = 1;
                while (Product::where('slug', $slug)->where('id', '!=', $id)->exists()) {
                    $slug = $originalSlug . '-' . $counter;
                    $counter++;
                }
                $validated['slug'] = $slug;
            }

            $product->update($validated);
            $product->load(['category', 'images']);

            return response()->json([
                'success' => true,
                'message' => 'Product updated successfully',
                'data' => [
                    'product' => $product,
                ],
            ]);
        } catch (\Exception $e) {
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            if ($e instanceof ValidationException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $e->errors(),
                ], 422);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to update product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a product
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $product = Product::findOrFail($id);

            // Delete all associated images
            foreach ($product->images as $image) {
                if (Storage::disk('public')->exists($image->image_path)) {
                    Storage::disk('public')->delete($image->image_path);
                }
                $image->delete();
            }

            // Delete the product
            $product->delete();

            return response()->json([
                'success' => true,
                'message' => 'Product deleted successfully',
            ]);
        } catch (\Exception $e) {
            if ($e instanceof \Illuminate\Database\Eloquent\ModelNotFoundException) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete product',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
