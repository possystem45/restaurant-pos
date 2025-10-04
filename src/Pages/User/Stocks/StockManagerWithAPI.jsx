import React, { useState, useEffect } from 'react';
import { useStock } from '../../../hooks/useStock';
import StockForm from './components/StockForm';
import StockItemCard from './components/StockItemCard';
import LoadingSpinner from '../../../components/LoadingSpinner';
import Modal from '../../../components/Modal';
import { PrimaryButton } from '../../../components/Button';
import FoodItemManager from './FoodItemManager';

export default function StockManagerWithAPI() {
    const {
        stockItems,
        loading,
        error,
        totals,
        fetchStockItems,
        createStock,
        updateStock,
        deleteStock,
        clearError
    } = useStock();

    const [editingItem, setEditingItem] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'food-items'
    const [showStockModal, setShowStockModal] = useState(false); // Modal visibility state

    // Fetch stock items on component mount
    useEffect(() => {
        fetchStockItems();
    }, [fetchStockItems]);

    // Handle stock form submission
    const handleStockSubmit = async (formData) => {
        try {
            if (editingItem) {
                // Update existing stock item
                const result = await updateStock(editingItem._id, formData);
                alert('Stock item updated successfully!');
            } else {
                // Create new stock item
                const result = await createStock(formData);
                alert('Stock item created successfully!');
            }
            
            // Close modal and reset editing state
            setEditingItem(null);
            setShowStockModal(false);
            
        } catch (error) {
            console.error('Error saving stock item:', error);
            alert(`Error saving stock item: ${error.message}`);
        }
    };

    // Handle edit item
    const handleEditItem = (item) => {
        setEditingItem(item);
        setShowStockModal(true); // Open modal for editing
    };

    // Handle delete item
    const handleDeleteItem = async (itemId) => {
        if (window.confirm('Are you sure you want to delete this item?')) {
            try {
                await deleteStock(itemId);
            } catch (error) {
                console.error('Error deleting stock item:', error);
            }
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingItem(null);
        setShowStockModal(false); // Close modal
    };

    // Handle opening modal for new item
    const handleAddNewStock = () => {
        setEditingItem(null);
        setShowStockModal(true);
    };

    // Filter items based on category and search
    const filteredItems = stockItems.filter(item => {
        const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
        const matchesSearch = searchTerm === '' || 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.supplier?.toLowerCase().includes(searchTerm.toLowerCase());
        
        return matchesCategory && matchesSearch;
    });

    // Group items by category for display
    const getItemsByFilteredCategory = (category) => {
        return filteredItems.filter(item => item.category === category);
    };

    const categories = [
        { key: 'ingredients', name: 'Ingredients', items: getItemsByFilteredCategory('ingredients') },
        { key: 'food', name: 'Food Items', items: getItemsByFilteredCategory('food') },
        { key: 'drinks', name: 'Drinks & Beverages', items: getItemsByFilteredCategory('drinks') },
        { key: 'supplies', name: 'Kitchen Supplies', items: getItemsByFilteredCategory('supplies') }
    ];

    if (loading && stockItems.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
                <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-other1">Stock & Food Management</h1>
                <div className="text-xs sm:text-sm text-text space-y-1 bg-gray-50 p-2 sm:p-3 rounded-lg">
                    <div>Total Items: <span className="font-medium">{totals.totalItems}</span></div>
                    <div>Total Value: <span className="font-medium">LKR {totals.totalValue.toFixed(2)}</span></div>
                    <div>Low Stock: <span className="font-medium text-red-600">{totals.lowStockCount}</span></div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveTab('stock')}
                        className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                            activeTab === 'stock'
                                ? 'border-yellow-500 text-yellow-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        📦 Stock Items
                    </button>
                    <button
                        onClick={() => setActiveTab('food-items')}
                        className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                            activeTab === 'food-items'
                                ? 'border-yellow-500 text-yellow-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        🍽️ Food Items
                    </button>
                </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'stock' ? (
                <div className="space-y-4 sm:space-y-6">
                    {/* Search, Filter Controls and Add Button */}
                    <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="Search stock items..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="w-full sm:w-auto">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="all">All Categories</option>
                                    <option value="ingredients">Ingredients</option>
                                    <option value="food">Food Items</option>
                                    <option value="drinks">Drinks & Beverages</option>
                                    <option value="supplies">Kitchen Supplies</option>
                                </select>
                            </div>
                        </div>
                        <div className="w-full sm:w-auto">
                            <PrimaryButton 
                                onClick={handleAddNewStock}
                                className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2"
                            >
                                + Add New Stock Item
                            </PrimaryButton>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
                            <span>{error}</span>
                            <button
                                onClick={clearError}
                                className="text-red-700 hover:text-red-900"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {loading && stockItems.length > 0 && (
                        <div className="text-center py-4">
                            <LoadingSpinner />
                            <p className="text-gray-500 mt-2">Updating stock...</p>
                        </div>
                    )}

                    {/* Stock Items Display */}
                    <div className="space-y-4 sm:space-y-6">
                        {categoryFilter === 'all' ? (
                            // Show all categories
                            categories.map(category => (
                                category.items.length > 0 && (
                                    <div key={category.key}>
                                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 capitalize">
                                            {category.name} ({category.items.length})
                                        </h2>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                            {category.items.map(item => (
                                                <StockItemCard
                                                    key={item._id}
                                                    item={item}
                                                    onEdit={handleEditItem}
                                                    onDelete={handleDeleteItem}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )
                            ))
                        ) : (
                            // Show filtered category
                            <div>
                                <h2 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3 capitalize">
                                    {categories.find(c => c.key === categoryFilter)?.name} ({filteredItems.length})
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                                    {filteredItems.map(item => (
                                        <StockItemCard
                                            key={item._id}
                                            item={item}
                                            onEdit={handleEditItem}
                                            onDelete={handleDeleteItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Empty State */}
                    {filteredItems.length === 0 && !loading && (
                        <div className="text-center py-8 sm:py-12">
                            <div className="text-gray-400 mb-3 sm:mb-4">
                                <div className="text-4xl sm:text-6xl">📦</div>
                            </div>
                            <h3 className="text-base sm:text-lg font-semibold text-gray-600 mb-1 sm:mb-2">
                                {searchTerm || categoryFilter !== 'all' ? 'No Matching Items' : 'No Stock Items'}
                            </h3>
                            <p className="text-sm sm:text-base text-gray-500 px-4">
                                {searchTerm || categoryFilter !== 'all' 
                                    ? 'Try adjusting your search or filter criteria.'
                                    : 'Start by adding your first stock item above.'
                                }
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <FoodItemManager />
            )}

            {/* Stock Form Modal */}
            <Modal
                isOpen={showStockModal}
                onClose={handleCancelEdit}
                title={editingItem ? 'Update Stock Item' : 'Add New Stock Item'}
                size="lg"
            >
                <StockForm
                    editingItem={editingItem}
                    onSubmit={handleStockSubmit}
                    onCancel={handleCancelEdit}
                />
            </Modal>
        </div>
    );
}
