<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class CartController extends Controller
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
     * Get cart identifier (user_id or anonymous_token)
     * @param bool $requireToken If true, throws exception when token is missing for non-authenticated users
     */
    private function getCartIdentifier(Request $request, bool $requireToken = true): array
    {
        // First, check if user is authenticated (either through middleware or manually via token)
        $user = $request->user();
        
        // If not authenticated through middleware, try to authenticate via Bearer token
        if (!$user) {
            $authHeader = $request->header('Authorization');
            if ($authHeader && str_starts_with($authHeader, 'Bearer ')) {
                $token = substr($authHeader, 7);
                $accessToken = PersonalAccessToken::findToken($token);
                if ($accessToken) {
                    $user = $accessToken->tokenable;
                }
            }
        }
        
        if ($user) {
            return ['user_id' => $user->id, 'anonymous_token' => null];
        }

        $anonymousToken = $request->header('X-Anonymous-Token');
        
        if (!$anonymousToken && $requireToken) {
            throw new \Exception('Anonymous token is required for non-authenticated users');
        }

        return ['user_id' => null, 'anonymous_token' => $anonymousToken];
    }

    /**
     * Add item to cart
     */
    public function add(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'product_id' => 'required|exists:products,id',
                'quantity' => 'required|integer|min:1',
            ]);

            $identifier = $this->getCartIdentifier($request);
            $productId = $validated['product_id'];
            $quantity = $validated['quantity'];

            // Check if product exists
            $product = Product::find($productId);
            if (!$product) {
                return response()->json([
                    'success' => false,
                    'message' => 'Product not found',
                ], 404);
            }

            // Find existing cart item
            $cartItem = CartItem::where(function ($query) use ($identifier) {
                if ($identifier['user_id']) {
                    $query->where('user_id', $identifier['user_id']);
                } else {
                    $query->where('anonymous_token', $identifier['anonymous_token']);
                }
            })->where('product_id', $productId)->first();

            if ($cartItem) {
                // Update quantity
                $cartItem->quantity += $quantity;
                $cartItem->save();
            } else {
                // Create new cart item
                $cartItem = CartItem::create([
                    'user_id' => $identifier['user_id'],
                    'anonymous_token' => $identifier['anonymous_token'],
                    'product_id' => $productId,
                    'quantity' => $quantity,
                ]);
            }

            // Load product relationship
            $cartItem->load('product.category', 'product.primaryImage', 'product.images');

            // Format cart item with product image URLs
            $cartItemData = $cartItem->toArray();
            $cartItemData['product'] = $this->formatProductWithImages($cartItem->product);

            return response()->json([
                'success' => true,
                'message' => 'Item added to cart',
                'data' => [
                    'cart_item' => $cartItemData,
                ],
            ], 201);
        } catch (\Exception $e) {
            if ($e instanceof ValidationException) {
                throw $e;
            }
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to add item to cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get cart items
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // For index, don't require token - return empty cart if no token for non-authenticated users
            $identifier = $this->getCartIdentifier($request, false);

            // If no user and no token, return empty cart
            if (!$identifier['user_id'] && !$identifier['anonymous_token']) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'cart_items' => [],
                    ],
                ]);
            }

            $cartItems = CartItem::where(function ($query) use ($identifier) {
                if ($identifier['user_id']) {
                    $query->where('user_id', $identifier['user_id']);
                } else {
                    $query->where('anonymous_token', $identifier['anonymous_token']);
                }
            })->with(['product.category', 'product.primaryImage', 'product.images'])->get();

            // Format cart items with product image URLs
            $formattedCartItems = $cartItems->map(function ($cartItem) {
                $cartItemData = $cartItem->toArray();
                $cartItemData['product'] = $this->formatProductWithImages($cartItem->product);
                return $cartItemData;
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'cart_items' => $formattedCartItems,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update cart item quantity
     */
    public function update(Request $request, $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'quantity' => 'required|integer|min:1',
            ]);

            $identifier = $this->getCartIdentifier($request);
            $quantity = $validated['quantity'];

            $cartItem = CartItem::where(function ($query) use ($identifier) {
                if ($identifier['user_id']) {
                    $query->where('user_id', $identifier['user_id']);
                } else {
                    $query->where('anonymous_token', $identifier['anonymous_token']);
                }
            })->where('id', $id)->first();

            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found',
                ], 404);
            }

            $cartItem->quantity = $quantity;
            $cartItem->save();

            $cartItem->load('product.category', 'product.primaryImage', 'product.images');

            // Format cart item with product image URLs
            $cartItemData = $cartItem->toArray();
            $cartItemData['product'] = $this->formatProductWithImages($cartItem->product);

            return response()->json([
                'success' => true,
                'message' => 'Cart item updated',
                'data' => [
                    'cart_item' => $cartItemData,
                ],
            ]);
        } catch (\Exception $e) {
            if ($e instanceof ValidationException) {
                throw $e;
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to update cart item',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Remove item from cart
     */
    public function remove(Request $request, $id): JsonResponse
    {
        try {
            $identifier = $this->getCartIdentifier($request);

            $cartItem = CartItem::where(function ($query) use ($identifier) {
                if ($identifier['user_id']) {
                    $query->where('user_id', $identifier['user_id']);
                } else {
                    $query->where('anonymous_token', $identifier['anonymous_token']);
                }
            })->where('id', $id)->first();

            if (!$cartItem) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart item not found',
                ], 404);
            }

            $cartItem->delete();

            return response()->json([
                'success' => true,
                'message' => 'Item removed from cart',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove item from cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Clear cart
     */
    public function clear(Request $request): JsonResponse
    {
        try {
            $identifier = $this->getCartIdentifier($request);

            CartItem::where(function ($query) use ($identifier) {
                if ($identifier['user_id']) {
                    $query->where('user_id', $identifier['user_id']);
                } else {
                    $query->where('anonymous_token', $identifier['anonymous_token']);
                }
            })->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cart cleared',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to clear cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Merge anonymous cart with user cart
     */
    public function merge(Request $request): JsonResponse
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
                'anonymous_token' => 'required|string',
            ]);

            $anonymousToken = $validated['anonymous_token'];
            
            // Get all anonymous cart items
            $anonymousCartItems = CartItem::where('anonymous_token', $anonymousToken)->get();

            if ($anonymousCartItems->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'message' => 'No items to merge',
                    'data' => [
                        'cart_items' => [],
                    ],
                ]);
            }

            $mergedItems = [];

            foreach ($anonymousCartItems as $anonymousItem) {
                // Check if user already has this product in cart
                $userCartItem = CartItem::where('user_id', $user->id)
                    ->where('product_id', $anonymousItem->product_id)
                    ->first();

                if ($userCartItem) {
                    // Sum quantities
                    $userCartItem->quantity += $anonymousItem->quantity;
                    $userCartItem->save();
                    $userCartItem->load('product.category', 'product.primaryImage', 'product.images');
                    
                    // Format cart item with product image URLs
                    $cartItemData = $userCartItem->toArray();
                    $cartItemData['product'] = $this->formatProductWithImages($userCartItem->product);
                    $mergedItems[] = $cartItemData;
                } else {
                    // Move anonymous item to user
                    $anonymousItem->user_id = $user->id;
                    $anonymousItem->anonymous_token = null;
                    $anonymousItem->save();
                    $anonymousItem->load('product.category', 'product.primaryImage', 'product.images');
                    
                    // Format cart item with product image URLs
                    $cartItemData = $anonymousItem->toArray();
                    $cartItemData['product'] = $this->formatProductWithImages($anonymousItem->product);
                    $mergedItems[] = $cartItemData;
                }
            }

            // Delete all anonymous cart items (they are now merged or moved)
            CartItem::where('anonymous_token', $anonymousToken)->delete();

            return response()->json([
                'success' => true,
                'message' => 'Cart merged successfully',
                'data' => [
                    'cart_items' => $mergedItems,
                ],
            ]);
        } catch (\Exception $e) {
            if ($e instanceof ValidationException) {
                throw $e;
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to merge cart',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
