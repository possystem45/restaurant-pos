import { useState, useCallback } from 'react';
import foodItemService from '../services/foodItemService';

export const useFoodItems = () => {
    const [foodItems, setFoodItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Fetch food items
    const fetchFoodItems = useCallback(async (params = {}) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await foodItemService.getFoodItems(params);
            setFoodItems(response.data || []);
            
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Failed to fetch food items';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Get single food item
    const getFoodItem = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await foodItemService.getFoodItemById(id);
            return response.data;
        } catch (err) {
            const errorMessage = err.message || 'Failed to fetch food item';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Create food item
    const createFoodItem = useCallback(async (foodItemData) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await foodItemService.createFoodItem(foodItemData);
            
            // Add the new item to the current list
            setFoodItems(prev => [response.data, ...prev]);
            
            return response.data;
        } catch (err) {
            const errorMessage = err.message || 'Failed to create food item';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Update food item
    const updateFoodItem = useCallback(async (id, foodItemData) => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await foodItemService.updateFoodItem(id, foodItemData);
            
            // Update the item in the current list
            setFoodItems(prev => 
                prev.map(item => 
                    item._id === id ? response.data : item
                )
            );
            
            return response.data;
        } catch (err) {
            const errorMessage = err.message || 'Failed to update food item';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Delete food item
    const deleteFoodItem = useCallback(async (id) => {
        try {
            setLoading(true);
            setError(null);
            
            await foodItemService.deleteFoodItem(id);
            
            // Remove the item from the current list
            setFoodItems(prev => prev.filter(item => item._id !== id));
            
        } catch (err) {
            const errorMessage = err.message || 'Failed to delete food item';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Seed sample food items
    const seedFoodItems = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await foodItemService.seedFoodItems();
            
            // Refresh the food items list
            await fetchFoodItems();
            
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Failed to seed food items';
            setError(errorMessage);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [fetchFoodItems]);

    // Get food categories
    const getFoodCategories = useCallback(async () => {
        try {
            const response = await foodItemService.getFoodCategories();
            return response.data;
        } catch (err) {
            const errorMessage = err.message || 'Failed to fetch categories';
            setError(errorMessage);
            throw err;
        }
    }, []);

    /**
     * Transform food items to match menu item format for table management
     */
    const getTransformedFoodItemsForMenu = useCallback(() => {
        return foodItems.map(item => ({
            id: item._id,
            name: item.name,
            description: item.description,
            price: item.localPrice || item.sellingPrice || item.basePrice, // Default to local price
            localPrice: item.localPrice || item.sellingPrice || item.basePrice,
            foreignPrice: item.foreignPrice || item.localPrice || item.sellingPrice || item.basePrice,
            category: item.category,
            type: 'food',
            ingredients: item.ingredients || [],
            preparationTime: item.preparationTime,
            isAvailable: item.isAvailable,
            nutritionalInfo: item.nutritionalInfo,
            allergens: item.allergens || [],
            basePrice: item.basePrice,
            sellingPrice: item.sellingPrice
        }));
    }, [foodItems]);

    /**
     * Get food items by category for menu display
     */
    const getFoodItemsByCategory = useCallback((category) => {
        const transformedItems = getTransformedFoodItemsForMenu();
        if (category === 'All') {
            return transformedItems;
        }
        return transformedItems.filter(item => item.category === category);
    }, [getTransformedFoodItemsForMenu]);

    /**
     * Get unique categories from food items
     */
    const getFoodItemCategories = useCallback(() => {
        const categories = [...new Set(foodItems.map(item => item.category))];
        return ['All', ...categories.filter(Boolean)];
    }, [foodItems]);

    /**
     * Get food item by ID (transformed format)
     */
    const getTransformedFoodItemById = useCallback((id) => {
        const transformedItems = getTransformedFoodItemsForMenu();
        return transformedItems.find(item => item.id === id);
    }, [getTransformedFoodItemsForMenu]);

    /**
     * Check if food item is available for ordering
     */
    const isItemAvailable = useCallback((id) => {
        const item = foodItems.find(item => item._id === id);
        return item ? item.isAvailable : false;
    }, [foodItems]);

    return {
        foodItems,
        loading,
        error,
        clearError,
        fetchFoodItems,
        getFoodItem,
        createFoodItem,
        updateFoodItem,
        deleteFoodItem,
        seedFoodItems,
        getFoodCategories,
        getTransformedFoodItemsForMenu,
        getFoodItemsByCategory,
        getFoodItemCategories,
        getTransformedFoodItemById,
        isItemAvailable
    };
};
