<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;

class NovaPoshtaController extends Controller
{
    /**
     * Nova Poshta API URL
     */
    private const API_URL = 'https://api.novaposhta.ua/v2.0/json/';

    /**
     * Get API key from config or env
     * For public API, this can be empty or a default key
     */
    private function getApiKey(): string
    {
        return config('services.nova_poshta.api_key', env('NOVA_POSHTA_API_KEY', ''));
    }

    /**
     * Make request to Nova Poshta API
     */
    private function makeApiRequest(string $modelName, string $calledMethod, array $methodProperties = []): array
    {
        $requestData = [
            'modelName' => $modelName,
            'calledMethod' => $calledMethod,
            'methodProperties' => $methodProperties,
        ];

        // Add API key if available
        $apiKey = $this->getApiKey();
        if (!empty($apiKey)) {
            $requestData['apiKey'] = $apiKey;
        }

        try {
            $response = Http::timeout(10)->post(self::API_URL, $requestData);
            
            if ($response->successful()) {
                $result = $response->json();
                
                // Log for debugging
                \Log::info('Nova Poshta API Response', [
                    'modelName' => $modelName,
                    'calledMethod' => $calledMethod,
                    'response' => $result
                ]);
                
                return $result;
            }

            \Log::error('Nova Poshta API Request Failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return [
                'success' => false,
                'errors' => ['API request failed'],
                'data' => [],
            ];
        } catch (\Exception $e) {
            \Log::error('Nova Poshta API Exception', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return [
                'success' => false,
                'errors' => [$e->getMessage()],
                'data' => [],
            ];
        }
    }

    /**
     * Get cities list
     */
    public function getCities(Request $request): JsonResponse
    {
        try {
            $query = $request->input('query', '');
            
            // Cache cities for 24 hours, but with query key
            $cacheKey = 'nova_poshta_cities_' . md5($query);
            
            $cities = Cache::remember($cacheKey, 86400, function () use ($query) {
                $methodProperties = [
                    'Page' => '1',
                    'Limit' => '500',
                ];
                
                // Add search query if provided
                if (!empty($query)) {
                    $methodProperties['FindByString'] = $query;
                }
                
                $result = $this->makeApiRequest('Address', 'getCities', $methodProperties);

                // Check if result is successful and has data
                // Nova Poshta API returns success: true and data array directly
                if (isset($result['success']) && $result['success'] === true) {
                    if (isset($result['data']) && is_array($result['data'])) {
                        // Return data even if empty (might be filtered result)
                        return $result['data'];
                    }
                }
                
                // If success is false, check for errors
                if (isset($result['errors']) && !empty($result['errors'])) {
                    \Log::warning('Nova Poshta API returned errors', ['errors' => $result['errors']]);
                }
                
                // Log the full response for debugging if no data
                if (empty($result['data']) || !is_array($result['data'])) {
                    \Log::info('Nova Poshta getCities empty or invalid result', [
                        'success' => $result['success'] ?? null,
                        'has_data' => isset($result['data']),
                        'data_type' => gettype($result['data'] ?? null),
                        'data_count' => is_array($result['data'] ?? null) ? count($result['data']) : 0,
                        'errors' => $result['errors'] ?? []
                    ]);
                }

                return [];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'cities' => $cities,
                ],
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to get cities', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get cities',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get departments for a city
     */
    public function getDepartments(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'city_ref' => 'required|string',
            ]);

            $cityRef = $validated['city_ref'];
            $cacheKey = "nova_poshta_departments_{$cityRef}";

            // Cache departments for 24 hours
            $departments = Cache::remember($cacheKey, 86400, function () use ($cityRef) {
                $result = $this->makeApiRequest('AddressGeneral', 'getWarehouses', [
                    'CityRef' => $cityRef,
                ]);

                if (isset($result['success']) && $result['success'] && isset($result['data'])) {
                    return $result['data'];
                }

                return [];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'departments' => $departments,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get departments',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Search city by name
     */
    public function searchCity(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|min:2',
            ]);

            $result = $this->makeApiRequest('Address', 'searchSettlements', [
                'CityName' => $validated['name'],
                'Limit' => 50,
            ]);

            $settlements = [];
            if (isset($result['success']) && $result['success'] && isset($result['data'][0]['Addresses'])) {
                $settlements = $result['data'][0]['Addresses'];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'settlements' => $settlements,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to search city',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
