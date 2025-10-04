import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../../../../components/InputField';
import Select from '../../../../components/Select';
import { PrimaryButton, SecondaryButton } from '../../../../components/Button';
import { formatQuantity } from '../../../../utils/numberFormat';

const categories = [
        { value: 'food', label: 'Food Items' },
        { value: 'drinks', label: 'Drinks & Beverages' },
        { value: 'ingredients', label: 'Ingredients' },
        { value: 'supplies', label: 'Kitchen Supplies' }
    ];

const units = [
        { value: 'g', label: 'Grams (g)' },
        { value: 'kg', label: 'Kilograms (kg)' },
        { value: 'ml', label: 'Milliliters (ml)' },
        { value: 'l', label: 'Liters (l)' },
        { value: 'piece', label: 'Pieces (piece)' },
        { value: 'tbsp', label: 'Tablespoons (tbsp)' },
        { value: 'tsp', label: 'Teaspoons (tsp)' },
        { value: 'cup', label: 'Cups' },
        { value: 'bottle', label: 'Bottles' },
        { value: 'box', label: 'Boxes' },
        { value: 'pack', label: 'Packs' }
    ];

export default function StockForm({ 
    editingItem = null, 
    onSubmit, 
    onCancel 
}) {
    const [formData, setFormData] = useState({
        name: '',
        category: 'ingredients', // Default to ingredients
        quantity: '',
        unit: 'g', // Default to grams
        price: '',
        buyingPrice: '', // New field for buying price
        minimumQuantity: '5', // Default minimum quantity
        supplier: '',
        description: '',
        expiryDate: ''
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (editingItem) {
            
            // Format expiry date for input field (YYYY-MM-DD format)
            let formattedExpiryDate = '';
            if (editingItem.expiryDate) {
                try {
                    const date = new Date(editingItem.expiryDate);
                    if (!isNaN(date.getTime())) {
                        formattedExpiryDate = date.toISOString().split('T')[0];
                    }
                } catch (error) {
                    console.warn('Invalid expiry date format:', editingItem.expiryDate);
                }
            }
            
            const formattedData = {
                name: editingItem.name || '',
                category: editingItem.category || 'ingredients',
                quantity: editingItem.quantity ? formatQuantity(editingItem.quantity) : '',
                unit: editingItem.unit || 'g',
                price: editingItem.price ? formatQuantity(editingItem.price) : '',
                buyingPrice: editingItem.buyingPrice ? formatQuantity(editingItem.buyingPrice) : (editingItem.price ? formatQuantity(editingItem.price * 0.8) : ''), // Fallback to 80% of selling price if no buying price
                minimumQuantity: editingItem.minimumQuantity ? formatQuantity(editingItem.minimumQuantity) : '5',
                supplier: editingItem.supplier || '',
                description: editingItem.description || '',
                expiryDate: formattedExpiryDate
            };
            
            setFormData(formattedData);
            setErrors({});
        } else {
            // Reset form for new item
            setFormData({
                name: '',
                category: 'ingredients',
                quantity: '',
                unit: 'g',
                price: '',
                buyingPrice: '', // Add buying price
                minimumQuantity: '5',
                supplier: '',
                description: '',
                expiryDate: ''
            });
            setErrors({});
        }
    }, [editingItem]);

    const validateForm = (data) => {
        const newErrors = {};
        
        // Name validation - must match backend pattern and length requirements
        if (!data.name?.trim()) {
            newErrors.name = 'Item name is required';
        } else if (data.name.trim().length < 2 || data.name.trim().length > 50) {
            newErrors.name = 'Item name must be between 2 and 50 characters';
        } else if (!/^[a-zA-Z0-9\s\-&]+$/.test(data.name.trim())) {
            newErrors.name = 'Item name can only contain letters, numbers, spaces, hyphens, and ampersands';
        }
        
        // Category validation - must be one of the allowed values
        const allowedCategories = ['ingredients', 'food', 'drinks', 'supplies'];
        if (!data.category) {
            newErrors.category = 'Category is required';
        } else if (!allowedCategories.includes(data.category)) {
            newErrors.category = 'Invalid category selected';
        }
        
        // Quantity validation
        const quantity = parseFloat(data.quantity);
        if (!data.quantity || quantity <= 0) {
            newErrors.quantity = 'Valid quantity is required';
        }
        
        // Unit validation
        if (!data.unit) {
            newErrors.unit = 'Unit is required';
        }
        
        // Price validation
        const price = parseFloat(data.price);
        if (!data.price || price <= 0) {
            newErrors.price = 'Valid selling price is required';
        }
        
        // Buying price validation
        const buyingPrice = parseFloat(data.buyingPrice);
        if (!data.buyingPrice || buyingPrice <= 0) {
            newErrors.buyingPrice = 'Valid buying price is required';
        }
        
        // Validate that selling price is higher than buying price
        if (price > 0 && buyingPrice > 0 && price <= buyingPrice) {
            newErrors.price = 'Selling price must be higher than buying price';
        }
        
        // Minimum quantity validation - must be non-negative and not greater than quantity
        const minQuantity = parseFloat(data.minimumQuantity);
        if (data.minimumQuantity === '' || minQuantity < 0) {
            newErrors.minimumQuantity = 'Minimum quantity must be 0 or greater';
        } else if (minQuantity > quantity) {
            newErrors.minimumQuantity = 'Minimum quantity cannot be greater than current quantity';
        }
        
        return newErrors;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        const validationErrors = validateForm(formData);
        setErrors(validationErrors);
        
        if (Object.keys(validationErrors).length === 0) {
            const submissionData = {
                name: formData.name.trim(),
                category: formData.category,
                quantity: parseFloat(formData.quantity),
                unit: formData.unit,
                price: parseFloat(formData.price),
                buyingPrice: parseFloat(formData.buyingPrice), // Add buying price
                minimumQuantity: parseFloat(formData.minimumQuantity),
            };

            // Add optional fields only if they have values
            if (formData.supplier && formData.supplier.trim()) {
                submissionData.supplier = formData.supplier.trim();
            }
            
            if (formData.description && formData.description.trim()) {
                submissionData.description = formData.description.trim();
            }
            
            // Handle expiry date properly - only add if it has a value
            if (formData.expiryDate && formData.expiryDate.trim()) {
                submissionData.expiryDate = formData.expiryDate;
            }

            onSubmit(submissionData);
        }
    };

    return (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-other1 mb-4">
                {editingItem ? 'Update Stock Item' : 'Add New Stock Item'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Item Name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        placeholder="Enter item name"
                        required
                        error={errors.name}
                    />

                    <Select
                        label="Category"
                        value={formData.category}
                        onChange={(value) => setFormData({...formData, category: value})}
                        options={categories}
                        required
                        error={errors.category}
                    />
                </div>

                {/* Quantity and Price */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <InputField
                        label="Quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        placeholder="0"
                        min="0.01"
                        step="0.01"
                        required
                        error={errors.quantity}
                    />

                    <Select
                        label="Unit"
                        value={formData.unit}
                        onChange={(value) => setFormData({...formData, unit: value})}
                        options={units}
                        required
                        error={errors.unit}
                    />

                    <InputField
                        label="Buying Price per Unit (LKR)"
                        type="number"
                        value={formData.buyingPrice}
                        onChange={(e) => setFormData({...formData, buyingPrice: e.target.value})}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        required
                        error={errors.buyingPrice}
                    />

                    <InputField
                        label="Selling Price per Unit (LKR)"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        placeholder="0.00"
                        min="0.01"
                        step="0.01"
                        required
                        error={errors.price}
                    />
                </div>

                {/* Additional Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Minimum Quantity"
                        type="number"
                        value={formData.minimumQuantity}
                        onChange={(e) => setFormData({...formData, minimumQuantity: e.target.value})}
                        placeholder="5"
                        min="0"
                        step="0.01"
                        required
                        error={errors.minimumQuantity}
                    />

                    <InputField
                        label="Supplier (Optional)"
                        type="text"
                        value={formData.supplier}
                        onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                        placeholder="Enter supplier name"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField
                        label="Description (Optional)"
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Enter item description"
                    />

                    <InputField
                        label="Expiry Date (Optional)"
                        type="date"
                        value={formData.expiryDate}
                        onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                    <PrimaryButton type="submit">
                        {editingItem ? 'Update Item' : 'Add Item'}
                    </PrimaryButton>
                    {onCancel && (
                        <SecondaryButton type="button" onClick={onCancel}>
                            Cancel
                        </SecondaryButton>
                    )}
                </div>
            </form>
        </div>
    );
}

StockForm.propTypes = {
    editingItem: PropTypes.shape({
        _id: PropTypes.string,
        name: PropTypes.string,
        category: PropTypes.string,
        quantity: PropTypes.number,
        unit: PropTypes.string,
        price: PropTypes.number,
        buyingPrice: PropTypes.number, // Add buying price
        minimumQuantity: PropTypes.number,
        supplier: PropTypes.string,
        description: PropTypes.string,
        expiryDate: PropTypes.string
    }),
    onSubmit: PropTypes.func.isRequired,
    onCancel: PropTypes.func
};

StockForm.defaultProps = {
    editingItem: null,
    onCancel: null
};
