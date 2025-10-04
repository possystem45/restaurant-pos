import React, { useState, useEffect } from 'react';
import { useLiquor } from '../../../hooks/useLiquor';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ConfirmationModal from '../../../components/ConfirmationModal';
import { PrimaryButton, SecondaryButton } from '../../../components/Button';
import { InputField } from '../../../components/InputField';
import Select from '../../../components/Select';
import LiquorStockForm from './components/LiquorStockForm';
import LiquorItemCard from './components/LiquorItemCard';
import LiquorBilling from './components/LiquorBilling';

const LIQUOR_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'hard_liquor', label: 'Hard Liquor' },
  { value: 'beer', label: 'Beer' },
  { value: 'cigarettes', label: 'Cigarettes' },
  { value: 'ice_cubes', label: 'Ice Cubes' },
  { value: 'sandy_bottles', label: 'Sandy Bottles' },
  { value: 'bites', label: 'Bites' }
];

export default function LiquorManagerWithAPI() {
  const {
    loading,
    error,
    analytics,
    fetchLiquorItems,
    createLiquorItem,
    updateLiquorItem,
    deleteLiquorItem,
    getItemsByType,
    getLowStockFromState,
    clearError
  } = useLiquor();

  const [editingItem, setEditingItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, item: null });
  const [activeTab, setActiveTab] = useState('items'); // 'items', 'analytics', 'billing'
  const [billingOpen, setBillingOpen] = useState(false);
  const [recentSales, setRecentSales] = useState([]);

  // Fetch liquor items on component mount
  useEffect(() => {
    fetchLiquorItems();
  }, [fetchLiquorItems]);

  // Handle liquor form submission
  const handleLiquorSubmit = async (formData) => {
    try {
      if (editingItem) {
        // Update existing item
        const result = await updateLiquorItem(editingItem._id, formData);
      } else {
        // Create new item
        const result = await createLiquorItem(formData);
      }
      setShowForm(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error handling liquor submission:', error);
      // Don't rethrow - let the form handle the error display
      throw error;
    }
  };

  // Handle sale completion
  const handleSaleComplete = (saleData) => {
    setRecentSales(prev => [...prev, { ...saleData, timestamp: new Date() }]);
    // Refresh liquor items to show updated stock
    fetchLiquorItems();
  };

  // Handle edit
  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = (item) => {
    setDeleteConfirm({ show: true, item });
  };

  const confirmDelete = async () => {
    try {
      await deleteLiquorItem(deleteConfirm.item._id);
      setDeleteConfirm({ show: false, item: null });
    } catch (error) {
      // Error is handled by the hook
      console.error('Delete error:', error);
    }
  };

  // Filter and search items
  const filteredItems = React.useMemo(() => {
    let items = showLowStock ? getLowStockFromState() : getItemsByType(typeFilter);
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      items = items.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.brand.toLowerCase().includes(search) ||
        item.type.toLowerCase().includes(search)
      );
    }
    
    return items;
  }, [typeFilter, searchTerm, showLowStock, getItemsByType, getLowStockFromState]);

  return (
    <div className="p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Liquor Management</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your liquor inventory, portions, and stock levels</p>
        </div>
        <PrimaryButton
          onClick={() => {
            setEditingItem(null);
            setShowForm(true);
          }}
          className='flex items-center text-sm sm:text-base px-3 sm:px-4 py-2'
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">Add New Liquor</span>
          <span className="sm:hidden">Add</span>
        </PrimaryButton>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex justify-between items-center">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-2 sm:ml-3">
                <p className="text-xs sm:text-sm text-red-700">{error}</p>
              </div>
            </div>
            <button onClick={clearError} className="text-red-400 hover:text-red-600">
              <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Only show items tab and its content */}
      {/* Filters and Search */}
      <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <InputField
              type="text"
              placeholder="Search liquor items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-sm sm:text-base"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={typeFilter}
              onChange={(value) => setTypeFilter(value)}
              options={LIQUOR_TYPES}
              className="text-sm sm:text-base"
            />
          </div>
        </div>
        <label className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-50 rounded-lg whitespace-nowrap w-fit">
          <input
            type="checkbox"
            checked={showLowStock}
            onChange={(e) => setShowLowStock(e.target.checked)}
            className="rounded border-gray-300 text-primaryColor focus:ring-primaryColor"
          />
          <span className="text-xs sm:text-sm text-gray-700">Low Stock Only</span>
        </label>
      </div>

      {/* Loading */}
      {loading && <LoadingSpinner />}

      {/* Liquor Items Grid */}
      {!loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 items-start">
          {filteredItems.map((item) => (
            <LiquorItemCard
              key={item._id}
              item={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <svg className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm sm:text-base font-medium text-gray-900">No liquor items found</h3>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 px-4">
            {searchTerm || typeFilter !== 'all' || showLowStock
              ? 'Try adjusting your filters or search term.'
              : 'Get started by adding your first liquor item.'}
          </p>
        </div>
      )}

      {/* Modals */}
      {showForm && (
        <LiquorStockForm
          item={editingItem}
          onSubmit={handleLiquorSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
        />
      )}

      <ConfirmationModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, item: null })}
        onConfirm={confirmDelete}
        title="Delete Liquor Item"
        message={`Are you sure you want to delete "${deleteConfirm.item?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700 focus:ring-red-500"
      />
    </div>
  );
}
