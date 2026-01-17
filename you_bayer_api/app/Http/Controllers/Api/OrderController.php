<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class OrderController extends Controller
{
    /**
     * Get cart identifier (user_id or anonymous_token)
     */
    private function getCartIdentifier(Request $request): array
    {
        // First, check if user is authenticated
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
        
        return ['user_id' => null, 'anonymous_token' => $anonymousToken];
    }

    /**
     * Create a new order
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'surname' => 'required|string|max:255',
                'middlename' => 'nullable|string|max:255',
                'phone' => 'required|string|max:20',
                'delivery_city' => 'required|string|max:255',
                'delivery_department' => 'required|string|max:255',
                'dont_call' => 'nullable|boolean',
            ]);

            $identifier = $this->getCartIdentifier($request);

            // Get cart items
            $cartItems = CartItem::where(function ($query) use ($identifier) {
                if ($identifier['user_id']) {
                    $query->where('user_id', $identifier['user_id']);
                } else {
                    $query->where('anonymous_token', $identifier['anonymous_token']);
                }
            })->with('product')->get();

            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty',
                ], 400);
            }

            // Calculate total amount
            $totalAmount = 0;
            foreach ($cartItems as $cartItem) {
                $totalAmount += $cartItem->product->price * $cartItem->quantity;
            }

            // Create order
            $order = Order::create([
                'user_id' => $identifier['user_id'],
                'name' => $validated['name'],
                'surname' => $validated['surname'],
                'middlename' => $validated['middlename'] ?? null,
                'phone' => $validated['phone'],
                'delivery_city' => $validated['delivery_city'],
                'delivery_department' => $validated['delivery_department'],
                'dont_call' => $validated['dont_call'] ?? false,
                'status' => 'pending',
                'total_amount' => $totalAmount,
            ]);

            // Create order items
            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'product_id' => $cartItem->product_id,
                    'quantity' => $cartItem->quantity,
                    'price_at_order' => $cartItem->product->price,
                ]);
            }

            // Clear cart
            CartItem::where(function ($query) use ($identifier) {
                if ($identifier['user_id']) {
                    $query->where('user_id', $identifier['user_id']);
                } else {
                    $query->where('anonymous_token', $identifier['anonymous_token']);
                }
            })->delete();

            // Load relationships
            $order->load(['orderItems.product.category', 'orderItems.product.primaryImage', 'orderItems.product.images', 'user']);

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order,
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
                'message' => 'Failed to create order',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get all orders (for admin)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $orders = Order::with(['orderItems.product.category', 'orderItems.product.primaryImage', 'orderItems.product.images', 'user'])
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'orders' => $orders,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get orders',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
