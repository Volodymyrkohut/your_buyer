<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CartController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\NovaPoshtaController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\WishlistController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::get('/products', [ProductController::class, 'publicIndex']);
Route::get('/products/{slug}', [ProductController::class, 'getBySlug']);
Route::get('/categories', [CategoryController::class, 'publicIndex']);

// Cart routes (public - can use anonymous token)
Route::post('/cart/add', [CartController::class, 'add']);
Route::get('/cart', [CartController::class, 'index']);
Route::put('/cart/{id}', [CartController::class, 'update']);
Route::delete('/cart/{id}', [CartController::class, 'remove']);
Route::delete('/cart/clear', [CartController::class, 'clear']);

// Order routes (public - can use anonymous token)
Route::post('/orders', [OrderController::class, 'store']);

// Nova Poshta routes (public)
Route::get('/nova-poshta/cities', [NovaPoshtaController::class, 'getCities']);
Route::post('/nova-poshta/departments', [NovaPoshtaController::class, 'getDepartments']);
Route::get('/nova-poshta/search-city', [NovaPoshtaController::class, 'searchCity']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // Cart merge (only for authenticated users)
    Route::post('/cart/merge', [CartController::class, 'merge']);

    // Wishlist routes (only for authenticated users)
    Route::post('/wishlist/add', [WishlistController::class, 'add']);
    Route::get('/wishlist', [WishlistController::class, 'index']);
    Route::delete('/wishlist/{id}', [WishlistController::class, 'remove']);
    Route::delete('/wishlist/clear', [WishlistController::class, 'clear']);

    // Admin routes
    Route::prefix('admin')->group(function () {
        // Categories
        Route::get('/categories', [CategoryController::class, 'index']);
        Route::post('/categories', [CategoryController::class, 'store']);
        Route::put('/categories/{id}', [CategoryController::class, 'update']);
        Route::delete('/categories/{id}', [CategoryController::class, 'destroy']);

        // Products
        Route::get('/products', [ProductController::class, 'index']);
        Route::get('/products/{id}', [ProductController::class, 'show']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::post('/products/{productId}/images', [ProductController::class, 'uploadImages']);
        Route::put('/products/{productId}/images/{imageId}/primary', [ProductController::class, 'setPrimaryImage']);
        Route::delete('/products/{productId}/images/{imageId}', [ProductController::class, 'deleteImage']);

        // Users
        Route::get('/users', [AuthController::class, 'getAllUsers']);

        // Orders
        Route::get('/orders', [OrderController::class, 'index']);
    });
});
