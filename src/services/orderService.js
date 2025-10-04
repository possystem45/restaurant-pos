import { api } from '../utils/api.js';

/**
 * Service for handling orders and stock consumption
 */
class OrderService {
    /**
     * Create a new order (bill) when table is selected
     * @param {string} tableId - Table identifier
     * @returns {Promise} - Promise resolving to created order
     */
    async createOrder(tableId) {
        try {
            const orderData = {
                tableNumber: parseInt(tableId), // Ensure it's a number
                items: [],
                subtotal: 0,
                total: 0,
                status: 'created', // Initial status when bill is created
                paymentStatus: 'unpaid'
            };
            const response = await api.post('/orders', orderData);
            return response;
        } catch (error) {
            console.error('OrderService: Create order error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Update an existing order with new items
     * @param {string} orderId - Order ID
     * @param {Array} items - Array of order items
     * @param {number} total - Order total
     * @returns {Promise} - Promise resolving to updated order
     */
    async updateOrder(orderId, items, total) {
        try {
            const updateData = {
                items: items.map(item => ({
                    name: item.name,
                    itemType: item.type === 'liquor' || ['hard_liquor', 'beer', 'wine', 'cigarettes', 'ice_cubes', 'sandy_bottles'].includes(item.type) ? 'liquor' : 'food',
                    itemId: item.id,
                    quantity: item.quantity,
                    unitPrice: item.price,
                    totalPrice: item.price * item.quantity,
                    portionSize: item.portionSize || null
                })),
                subtotal: total,
                total: total,
                status: items.length > 0 ? 'pending' : 'created' // Change to pending when items are added
            };
            const response = await api.put(`/orders/${orderId}`, updateData);
            return response;
        } catch (error) {
            console.error('OrderService: Update order error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Process an order payment and handle stock deduction
     * @param {Object} orderData - Order data containing items and quantities
     * @returns {Promise} - Promise resolving to order processing result
     */
    async processOrderPayment(orderData) {
        try {
            const response = await api.post('/orders/process-payment', orderData);
            return response;
        } catch (error) {
            console.error('OrderService: API Error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Consume stock for food items based on their ingredients
     * @param {Array} foodItems - Array of food items with quantities
     * @returns {Promise} - Promise resolving to stock consumption result
     */
    async consumeStockForFoodItems(foodItems) {
        try {
            const consumptionRequests = [];

            for (const foodItem of foodItems) {
                if (foodItem.ingredients && foodItem.ingredients.length > 0) {
                    for (const ingredient of foodItem.ingredients) {
                        // Calculate total quantity needed for this ingredient
                        const totalQuantityNeeded = ingredient.quantity * foodItem.quantity;
                        
                        consumptionRequests.push({
                            stockItemName: ingredient.name,
                            quantityConsumed: totalQuantityNeeded,
                            unit: ingredient.unit,
                            orderId: foodItem.orderId || `order_${Date.now()}`,
                            foodItemName: foodItem.name,
                            reason: 'Order completion'
                        });
                    }
                }
            }

            if (consumptionRequests.length > 0) {
                const response = await api.post('/stock/consume-bulk', {
                    consumptions: consumptionRequests
                });
                return response.data;
            }

            return { success: true, message: 'No stock consumption needed' };
        } catch (error) {
            console.error('Error consuming stock for food items:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Consume stock for liquor items
     * @param {Array} liquorItems - Array of liquor items with quantities and portions
     * @returns {Promise} - Promise resolving to liquor stock consumption result
     */
    async consumeStockForLiquorItems(liquorItems) {
        try {
            const consumptionRequests = [];

            for (const liquorItem of liquorItems) {
                // For liquor, we need to consume volume/bottles
                const portion = liquorItem.selectedPortion || { volume: liquorItem.bottleVolume || 750 };
                const totalVolumeConsumed = portion.volume * liquorItem.quantity;

                consumptionRequests.push({
                    liquorId: liquorItem.id || liquorItem._id,
                    volumeConsumed: totalVolumeConsumed,
                    portionName: portion.name || 'Full Bottle',
                    quantity: liquorItem.quantity,
                    orderId: liquorItem.orderId || `order_${Date.now()}`,
                    reason: 'Order completion'
                });
            }

            if (consumptionRequests.length > 0) {
                const response = await api.post('/liquor/consume-bulk', {
                    consumptions: consumptionRequests
                });
                return response.data;
            }

            return { success: true, message: 'No liquor consumption needed' };
        } catch (error) {
            console.error('Error consuming liquor stock:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get available food items from the API
     * @returns {Promise} - Promise resolving to food items data
     */
    async getFoodItems() {
        try {
            const response = await api.get('/food-items');
            return response.data;
        } catch (error) {
            console.error('Error fetching food items:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get available liquor items from the API
     * @returns {Promise} - Promise resolving to liquor items data
     */
    async getLiquorItems() {
        try {
            const response = await api.get('/liquor');
            return response.data;
        } catch (error) {
            console.error('Error fetching liquor items:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Update order status
     * @param {String} orderId - Order ID
     * @param {String} status - New status
     * @returns {Promise} - Promise resolving to updated order
     */
    async updateOrderStatus(orderId, status) {
        try {
            const response = await api.put(`/orders/${orderId}/status`, { status });
            return response.data;
        } catch (error) {
            console.error('Error updating order status:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Get completed orders for history view
     * @param {Number} page - Page number (default: 1)
     * @param {Number} limit - Items per page (default: 50)
     * @returns {Promise} - Promise resolving to completed orders data
     */
    async getCompletedOrders(page = 1, limit = 50) {
        try {
            const response = await api.get(`/orders/completed?page=${page}&limit=${limit}`);
            return response;
        } catch (error) {
            console.error('OrderService: Get completed orders error:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Validate stock availability before placing order
     * @param {Array} items - Array of items to validate
     * @returns {Promise} - Promise resolving to validation result
     */
    async validateStockAvailability(items) {
        try {
            const validationData = {
                foodItems: items.filter(item => item.ingredients),
                liquorItems: items.filter(item => item.type && ['hard_liquor', 'beer', 'wine', 'cigarettes', 'ice_cubes', 'sandy_bottles'].includes(item.type))
            };

            const response = await api.post('/orders/validate-stock', validationData);
            return response.data;
        } catch (error) {
            console.error('Error validating stock availability:', error);
            throw this.handleError(error);
        }
    }

    /**
     * Handle API errors consistently
     * @param {Object} error - Error object from API call
     * @returns {Error} - Formatted error object
     */
    handleError(error) {
        console.error('OrderService handleError:', error);
        
        if (error.response?.data) {
            const { message, details, errors } = error.response.data;
            const errorMessage = message || 'Server error occurred';
            const errorDetails = details || errors || null;
            
            const customError = new Error(errorMessage);
            customError.details = errorDetails;
            customError.status = error.response.status;
            return customError;
        } else if (error.request) {
            // Network error - no response received
            return new Error('Network error: Unable to connect to server. Please check your connection and try again.');
        } else if (error.message) {
            // Request setup error
            return new Error(`Request error: ${error.message}`);
        } else {
            // Unknown error
            return new Error('An unexpected error occurred while processing your request.');
        }
    }
}

export const orderService = new OrderService();
