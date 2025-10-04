import React, { useState, useCallback, memo, useMemo } from 'react';
import { PrimaryButton, SecondaryButton } from '../../../../components/Button';
import { InputField } from '../../../../components/InputField';
import Select from '../../../../components/Select';

// Memoize categories array to prevent recreation
const categories = [
    { value: 'Foods', label: 'Foods' },
    { value: 'Liquor', label: 'Liquor' },
    { value: 'Cigarettes', label: 'Cigarettes' },
    { value: 'Bites', label: 'Bites' },
    { value: 'Others', label: 'Others' }
];

export default memo(function MenuForm({ item, onSubmit, onCancel }) {
    const [formData, setFormData] = useState({
        name: item?.name || '',
        localPrice: item?.localPrice || item?.price || '',
        foreignPrice: item?.foreignPrice || item?.price || '',
        category: item?.category || 'Foods',
        description: item?.description || '',
        volume: item?.volume || 750,
        unitsPerPack: item?.unitsPerPack || 20,
        portionTracking: item?.portionTracking || false,
        stockId: item?.stockId || ''
    });
    
    const [errors, setErrors] = useState({});
    
    const handleInputChange = useCallback((name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);
    
    const validateForm = useCallback(() => {
        const newErrors = {};

        // Validate required fields
        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.localPrice) {
            newErrors.localPrice = 'Local price is required';
        } else if (isNaN(formData.localPrice) || Number(formData.localPrice) <= 0) {
            newErrors.localPrice = 'Local price must be a valid positive number';
        }

        if (!formData.foreignPrice) {
            newErrors.foreignPrice = 'Foreign price is required';
        } else if (isNaN(formData.foreignPrice) || Number(formData.foreignPrice) <= 0) {
            newErrors.foreignPrice = 'Foreign price must be a valid positive number';
        }
        
        if (!formData.category) {
            newErrors.category = 'Category is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        } else if (formData.description.trim().length < 5) {
            newErrors.description = 'Description must be at least 5 characters';
        }

        // Category-specific validation
        if (formData.category === 'Liquor') {
            if (!formData.volume || formData.volume <= 0) {
                newErrors.volume = 'Valid volume in milliliters is required';
            }
        }

        if (formData.category === 'Cigarettes') {
            if (!formData.unitsPerPack || formData.unitsPerPack <= 0) {
                newErrors.unitsPerPack = 'Valid number of units per pack is required';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);
    
    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        
        if (validateForm()) {
            const submitData = {
                ...formData,
                name: formData.name.trim(),
                localPrice: Number(formData.localPrice),
                foreignPrice: Number(formData.foreignPrice),
                // Keep backward compatibility
                price: Number(formData.localPrice), // Default to local price for backward compatibility
                description: formData.description.trim()
            };
            onSubmit(submitData);
        }
    }, [formData, validateForm, onSubmit]);
    
    // Memoize preview component to prevent unnecessary re-renders
    const previewComponent = useMemo(() => {
        if (!formData.name || !formData.localPrice || !formData.foreignPrice) return null;
        
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
                    <span className="text-lg">👁️</span>
                    <h4 className="text-lg font-semibold text-gray-800">Preview</h4>
                </div>
                
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg">{formData.name}</h4>
                            <div className="flex gap-2 mt-2">
                                <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
                                    {formData.category}
                                </span>
                                {formData.category === 'Liquor' && formData.volume && (
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                                        {formData.volume}ml
                                    </span>
                                )}
                                {formData.category === 'Cigarettes' && formData.unitsPerPack && (
                                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-amber-200 text-amber-800">
                                        {formData.unitsPerPack} per pack
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="space-y-1">
                                <div className="flex justify-end gap-4">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Local</div>
                                        <div className="text-sm font-bold text-blue-600">
                                            LKR {Number(formData.localPrice || 0).toLocaleString()}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500">Foreign</div>
                                        <div className="text-sm font-bold text-green-600">
                                            LKR {Number(formData.foreignPrice || 0).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {formData.description && (
                        <div className="mt-3 pt-3 border-t border-yellow-200">
                            <p className="text-sm text-gray-600 leading-relaxed">{formData.description}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }, [formData.name, formData.localPrice, formData.foreignPrice, formData.category, formData.description, formData.volume, formData.unitsPerPack]);
    
    return (
        <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header Information Card */}
                <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-yellow-100 border border-yellow-300 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🍽️</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">Menu Item Details</h3>
                            <p className="text-gray-600 text-sm">Complete the information below to {item ? 'update' : 'add'} your menu item</p>
                        </div>
                    </div>
                </div>

                {/* Basic Information Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
                        <span className="text-lg">ℹ️</span>
                        <h4 className="text-lg font-semibold text-gray-800">Basic Information</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <InputField
                            label="Item Name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            placeholder="e.g., Chicken Rice, Pizza"
                            error={errors.name}
                            required
                        />

                        {/* Local Price */}
                        <InputField
                            label="Local Price (LKR)"
                            name="localPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.localPrice}
                            onChange={(e) => handleInputChange('localPrice', e.target.value)}
                            placeholder="Enter local price in LKR"
                            error={errors.localPrice}
                            required
                        />

                        {/* Foreign Price */}
                        <InputField
                            label="Foreign Price (LKR)"
                            name="foreignPrice"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.foreignPrice}
                            onChange={(e) => handleInputChange('foreignPrice', e.target.value)}
                            placeholder="Enter foreign price in LKR"
                            error={errors.foreignPrice}
                            required
                        />

                        {/* Category */}
                        <div className="md:col-span-2">
                            <Select
                                label="Category"
                                value={formData.category}
                                onChange={(e) => handleInputChange('category', e.target.value)}
                                options={categories}
                                error={errors.category}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Category-Specific Configuration */}
                {(formData.category === 'Liquor' || formData.category === 'Cigarettes') && (
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
                            <span className="text-lg">⚙️</span>
                            <h4 className="text-lg font-semibold text-gray-800">
                                {formData.category} Configuration
                            </h4>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Liquor-specific fields */}
                            {formData.category === 'Liquor' && (
                                <InputField
                                    label="Volume (ml)"
                                    type="number"
                                    name="volume"
                                    value={formData.volume}
                                    onChange={(e) => handleInputChange('volume', e.target.value)}
                                    placeholder="Enter volume in ml"
                                    error={errors.volume}
                                    required
                                />
                            )}

                            {/* Cigarette-specific fields */}
                            {formData.category === 'Cigarettes' && (
                                <InputField
                                    label="Units Per Pack"
                                    type="number"
                                    name="unitsPerPack"
                                    value={formData.unitsPerPack}
                                    onChange={(e) => handleInputChange('unitsPerPack', e.target.value)}
                                    placeholder="Enter units per pack"
                                    error={errors.unitsPerPack}
                                    required
                                />
                            )}
                        </div>
                    </div>
                )}
                
                {/* Description Section */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
                        <span className="text-lg">📝</span>
                        <h4 className="text-lg font-semibold text-gray-800">Description</h4>
                    </div>
                    
                    <div>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            placeholder="Describe your menu item - ingredients, preparation style, etc."
                            rows={4}
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primaryColor focus:border-primaryColor focus:outline-none resize-none transition-colors ${
                                errors.description ? 'border-red-500' : 'border-gray-300'
                            }`}
                        />
                        {errors.description && (
                            <p className="text-red-500 text-sm mt-2">{errors.description}</p>
                        )}
                    </div>
                </div>
                
                {/* Preview Section */}
                {previewComponent}
                
                {/* Action Buttons */}
                <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex gap-4">
                        <SecondaryButton 
                            type="button" 
                            onClick={onCancel} 
                            className="flex-1 px-6 py-3"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton 
                            type="submit" 
                            className="flex-1 px-6 py-3"
                        >
                            {item ? 'Update Item' : 'Add Item'}
                        </PrimaryButton>
                    </div>
                </div>
            </form>
        </div>
    );
});
