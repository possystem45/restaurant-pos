const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class LiquorService {
  async getAllLiquors(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      const queryString = queryParams.toString();
      const url = queryString 
        ? `${API_BASE_URL}/liquor?${queryString}`
        : `${API_BASE_URL}/liquor`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch liquors: ${response.status}`);
      }
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error fetching liquors:', error);
      throw error;
    }
  }

  async getLiquorById(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch liquor: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching liquor by ID:', error);
      throw error;
    }
  }

  async createLiquor(liquorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(liquorData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create liquor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating liquor:', error);
      throw error;
    }
  }

  async updateLiquor(id, liquorData) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(liquorData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update liquor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating liquor:', error);
      throw error;
    }
  }

  async deleteLiquor(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete liquor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting liquor:', error);
      throw error;
    }
  }

  async addPortion(liquorId, portionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${liquorId}/portions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add portion: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding portion:', error);
      throw error;
    }
  }

  async updatePortion(liquorId, portionId, portionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${liquorId}/portions/${portionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update portion: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating portion:', error);
      throw error;
    }
  }

  async deletePortion(liquorId, portionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${liquorId}/portions/${portionId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to delete portion: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting portion:', error);
      throw error;
    }
  }

  async addBottlesToStock(liquorId, numberOfBottles) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${liquorId}/add-bottles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ numberOfBottles })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to add bottles: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding bottles to stock:', error);
      throw error;
    }
  }

  async consumeLiquor(liquorId, volume) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${liquorId}/consume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ volume })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to consume liquor: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error consuming liquor:', error);
      throw error;
    }
  }

  async getLowStockItems() {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/low-stock`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch low stock items: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching low stock items:', error);
      throw error;
    }
  }

  async getLiquorAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/analytics`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch analytics: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching liquor analytics:', error);
      throw error;
    }
  }

  async getLiquorsByType(type) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/type/${type}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch liquors by type: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching liquors by type:', error);
      throw error;
    }
  }

  async updateLiquorPortions(liquorId, portionsData) {
    try {
      const response = await fetch(`${API_BASE_URL}/liquor/${liquorId}/portions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(portionsData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to update portions: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating liquor portions:', error);
      throw error;
    }
  }
}

export default new LiquorService();
