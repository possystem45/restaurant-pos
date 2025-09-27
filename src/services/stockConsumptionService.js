const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class StockConsumptionService {
  
  /**
   * Process bill payment and consume stock for all items
   * @param {Object} billData - The bill data with items
   * @returns {Promise} - Result of stock consumption
   */
  async processBillPayment(billData) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/process-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(billData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to process payment: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing bill payment:', error);
      throw error;
    }
  }

  /**
   * Consume stock for a single liquor item
   * @param {string} liquorId - The liquor item ID
   * @param {number} quantity - Quantity to consume
   * @param {number} volume - Volume per portion (for hard liquor)
   * @returns {Promise} - Result of stock consumption
   */
  async consumeLiquorStock(liquorId, quantity, volume = null) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${liquorId}/consume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          quantity,
          volume: volume || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to consume stock: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error consuming liquor stock:', error);
      throw error;
    }
  }

  /**
   * Get sales analytics for a liquor item
   * @param {string} liquorId - The liquor item ID
   * @returns {Promise} - Sales analytics data
   */
  async getLiquorSalesAnalytics(liquorId) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${liquorId}/analytics`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch sales analytics: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching sales analytics:', error);
      throw error;
    }
  }

  /**
   * Get overall liquor sales summary
   * @returns {Promise} - Overall sales summary
   */
  async getOverallSalesAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/analytics/sales`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch overall analytics: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching overall analytics:', error);
      throw error;
    }
  }
}

export const stockConsumptionService = new StockConsumptionService();
export default stockConsumptionService;
