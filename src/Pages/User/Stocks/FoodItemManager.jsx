import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PrimaryButton, SecondaryButton } from '../../../components/Button';
import { InputField } from '../../../components/InputField';
import Select from '../../../components/Select';
import Modal from '../../../components/Modal';
import LoadingSpinner from '../../../components/LoadingSpinner';
import SmartIngredientInput from './components/SmartIngredientInput';
import { useFoodItems } from '../../../hooks/useFoodItems';
import { useStock } from '../../../hooks/useStock';
import foodItemService from '../../../services/foodItemService';

const FoodItemManager = () => {
    const {
        foodItems,
        loading,
        error,
        fetchFoodItems,
        createFoodItem,
        updateFoodItem,
        deleteFoodItem,
        seedFoodItems,
        clearError
    } = useFoodItems();

    // Add stock hook to get available stock items for ingredients
    const { stockItems, fetchStockItems } = useStock();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [submitLoading, setSubmitLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: 'Rice Dishes',
        localPrice: '',
        foreignPrice: '',
        basePrice: '', // Keep for backward compatibility
        ingredients: [],
        nutritionalInfo: {
            calories: '',
            protein: '',
            carbs: '',
            fat: ''
        },
        allergens: []
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    // Load data on component mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            await fetchFoodItems();
            await fetchStockItems(); // Also fetch stock items for ingredient suggestions
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    // Clear errors and messages when modal closes
    useEffect(() => {
        if (!showModal) {
            setErrors({});
            setSuccessMessage('');
            clearError();
        }
    }, [showModal, clearError]);

    // Handle input changes
    const handleInputChange = useCallback((field, event) => {
        const value = typeof event === 'object' && event.target ? event.target.value : event;
        
        setFormData(prev => {
            if (field.includes('.')) {
                const [parent, child] = field.split('.');
                return {
                    ...prev,
                    [parent]: {
                        ...prev[parent],
                        [child]: value
                    }
                };
            }
            return { ...prev, [field]: value };
        });

        // Clear field-specific error
        if (errors[field]) {
            const newErrors = { ...errors };
            delete newErrors[field];
            setErrors(newErrors);
        }
        
        // Clear general errors when user starts typing
        if (errors.general) {
            const newErrors = { ...errors };
            delete newErrors.general;
            setErrors(newErrors);
        }
    }, [errors]);

    // Handle ingredient changes
    const handleIngredientChange = useCallback((index, field, value) => {
        setFormData(prev => {
            const newIngredients = [...prev.ingredients];
            newIngredients[index] = { ...newIngredients[index], [field]: value };
            return { ...prev, ingredients: newIngredients };
        });
    }, []);

    // Add new ingredient
    const addIngredient = useCallback(() => {
        setFormData(prev => ({
            ...prev,
            ingredients: [...prev.ingredients, {
                id: Date.now() + Math.random(), // Unique ID for React key
                name: '',
                quantity: '',
                unit: 'g',
                cost: 0
            }]
        }));
    }, []);

    // Remove ingredient
    const removeIngredient = useCallback((index) => {
        setFormData(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter((_, i) => i !== index)
        }));
    }, []);

    // Reset form
    const resetForm = useCallback(() => {
        setFormData({
            name: '',
            description: '',
            category: 'Rice Dishes',
            localPrice: '',
            foreignPrice: '',
            basePrice: '', // Keep for backward compatibility
            ingredients: [],
            nutritionalInfo: {
                calories: '',
                protein: '',
                carbs: '',
                fat: ''
            },
            allergens: []
        });
        setEditingItem(null);
        setErrors({});
        setSuccessMessage('');
    }, []);

    // Handle add new
    const handleAdd = useCallback(() => {
        resetForm();
        setShowModal(true);
    }, [resetForm]);

    // Handle edit
    const handleEdit = useCallback((item) => {
        setEditingItem(item);
        setFormData({
            name: item.name || '',
            description: item.description || '',
            category: item.category || 'Rice Dishes',
            localPrice: item.localPrice?.toString() || item.sellingPrice?.toString() || '',
            foreignPrice: item.foreignPrice?.toString() || item.sellingPrice?.toString() || '',
            basePrice: item.basePrice?.toString() || '',
            ingredients: (item.ingredients || []).map(ingredient => ({
                ...ingredient,
                id: ingredient.id || Date.now() + Math.random() // Add ID if missing
            })),
            nutritionalInfo: {
                calories: item.nutritionalInfo?.calories?.toString() || '',
                protein: item.nutritionalInfo?.protein?.toString() || '',
                carbs: item.nutritionalInfo?.carbs?.toString() || '',
                fat: item.nutritionalInfo?.fat?.toString() || ''
            },
            allergens: item.allergens || []
        });
        setShowModal(true);
    }, []);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Clear any existing errors first
        setErrors({});
        setSuccessMessage('');
        
        // Custom validation for dual pricing
        const newErrors = {};
        
        if (!formData.name?.trim()) {
            newErrors.name = 'Food item name is required';
        }
        
        const localPriceValue = formData.localPrice?.toString().trim();
        const foreignPriceValue = formData.foreignPrice?.toString().trim();
        
        if (!localPriceValue || localPriceValue === '' || isNaN(parseFloat(localPriceValue)) || parseFloat(localPriceValue) <= 0) {
            newErrors.localPrice = 'Local price must be greater than 0';
        }
        
        if (!foreignPriceValue || foreignPriceValue === '' || isNaN(parseFloat(foreignPriceValue)) || parseFloat(foreignPriceValue) <= 0) {
            newErrors.foreignPrice = 'Foreign price must be greater than 0';
        }
        
        if (!formData.category?.trim()) {
            newErrors.category = 'Category is required';
        }
        
        // Check if there are validation errors
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            setSubmitLoading(true);
            
            const submitData = {
                name: formData.name.trim(),
                description: formData.description?.trim() || '',
                category: formData.category,
                localPrice: parseFloat(formData.localPrice),
                foreignPrice: parseFloat(formData.foreignPrice),
                basePrice: parseFloat(formData.basePrice) || 0,
                // Keep backward compatibility - use localPrice as default sellingPrice
                sellingPrice: parseFloat(formData.localPrice),
                ingredients: formData.ingredients.map(ingredient => {
                    // Remove the temporary id field before submitting
                    const { id, ...ingredientData } = ingredient;
                    return {
                        ...ingredientData,
                        quantity: parseFloat(ingredientData.quantity) || 0,
                        cost: parseFloat(ingredientData.cost) || 0
                    };
                }),
                nutritionalInfo: {
                    calories: parseFloat(formData.nutritionalInfo.calories) || 0,
                    protein: parseFloat(formData.nutritionalInfo.protein) || 0,
                    carbs: parseFloat(formData.nutritionalInfo.carbs) || 0,
                    fat: parseFloat(formData.nutritionalInfo.fat) || 0
                },
                allergens: formData.allergens || []
            };

            if (editingItem) {
                await updateFoodItem(editingItem._id, submitData);
                setSuccessMessage('Food item updated successfully!');
            } else {
                await createFoodItem(submitData);
                setSuccessMessage('Food item created successfully!');
            }

            setShowModal(false);
            resetForm();
            
            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (error) {
            console.error('Error submitting form:', error);
            setErrors({ general: ['Failed to save food item. Please try again.'] });
        } finally {
            setSubmitLoading(false);
        }
    };

    // Handle delete
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this food item?')) return;

        try {
            await deleteFoodItem(id);
        } catch (error) {
            console.error('Error deleting food item:', error);
        }
    };

    // Seed sample data
    const handleSeedData = async () => {
        if (!window.confirm('This will add sample food items. Continue?')) return;

        try {
            await seedFoodItems();
        } catch (error) {
            console.error('Error seeding data:', error);
        }
    };

    // Filter food items
    const filteredFoodItems = useMemo(() => {
        return foodItems.filter(item => {
            const matchesSearch = !searchTerm || 
                item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesCategory = !selectedCategory || item.category === selectedCategory;
            
            return matchesSearch && matchesCategory;
        });
    }, [foodItems, searchTerm, selectedCategory]);

    if (loading && foodItems.length === 0) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Food Item Management</h1>
                        <p className="text-gray-600 mt-1">Manage food items with ingredients and portions</p>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                        <SecondaryButton onClick={handleSeedData}>
                            🌱 Add Sample Items
                        </SecondaryButton>
                        <PrimaryButton onClick={handleAdd}>
                            ➕ Add New Food Item
                        </PrimaryButton>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                    <div className="flex-1">
                        <InputField
                            label=""
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search food items..."
                            className="w-full"
                        />
                    </div>
                    <div className="sm:w-48">
                        <Select
                            label=""
                            value={selectedCategory}
                            onChange={(value) => setSelectedCategory(value)}
                            options={[
                                { value: '', label: 'All Categories' },
                                ...foodItemService.getFoodCategoryOptions()
                            ]}
                        />
                    </div>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6">
                    <div className="flex items-center">
                        <span className="text-red-500 text-xl mr-2">❌</span>
                        <span className="font-semibold">{error}</span>
                    </div>
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-50 border-2 border-green-300 text-green-700 px-4 py-3 rounded-lg mb-6">
                    <div className="flex items-center">
                        <span className="text-green-500 text-xl mr-2">✅</span>
                        <span className="font-semibold">{successMessage}</span>
                    </div>
                </div>
            )}

            {/* Food Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFoodItems.map((item) => (
                    <div key={item._id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                                    <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                                        {item.category}
                                    </span>
                                </div>
                                <div className="text-right">
                                    {/* Dual Pricing Display */}
                                    <div className="space-y-1">
                                        <div className="flex justify-end gap-4">
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">Local</div>
                                                <div className="text-sm font-bold text-blue-600">
                                                    LKR {(item.localPrice || item.sellingPrice)?.toFixed(2) || '0.00'}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">Foreign</div>
                                                <div className="text-sm font-bold text-green-600">
                                                    LKR {(item.foreignPrice || item.sellingPrice)?.toFixed(2) || '0.00'}
                                                </div>
                                            </div>
                                        </div>
                                        {item.basePrice && (
                                            <div className="text-xs text-gray-500">
                                                Cost: LKR {item.basePrice?.toFixed(2)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {item.description && (
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {item.description}
                                </p>
                            )}

                            <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Ingredients:</span>
                                    <span className="font-medium">{item.ingredients?.length || 0} items</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Local Profit:</span>
                                        <span className="font-medium text-blue-600">
                                            LKR {((item.localPrice || item.sellingPrice || 0) - (item.basePrice || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Foreign Profit:</span>
                                        <span className="font-medium text-green-600">
                                            LKR {((item.foreignPrice || item.sellingPrice || 0) - (item.basePrice || 0)).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <SecondaryButton
                                    onClick={() => handleEdit(item)}
                                    className="flex-1 text-sm"
                                >
                                    ✏️ Edit
                                </SecondaryButton>
                                <SecondaryButton
                                    onClick={() => handleDelete(item._id)}
                                    className="flex-1 text-sm text-red-600 border-red-300 hover:bg-red-50"
                                >
                                    🗑️ Delete
                                </SecondaryButton>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredFoodItems.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🍽️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Food Items Found</h3>
                    <p className="text-gray-500 mb-6">Get started by adding your first food item.</p>
                    <PrimaryButton onClick={handleAdd}>
                        Add Food Item
                    </PrimaryButton>
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editingItem ? 'Edit Food Item' : 'Add New Food Item'}
                size="xl"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* General Error Display */}
                    {(errors.general || Object.keys(errors).length > 0) && (
                        <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-3 rounded-lg">
                            <div className="flex items-center">
                                <div className="text-red-500 text-xl mr-2">⚠️</div>
                                <div>
                                    <h4 className="font-semibold text-red-800 mb-2">Validation Failed</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {errors.general && errors.general.map((error, index) => (
                                            <li key={`general-error-${index}`} className="text-red-700">{error}</li>
                                        ))}
                                        {errors.name && <li className="text-red-700">{errors.name}</li>}
                                        {errors.localPrice && <li className="text-red-700">{errors.localPrice}</li>}
                                        {errors.foreignPrice && <li className="text-red-700">{errors.foreignPrice}</li>}
                                        {errors.category && <li className="text-red-700">{errors.category}</li>}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            📝 Basic Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Food Item Name *"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e)}
                                required
                                placeholder="Enter food item name"
                                error={errors.name}
                                className={errors.name ? "border-red-500 focus:border-red-500" : ""}
                            />
                            <Select
                                label="Category *"
                                value={formData.category}
                                onChange={(value) => handleInputChange('category', value)}
                                options={foodItemService.getFoodCategoryOptions()}
                                required
                                error={errors.category}
                                className={errors.category ? "border-red-500 focus:border-red-500" : ""}
                            />
                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e)}
                                    placeholder="Enter item description"
                                    rows={3}
                                    className={`w-full px-4 py-2 border-2 rounded-lg focus:outline-none hover:border-gray-400 placeholder:text-gray-400 ${
                                        errors.description 
                                            ? 'border-red-500 focus:border-red-500' 
                                            : 'border-gray-300 focus:border-yellow-500'
                                    }`}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            💰 Pricing Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField
                                label="Base Cost (LKR)"
                                type="number"
                                value={formData.basePrice}
                                onChange={(e) => handleInputChange('basePrice', e)}
                                min="0"
                                placeholder="0.00"
                            />
                            <InputField
                                label="Local Price (LKR) *"
                                type="number"
                                value={formData.localPrice}
                                onChange={(e) => handleInputChange('localPrice', e)}
                                required
                                placeholder="0.00"
                                error={errors.localPrice}
                                className={errors.localPrice ? "border-red-500 focus:border-red-500" : ""}
                            />
                            <InputField
                                label="Foreign Price (LKR) *"
                                type="number"
                                value={formData.foreignPrice}
                                onChange={(e) => handleInputChange('foreignPrice', e)}
                                step="0.01"
                                min="0.01"
                                required
                                placeholder="0.00"
                                error={errors.foreignPrice}
                                className={errors.foreignPrice ? "border-red-500 focus:border-red-500" : ""}
                            />
                        </div>
                    </div>

                    {/* Ingredients */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                🥘 Ingredients
                            </h3>
                            <SecondaryButton type="button" onClick={addIngredient}>
                                ➕ Add Ingredient
                            </SecondaryButton>
                        </div>

                        <div className="space-y-4">
                            {formData.ingredients.map((ingredient, index) => (
                                <SmartIngredientInput
                                    key={ingredient.id || `ingredient-${index}`}
                                    ingredient={ingredient}
                                    index={index}
                                    stockItems={stockItems}
                                    onIngredientChange={handleIngredientChange}
                                    onRemove={removeIngredient}
                                    availableUnits={foodItemService.getAvailableUnits()}
                                />
                            ))}
                        </div>

                        {formData.ingredients.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                <div className="text-4xl mb-2">🥘</div>
                                <p>No ingredients added yet. Click "Add Ingredient" to start.</p>
                            </div>
                        )}
                    </div>

                    {/* Nutritional Information (Optional) */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            📊 Nutritional Information (Optional)
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <InputField
                                label="Calories"
                                type="number"
                                value={formData.nutritionalInfo.calories}
                                onChange={(e) => handleInputChange('nutritionalInfo.calories', e)}
                                min="0"
                                placeholder="0"
                            />
                            <InputField
                                label="Protein (g)"
                                type="number"
                                value={formData.nutritionalInfo.protein}
                                onChange={(e) => handleInputChange('nutritionalInfo.protein', e)}
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                            />
                            <InputField
                                label="Carbs (g)"
                                type="number"
                                value={formData.nutritionalInfo.carbs}
                                onChange={(e) => handleInputChange('nutritionalInfo.carbs', e)}
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                            />
                            <InputField
                                label="Fat (g)"
                                type="number"
                                value={formData.nutritionalInfo.fat}
                                onChange={(e) => handleInputChange('nutritionalInfo.fat', e)}
                                step="0.1"
                                min="0"
                                placeholder="0.0"
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end gap-3 p-4 border-t">
                        <SecondaryButton type="button" onClick={() => setShowModal(false)}>
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton 
                            type="submit" 
                            disabled={submitLoading}
                            className={Object.keys(errors).length > 0 ? "opacity-75" : ""}
                        >
                            {(() => {
                                if (submitLoading) return 'Saving...';
                                if (Object.keys(errors).length > 0) return 'Fix Errors & Save';
                                return editingItem ? 'Update Food Item' : 'Create Food Item';
                            })()}
                        </PrimaryButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default FoodItemManager;
