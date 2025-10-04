import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { InputField } from '../../../../components/InputField';
import SelectField from '../../../../components/SelectField';
import Button from '../../../../components/Button';
import Modal from '../../../../components/Modal';

const LIQUOR_TYPES = [
  { value: 'whiskey', label: 'Whiskey' },
  { value: 'vodka', label: 'Vodka' },
  { value: 'rum', label: 'Rum' },
  { value: 'gin', label: 'Gin' },
  { value: 'brandy', label: 'Brandy' },
  { value: 'tequila', label: 'Tequila' },
  { value: 'beer', label: 'Beer' },
  { value: 'wine', label: 'Wine' },
  { value: 'bites', label: 'Bites' },
  { value: 'other', label: 'Other' }
];

const BOTTLE_VOLUMES = [
  { value: 750, label: '750ml (Standard)' },
  { value: 1000, label: '1000ml (1 Liter)' }
];

// Generate standard portions for a bottle volume
const generateStandardPortions = (bottleVolume) => {
  return [
    { name: '25ml Shot', volume: 25, price: 0 },
    { name: '50ml Shot', volume: 50, price: 0 },
    { name: '75ml Shot', volume: 75, price: 0 },
    { name: '100ml Shot', volume: 100, price: 0 },
    { name: 'Quarter Bottle', volume: bottleVolume / 4, price: 0 },
    { name: 'Half Bottle', volume: bottleVolume / 2, price: 0 },
    { name: 'Full Bottle', volume: bottleVolume, price: 0 }
  ];
};

export default function LiquorForm({ item, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    type: 'whiskey',
    bottleVolume: 750,
    bottlesInStock: 0,
    // Dual Pricing Fields
    localPrice: '',
    foreignPrice: '',
    // Keep for backward compatibility
    pricePerBottle: '',
    minimumBottles: 2,
    supplier: '',
    alcoholPercentage: '',
    description: '',
    portions: [],
    // Bites-specific fields
    platesInStock: 0,
    localPricePerPlate: '',
    foreignPricePerPlate: '',
    // Keep for backward compatibility
    pricePerPlate: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when item changes
  useEffect(() => {
    if (item) {
      setFormData({
        mode: 'edit',
        id: item._id,
        name: item.name || '',
        brand: item.brand || '',
        type: item.type || 'whiskey',
        bottleVolume: item.bottleVolume || 750,
        bottlesInStock: item.bottlesInStock || 0,
        // Dual pricing for liquor
        localPrice: item.localPrice?.toString() || item.pricePerBottle?.toString() || '',
        foreignPrice: item.foreignPrice?.toString() || item.pricePerBottle?.toString() || '',
        pricePerBottle: item.pricePerBottle?.toString() || '',
        minimumBottles: item.minimumBottles || 2,
        supplier: item.supplier || '',
        alcoholPercentage: item.alcoholPercentage?.toString() || '',
        description: item.description || '',
        portions: item.portions || [],
        // Bites-specific fields with dual pricing
        platesInStock: item.platesInStock || 0,
        localPricePerPlate: item.localPricePerPlate?.toString() || item.pricePerPlate?.toString() || '',
        foreignPricePerPlate: item.foreignPricePerPlate?.toString() || item.pricePerPlate?.toString() || '',
        pricePerPlate: item.pricePerPlate?.toString() || ''
      });
    } else {
      const initialPortions = generateStandardPortions(750);
      setFormData({
        mode: 'new',
        name: '',
        brand: '',
        type: 'whiskey',
        bottleVolume: 750,
        bottlesInStock: 0,
        // Dual pricing for new items
        localPrice: '',
        foreignPrice: '',
        pricePerBottle: '',
        minimumBottles: 2,
        supplier: '',
        alcoholPercentage: '',
        description: '',
        portions: initialPortions,
        // Bites-specific fields with dual pricing
        platesInStock: 0,
        localPricePerPlate: '',
        foreignPricePerPlate: '',
        pricePerPlate: ''
      });
    }
    setErrors({});
  }, [item]);

  // Auto-generate portions when bottle volume changes for new items
  useEffect(() => {
    if (formData.mode === 'new' && formData.type !== 'beer') {
      const newPortions = generateStandardPortions(formData.bottleVolume);
      setFormData(prev => ({
        ...prev,
        portions: newPortions
      }));
    }
  }, [formData.bottleVolume, formData.type]);

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    // Brand is not required for bites
    if (formData.type !== 'bites' && !formData.brand.trim()) {
      newErrors.brand = 'Brand is required';
    }

    // Different validation for bites vs other items
    if (formData.type === 'bites') {
      // Dual pricing validation for bites
      const localPriceValue = formData.localPricePerPlate?.toString().trim();
      const foreignPriceValue = formData.foreignPricePerPlate?.toString().trim();
      
      if (!localPriceValue || localPriceValue === '' || isNaN(parseFloat(localPriceValue)) || parseFloat(localPriceValue) <= 0) {
        newErrors.localPricePerPlate = 'Local price per plate must be greater than 0';
      }
      
      if (!foreignPriceValue || foreignPriceValue === '' || isNaN(parseFloat(foreignPriceValue)) || parseFloat(foreignPriceValue) <= 0) {
        newErrors.foreignPricePerPlate = 'Foreign price per plate must be greater than 0';
      }

      if (formData.platesInStock < 0) {
        newErrors.platesInStock = 'Plates in stock cannot be negative';
      }

      if (!formData.ingredients?.trim()) {
        newErrors.ingredients = 'Ingredients are required for bites';
      }
    } else {
      // Dual pricing validation for liquor
      const localPriceValue = formData.localPrice?.toString().trim();
      const foreignPriceValue = formData.foreignPrice?.toString().trim();
      
      if (!localPriceValue || localPriceValue === '' || isNaN(parseFloat(localPriceValue)) || parseFloat(localPriceValue) <= 0) {
        newErrors.localPrice = 'Local price must be greater than 0';
      }
      
      if (!foreignPriceValue || foreignPriceValue === '' || isNaN(parseFloat(foreignPriceValue)) || parseFloat(foreignPriceValue) <= 0) {
        newErrors.foreignPrice = 'Foreign price must be greater than 0';
      }

      if (formData.bottlesInStock < 0) {
        newErrors.bottlesInStock = 'Bottles in stock cannot be negative';
      }
    }

    if (formData.minimumBottles < 0) {
      newErrors.minimumBottles = 'Minimum bottles cannot be negative';
    }

    if (formData.alcoholPercentage && (parseFloat(formData.alcoholPercentage) < 0 || parseFloat(formData.alcoholPercentage) > 100)) {
      newErrors.alcoholPercentage = 'Alcohol percentage must be between 0 and 100';
    }

    // For non-beer and non-bites items, validate portion prices
    if (formData.type !== 'beer' && formData.type !== 'bites') {
      const invalidPortions = formData.portions.filter(portion => 
        !portion.price || parseFloat(portion.price) <= 0
      );
      if (invalidPortions.length > 0) {
        newErrors.portions = 'All portion prices must be greater than 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handlePortionPriceChange = (index, price) => {
    const newPortions = [...formData.portions];
    newPortions[index] = {
      ...newPortions[index],
      price: parseFloat(price) || 0
    };
    setFormData(prev => ({
      ...prev,
      portions: newPortions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const submitData = {
        ...formData,
        // Dual pricing for liquor
        localPrice: parseFloat(formData.localPrice),
        foreignPrice: parseFloat(formData.foreignPrice),
        // Keep for backward compatibility
        pricePerBottle: parseFloat(formData.localPrice),
        bottlesInStock: parseInt(formData.bottlesInStock),
        minimumBottles: parseInt(formData.minimumBottles),
        alcoholPercentage: formData.alcoholPercentage ? parseFloat(formData.alcoholPercentage) : undefined,
        // Dual pricing for bites
        localPricePerPlate: formData.type === 'bites' ? parseFloat(formData.localPricePerPlate) : undefined,
        foreignPricePerPlate: formData.type === 'bites' ? parseFloat(formData.foreignPricePerPlate) : undefined,
        // Keep for backward compatibility
        pricePerPlate: formData.type === 'bites' ? parseFloat(formData.localPricePerPlate) : undefined,
        portions: formData.type === 'beer' ? [] : formData.portions.map(portion => ({
          ...portion,
          price: parseFloat(portion.price)
        }))
      };

      // Remove empty optional fields
      if (!submitData.supplier) delete submitData.supplier;
      if (!submitData.description) delete submitData.description;
      if (!submitData.alcoholPercentage) delete submitData.alcoholPercentage;

      await onSubmit(submitData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ submit: 'Failed to save liquor item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={true} onClose={onCancel} title={item ? "Edit Liquor Item" : "Add New Liquor Item"}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            label="Liquor Name"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Jack Daniels"
            error={errors.name}
            required
          />

          {formData.type !== 'bites' && (
            <InputField
              label="Brand"
              id="brand"
              value={formData.brand}
              onChange={(e) => handleInputChange('brand', e.target.value)}
              placeholder="e.g., Jack Daniels"
              error={errors.brand}
              required
            />
          )}

          <SelectField
            label="Liquor Type"
            id="type"
            value={formData.type}
            onChange={(value) => handleInputChange('type', value)}
            error={errors.type}
            required
          >
            {LIQUOR_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </SelectField>

          {/* Bites-specific fields */}
          {formData.type === 'bites' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Local Price per Plate (LKR)"
                  id="localPricePerPlate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.localPricePerPlate}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || value === null || value === undefined) {
                      handleInputChange('localPricePerPlate', '');
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        handleInputChange('localPricePerPlate', Math.round(numValue));
                      }
                    }
                  }}
                  placeholder="500.00"
                  error={errors.localPricePerPlate}
                  required
                />
                <InputField
                  label="Foreign Price per Plate (LKR)"
                  id="foreignPricePerPlate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.foreignPricePerPlate}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || value === null || value === undefined) {
                      handleInputChange('foreignPricePerPlate', '');
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        handleInputChange('foreignPricePerPlate', Math.round(numValue));
                      }
                    }
                  }}
                  placeholder="700.00"
                  error={errors.foreignPricePerPlate}
                  required
                />
              </div>

              <InputField
                label="Plates in Stock"
                id="platesInStock"
                type="number"
                min="0"
                value={formData.platesInStock}
                onChange={(e) => handleInputChange('platesInStock', parseInt(e.target.value) || 0)}
                error={errors.platesInStock}
                required
              />
            </>
          )}

          {/* Regular liquor fields (not for bites) */}
          {formData.type !== 'bites' && (
            <>
              <SelectField
                label="Bottle Volume"
                id="bottleVolume"
                value={formData.bottleVolume}
                onChange={(value) => handleInputChange('bottleVolume', parseInt(value))}
                error={errors.bottleVolume}
                required
              >
                {BOTTLE_VOLUMES.map(vol => (
                  <option key={vol.value} value={vol.value}>{vol.label}</option>
                ))}
              </SelectField>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Local Price per Bottle (LKR)"
                  id="localPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.localPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || value === null || value === undefined) {
                      handleInputChange('localPrice', '');
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        handleInputChange('localPrice', Math.round(numValue));
                      }
                    }
                  }}
                  placeholder="45.99"
                  error={errors.localPrice}
                  required
                />
                <InputField
                  label="Foreign Price per Bottle (LKR)"
                  id="foreignPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.foreignPrice}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '' || value === null || value === undefined) {
                      handleInputChange('foreignPrice', '');
                    } else {
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        handleInputChange('foreignPrice', Math.round(numValue));
                      }
                    }
                  }}
                  placeholder="65.99"
                  error={errors.foreignPrice}
                  required
                />
              </div>

              <InputField
                label="Bottles in Stock"
                id="bottlesInStock"
                type="number"
                min="0"
                value={formData.bottlesInStock}
                onChange={(e) => handleInputChange('bottlesInStock', parseInt(e.target.value) || 0)}
                error={errors.bottlesInStock}
                required
              />

              <InputField
                label="Alcohol Percentage"
                id="alcoholPercentage"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.alcoholPercentage}
                onChange={(e) => handleInputChange('alcoholPercentage', e.target.value)}
                placeholder="40"
                error={errors.alcoholPercentage}
              />
            </>
          )}

          <InputField
            label="Minimum Bottles"
            id="minimumBottles"
            type="number"
            min="0"
            value={formData.minimumBottles}
            onChange={(e) => handleInputChange('minimumBottles', parseInt(e.target.value) || 0)}
            error={errors.minimumBottles}
            required
          />
        </div>

        {/* Optional Fields */}
        <div className="space-y-4">
          {formData.type !== 'bites' && (
            <InputField
              label="Supplier (Optional)"
              id="supplier"
              value={formData.supplier}
              onChange={(e) => handleInputChange('supplier', e.target.value)}
              placeholder="Supplier name"
            />
          )}

          {formData.type === 'bites' && (
            <div>
              <label htmlFor="ingredients" className="block text-sm font-medium text-gray-700 mb-1">
                Ingredients <span className="text-red-500">*</span>
              </label>
              <textarea
                id="ingredients"
                rows={3}
                value={formData.ingredients}
                onChange={(e) => handleInputChange('ingredients', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="List main ingredients..."
                required
              />
              {errors.ingredients && (
                <p className="text-red-500 text-sm mt-1">{errors.ingredients}</p>
              )}
            </div>
          )}

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={formData.type === 'bites' ? 'Additional details about this dish...' : 'Additional details about this liquor...'}
            />
          </div>
        </div>

        {/* Standard Portions Section */}
        {formData.type !== 'beer' && formData.type !== 'bites' && (
          <div className="border-t pt-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Standard Portion Prices</h3>
              <p className="text-sm text-gray-600">Set prices for each standard portion size</p>
            </div>

            {errors.portions && (
              <div className="text-red-600 text-sm mb-4">{errors.portions}</div>
            )}

            <div className="space-y-3">
              {formData.portions.map((portion, index) => (
                <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-700">{portion.name}</div>
                    <div className="text-sm text-gray-500">{portion.volume}ml</div>
                  </div>
                  <div className="flex-1">
                    <InputField
                      label={index === 0 ? "Price (LKR)" : ""}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={portion.price || ''}
                      onChange={(e) => handlePortionPriceChange(index, e.target.value)}
                      className="mb-0"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Error */}
        {errors.submit && (
          <div className="text-red-600 text-sm">{errors.submit}</div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : item ? 'Update Liquor' : 'Add Liquor'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

LiquorForm.propTypes = {
  item: PropTypes.object,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};
