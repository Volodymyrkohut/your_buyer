<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WishlistItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class WishlistController extends Controller
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
     * Format product with image URLs
     */
    private function formatProductWithImages($product): array
    {
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
    }

    /**
     * Add product to wishlist
     */
    public function add(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be authenticated',
                ], 401);
            }

            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
            ]);

            $productId = $validated['product_id'];

            // Check if product exists
            $product = Product::find($productId);
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            // Check if product is already in wishlist
            $existingItem = WishlistItem::where('user_id', $user->id)
                ->where('product_id', $productId)
                ->first();

            if ($existingItem) {
                // Already in wishlist, return existing item
                $existingItem->load('product.category', 'product.primaryImage', 'product.images');
                
                $wishlistItemData = $existingItem->toArray();
                $wishlistItemData['product'] = $this->formatProductWithImages($existingItem->product);

                return response()->json([
                    'success' => true,
                    'message' => 'Product already in wishlist',
                    'data' => [
                        'wishlist_item' => $wishlistItemData,
                    ],
                ]);
            }

            // Create new wishlist item
            $wishlistItem = WishlistItem::create([
                'user_id' => $user->id,
                'product_id' => $productId,
            ]);

            // Load product relationship
            $wishlistItem->load('product.category', 'product.primaryImage', 'product.images');

            // Format wishlist item with product image URLs
            $wishlistItemData = $wishlistItem->toArray();
            $wishlistItemData['product'] = $this->formatProductWithImages($wishlistItem->product);

            return response()->json([
                'success' => true,
                'message' => 'Item added to wishlist',
                'data' => [
                    'wishlist_item' => $wishlistItemData,
                ],
            ], 201);
        } catch (\Exception $e) {
            if ($e instanceof ValidationException) {
                throw $e;
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to wishlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get wishlist items
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be authenticated',
                ], 401);
            }

            $wishlistItems = WishlistItem::where('user_id', $user->id)
                ->with(['product.category', 'product.primaryImage', 'product.images'])
                ->get();

            // Format wishlist items with product image URLs
            $formattedWishlistItems = $wishlistItems->map(function ($wishlistItem) {
                $wishlistItemData = $wishlistItem->toArray();
                $wishlistItemData['product'] = $this->formatProductWithImages($wishlistItem->product);
                return $wishlistItemData;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'wishlist_items' => $formattedWishlistItems,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get wishlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove item from wishlist
     */
    public function remove(Request $request, $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be authenticated',
                ], 401);
            }

            $wishlistItem = WishlistItem::where('user_id', $user->id)
                ->where('id', $id)
                ->first();

            if (!$wishlistItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Wishlist item not found',
                ], 404);
            }

            $wishlistItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item removed from wishlist',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from wishlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear wishlist
     */
    public function clear(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User must be authenticated',
                ], 401);
            }

            WishlistItem::where('user_id', $user->id)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Wishlist cleared',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear wishlist',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
