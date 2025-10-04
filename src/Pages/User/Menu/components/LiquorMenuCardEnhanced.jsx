import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { FaEdit, FaBoxes, FaSave, FaTimes } from 'react-icons/fa';
import { InputField } from '../../../../components/InputField';
import { PrimaryButton, SecondaryButton } from '../../../../components/Button';
import LiquorService from '../../../../services/liquorService';

export default function LiquorMenuCard({ liquorItem, onUpdatePortions, onEdit, onDelete }) {
  const [editingPortions, setEditingPortions] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Memoize initial portion prices
  const initialPortionPrices = useMemo(() => {
    const prices = {};
    if (liquorItem.portions?.length > 0) {
      liquorItem.portions.forEach(portion => {
        prices[portion._id] = portion.price || 0;
      });
    }
    return prices;
  }, [liquorItem.portions]);

  const [portionPrices, setPortionPrices] = useState(initialPortionPrices);

  // Update portion prices when liquorItem changes
  useEffect(() => {
    setPortionPrices(initialPortionPrices);
  }, [initialPortionPrices]);

  // Memoize utility functions
  const formatVolume = useCallback((volume) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}L`;
    }
    return `${volume}ml`;
  }, []);

  const stockStatusColor = useMemo(() => {
    if (liquorItem.bottlesInStock <= liquorItem.minimumBottles) {
      return 'text-red-600 bg-red-50';
    }
    if (liquorItem.bottlesInStock <= liquorItem.minimumBottles * 2) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-green-600 bg-green-50';
  }, [liquorItem.bottlesInStock, liquorItem.minimumBottles]);

  const typeIcon = useMemo(() => {
    const icons = {
      hard_liquor: '🥃',
      beer: '🍺',
      wine: '🍷',
      cigarettes: '🚬',
      ice_cubes: '🧊',
      sandy_bottles: '🍾',
      bites: '🍽️',
      other: '📦'
    };
    return icons[liquorItem.type] || '🥃';
  }, [liquorItem.type]);

  const hasPortions = liquorItem.portions?.length > 0;
  
  // Calculate filtered portion count (excluding Quarter, Half, Full bottles)
  const filteredPortionsCount = useMemo(() => {
    if (!liquorItem.portions) return 0;
    return liquorItem.portions.filter(portion => {
      const isQuarterBottle = portion.volume === 180 && portion.name.toLowerCase().includes('quarter');
      const isHalfBottle = portion.volume === 375 && portion.name.toLowerCase().includes('half');
      const isFullBottle = portion.volume === 750 && portion.name.toLowerCase().includes('full');
      return !(isQuarterBottle || isHalfBottle || isFullBottle);
    }).length;
  }, [liquorItem.portions]);
  
  const portionCount = filteredPortionsCount;

  const handlePriceChange = useCallback((portionId, value) => {
    const numericValue = parseFloat(value) || 0;
    setPortionPrices(prev => ({
      ...prev,
      [portionId]: numericValue
    }));
  }, []);

  const handleSavePortionPrices = useCallback(async () => {
    setSaving(true);
    setSaveMessage('');
    
    try {
      const updatedPortions = liquorItem.portions.map(portion => ({
        ...portion,
        price: portionPrices[portion._id] || 0
      }));

      await LiquorService.updateLiquorPortions(liquorItem._id, { portions: updatedPortions });
      setSaveMessage('Prices saved successfully!');
      setEditingPortions(false);
      onUpdatePortions?.(liquorItem._id, updatedPortions);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving portion prices:', error);
      setSaveMessage('Error saving prices. Please try again.');
      setTimeout(() => setSaveMessage(''), 5000);
    } finally {
      setSaving(false);
    }
  }, [liquorItem._id, liquorItem.portions, portionPrices, onUpdatePortions]);

  const handleCancelEdit = useCallback(() => {
    setPortionPrices(initialPortionPrices);
    setEditingPortions(false);
    setSaveMessage('');
  }, [initialPortionPrices]);

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow min-h-[24rem] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-3xl">{typeIcon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{liquorItem.name}</h3>
              <p className="text-sm text-gray-600 line-clamp-1">{liquorItem.brand || 'No brand specified'}</p>
              <div className="flex items-center flex-wrap gap-2 mt-1">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                  {liquorItem.type === 'cigarettes' ? 'Cigarettes' : 
                   liquorItem.type === 'bites' ? 'Bites' : 
                   liquorItem.type.replace('_', ' ')}
                </span>
                {liquorItem.type === 'hard_liquor' && liquorItem.bottleVolume && (
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                    {formatVolume(liquorItem.bottleVolume)}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Stock Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatusColor}`}>
            <FaBoxes className="inline mr-1 text-xs" />
            {liquorItem.platesInStock || liquorItem.bottlesInStock} {
              liquorItem.type === 'cigarettes' ? 'packs' : 
              liquorItem.type === 'ice_cubes' ? 'bowls' : 
              liquorItem.type === 'bites' ? 'plates' :
              'bottles'
            }
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4">
        {/* Price and Info Grid */}
        <div className="grid grid-cols-1 gap-4 mb-4">
          {/* Dual Pricing Display */}
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Price per {
              liquorItem.type === 'cigarettes' ? 'Pack' : 
              liquorItem.type === 'bites' ? 'Plate' : 
              'Bottle'
            }</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Local</div>
                <p className="text-base font-semibold text-blue-600">
                  LKR {(
                    liquorItem.type === 'bites' 
                      ? (liquorItem.localPricePerPlate || liquorItem.pricePerPlate || 0)
                      : (liquorItem.localPrice || liquorItem.pricePerBottle || 0)
                  ).toFixed(2)}
                </p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Foreign</div>
                <p className="text-base font-semibold text-green-600">
                  LKR {(
                    liquorItem.type === 'bites' 
                      ? (liquorItem.foreignPricePerPlate || liquorItem.pricePerPlate || 0)
                      : (liquorItem.foreignPrice || liquorItem.pricePerBottle || 0)
                  ).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            {liquorItem.type === 'hard_liquor' ? (
              <div>
                <span className="text-sm font-medium text-gray-700">Alcohol %</span>
                <p className="text-lg font-semibold text-blue-600">
                  {liquorItem.alcoholPercentage ? `${liquorItem.alcoholPercentage}%` : 'N/A'}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-sm font-medium text-gray-700">Type</span>
                <p className="text-lg font-semibold text-blue-600 capitalize">
                  {liquorItem.type.replace('_', ' ')}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Save Message */}
        {saveMessage && (
          <div className="mb-4 p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
            saveMessage.includes('Error') 
              ? 'bg-red-100 text-red-700 border border-red-200' 
              : 'bg-green-100 text-green-700 border border-green-200'
          }">
            {saveMessage}
          </div>
        )}

        {/* Content Based on Type */}
        {liquorItem.type === 'hard_liquor' ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-gray-700">Portion Pricing</span>
                <p className="text-sm text-gray-600">
                  {hasPortions ? `${portionCount} portion sizes configured` : 'No portions configured yet'}
                </p>
              </div>
              {hasPortions && !editingPortions && (
                <PrimaryButton
                  onClick={() => setEditingPortions(true)}
                  className="text-sm px-3 py-1 flex items-center"
                >
                  <FaEdit className="mr-1" />
                  Edit Prices
                </PrimaryButton>
              )}
            </div>

            {hasPortions && (editingPortions ? (
              <div className="space-y-3">
                {liquorItem.portions
                  .filter(portion => {
                    // Filter out specific bottle portions: Quarter (180ml), Half (375ml), Full (750ml)
                    const isQuarterBottle = portion.volume === 180 && portion.name.toLowerCase().includes('quarter');
                    const isHalfBottle = portion.volume === 375 && portion.name.toLowerCase().includes('half');
                    const isFullBottle = portion.volume === 750 && portion.name.toLowerCase().includes('full');
                    return !(isQuarterBottle || isHalfBottle || isFullBottle);
                  })
                  .map((portion) => (
                  <div key={portion._id} className="flex items-center justify-between bg-white rounded-lg p-3 border">
                    <span className="text-sm font-medium text-gray-700">
                      {portion.name} ({formatVolume(portion.volume)})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">LKR</span>
                      <InputField
                        type="number"
                        value={portionPrices[portion._id] || ''}
                        onChange={(e) => handlePriceChange(portion._id, e.target.value)}
                        className="w-24 text-right"
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>
                ))}
                
                <div className="flex items-center justify-end gap-2 mt-4">
                  <SecondaryButton
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="px-4 py-2 flex items-center"
                  >
                    <FaTimes className="mr-1" />
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleSavePortionPrices}
                    disabled={saving}
                    className="px-4 py-2 flex items-center"
                  >
                    <FaSave className="mr-1" />
                    {saving ? 'Saving...' : 'Save Prices'}
                  </PrimaryButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {liquorItem.portions
                  .filter(portion => {
                    // Filter out specific bottle portions: Quarter (180ml), Half (375ml), Full (750ml)
                    const isQuarterBottle = portion.volume === 180 && portion.name.toLowerCase().includes('quarter');
                    const isHalfBottle = portion.volume === 375 && portion.name.toLowerCase().includes('half');
                    const isFullBottle = portion.volume === 750 && portion.name.toLowerCase().includes('full');
                    return !(isQuarterBottle || isHalfBottle || isFullBottle);
                  })
                  .map((portion) => (
                  <div key={portion._id} className="bg-white rounded-lg p-3 border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {portion.name} ({formatVolume(portion.volume)})
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-600 font-medium">
                        Local: LKR {(portion.localPrice || portion.price || 0).toFixed(2)}
                      </span>
                      <span className="text-green-600 font-medium">
                        Foreign: LKR {(portion.foreignPrice || portion.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : liquorItem.type === 'beer' ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Beer Price</span>
              <p className="text-sm text-gray-600">Price per bottle</p>
            </div>

            <div className="bg-white rounded-lg p-3 border">
              <div className="space-y-2">
                <span className="text-sm text-gray-700 block font-medium">Bottle Price</span>
                <div className="flex justify-between">
                  <span className="text-sm text-blue-600 font-medium">
                    Local: LKR {(liquorItem.localPrice || liquorItem.pricePerBottle)?.toFixed(2) || '0.00'}
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    Foreign: LKR {(liquorItem.foreignPrice || liquorItem.pricePerBottle)?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : liquorItem.type === 'cigarettes' ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Cigarette Details</span>
              <p className="text-sm text-gray-600">Pack and individual pricing</p>
            </div>
            
            <div className="space-y-3">
              {/* Pack Information */}
              <div className="bg-white rounded-lg p-3 border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Cigarettes per Pack</span>
                    <div className="text-lg font-semibold text-blue-600">
                      {liquorItem.cigarettesPerPack || 20} pieces
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Individual Price</span>
                    <div className="space-y-1">
                      <div className="text-sm font-medium text-blue-600">
                        Local: LKR {liquorItem.cigaretteLocalPrice ? Number(liquorItem.cigaretteLocalPrice).toFixed(2) : 
                                  (liquorItem.cigaretteIndividualPrice ? Number(liquorItem.cigaretteIndividualPrice).toFixed(2) : 'N/A')}
                      </div>
                      <div className="text-sm font-medium text-green-600">
                        Foreign: LKR {liquorItem.cigaretteForeignPrice ? Number(liquorItem.cigaretteForeignPrice).toFixed(2) : 
                                    (liquorItem.cigaretteIndividualPrice ? Number(liquorItem.cigaretteIndividualPrice).toFixed(2) : 'N/A')}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Comparison */}
              {liquorItem.pricePerBottle && liquorItem.cigaretteIndividualPrice && liquorItem.cigarettesPerPack && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-sm text-blue-700">
                    <div className="flex justify-between items-center mb-2">
                      <span>Pack price per cigarette:</span>
                      <span className="font-semibold">
                        LKR {(liquorItem.pricePerBottle / liquorItem.cigarettesPerPack).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Individual markup:</span>
                      <span className={`font-semibold ${
                        liquorItem.cigaretteIndividualPrice > (liquorItem.pricePerBottle / liquorItem.cigarettesPerPack)
                          ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {(((liquorItem.cigaretteIndividualPrice / (liquorItem.pricePerBottle / liquorItem.cigarettesPerPack)) - 1) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Total Stock Information */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Total Cigarettes</span>
                    <div className="text-lg font-semibold text-orange-600">
                      {(liquorItem.bottlesInStock || 0) * (liquorItem.cigarettesPerPack || 20)} pieces
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Sales Options</span>
                    <div className="text-sm font-medium text-gray-700">
                      Pack or Individual
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : liquorItem.type === 'bites' ? (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="mb-3">
              <span className="text-sm font-medium text-gray-700">Bites Information</span>
            </div>
            
            {/* Plates Stock Information */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Plates Available</span>
                  <div className="text-lg font-semibold text-purple-600">
                    {liquorItem.platesInStock || liquorItem.bottlesInStock || 0} plates
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Total Sold</span>
                  <div className="text-lg font-semibold text-green-600">
                    {liquorItem.totalSoldItems || 0} plates
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-auto">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <span className="text-sm text-gray-600">
                {liquorItem.type === 'wine' ? (
                  'Sold as whole bottles only'
                ) : (
                  'No portion pricing available'
                )}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      {/* <div className="p-4 border-t border-gray-100 mt-auto bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">
            Last updated: {new Date(liquorItem.updatedAt).toLocaleDateString()}
          </span>
          <div className="flex items-center gap-2">
            <SecondaryButton
              onClick={() => onEdit?.(liquorItem)}
              className="px-3 py-1 text-primaryColor hover:text-white"
            >
              <FaEdit className="" />
            </SecondaryButton>
          </div>
        </div>
      </div> */}
    </div>
  );
}

LiquorMenuCard.propTypes = {
  liquorItem: PropTypes.object.isRequired,
  onUpdatePortions: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func
};
