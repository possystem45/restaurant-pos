import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FaWineBottle, FaEdit, FaBoxes, FaSave, FaTimes } from 'react-icons/fa';
import { InputField } from '../../../../components/InputField';
import Button from '../../../../components/Button';

export default function LiquorMenuCard({ liquorItem, onUpdatePortions }) {
  const [editingPortions, setEditingPortions] = useState({});
  const [tempPrices, setTempPrices] = useState({});

  // Initialize temp prices when component mounts or liquor item changes
  useEffect(() => {
    if (liquorItem.portions) {
      const prices = {};
      liquorItem.portions.forEach(portion => {
        prices[portion._id] = portion.price || 0;
      });
      setTempPrices(prices);
    }
  }, [liquorItem]);

  const formatVolume = (volume) => {
    if (volume >= 1000) {
      return `${(volume / 1000).toFixed(1)}L`;
    }
    return `${volume}ml`;
  };

  const getStockStatusColor = () => {
    // For ice cubes and bites, don't show stock status colors since they don't track stock
    if (['ice_cubes', 'bites'].includes(liquorItem.type)) {
      return 'text-blue-600 bg-blue-50';
    }
    
    if (liquorItem.bottlesInStock <= liquorItem.minimumBottles) {
      return 'text-red-600 bg-red-50';
    }
    if (liquorItem.bottlesInStock <= liquorItem.minimumBottles * 2) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-green-600 bg-green-50';
  };

  const getTypeIcon = (type) => {
    const icons = {
      hard_liquor: '🥃',
      beer: '🍺',
      wine: '🍷',
      cigarettes: '🚬',
      ice_cubes: '🧊',
      sandy_bottles: '🍾',
      other: '📦'
    };
    return icons[type] || '🥃';
  };

  const toggleEditPortion = (portionId) => {
    setEditingPortions(prev => ({
      ...prev,
      [portionId]: !prev[portionId]
    }));
  };

  const handlePriceChange = (portionId, price) => {
    setTempPrices(prev => ({
      ...prev,
      [portionId]: parseFloat(price) || 0
    }));
  };

  const savePortion = async (portionId) => {
    const newPrice = tempPrices[portionId];
    const updatedPortions = liquorItem.portions.map(portion => 
      portion._id === portionId 
        ? { ...portion, price: newPrice }
        : portion
    );
    
    try {
      await onUpdatePortions(liquorItem._id, updatedPortions);
      setEditingPortions(prev => ({
        ...prev,
        [portionId]: false
      }));
    } catch (error) {
      console.error('Error saving portion:', error);
    }
  };

  const hasPortions = liquorItem.portions && liquorItem.portions.length > 0;
  const isHardLiquor = liquorItem.type === 'hard_liquor';

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <span className="text-3xl">{getTypeIcon(liquorItem.type)}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{liquorItem.name}</h3>
              <p className="text-sm text-gray-600">{liquorItem.brand || 'No brand specified'}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                  {liquorItem.type}
                </span>
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full">
                  {formatVolume(liquorItem.bottleVolume)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Stock Status */}
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStockStatusColor()}`}>
            <FaBoxes className="inline mr-1 text-xs" />
            {liquorItem.bottlesInStock} {
              liquorItem.type === 'cigarettes' ? 'packs' : 
              liquorItem.type === 'ice_cubes' ? 'bowls' : 
              'bottles'
            }
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">Price per Bottle:</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Local</div>
                <p className="text-sm font-semibold text-blue-600">
                  LKR {(liquorItem.localPrice || liquorItem.pricePerBottle)?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <div className="text-xs text-gray-600 mb-1">Foreign</div>
                <p className="text-sm font-semibold text-green-600">
                  LKR {(liquorItem.foreignPrice || liquorItem.pricePerBottle)?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <span className="text-sm font-medium text-gray-700">Alcohol %:</span>
            <p className="text-lg font-semibold text-blue-600">
              {liquorItem.alcoholPercentage ? `${liquorItem.alcoholPercentage}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Portions Section - Only for hard liquor */}
        {isHardLiquor && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-4">Portion Prices:</h4>
            
            {!hasPortions ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No portions configured yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {liquorItem.portions.map((portion) => (
                  <div 
                    key={portion._id}
                    className="flex items-center justify-between bg-white rounded-md p-3 border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-800 text-base">{portion.name}</span>
                        {/* Show volume in parentheses for shots, show calculated volume for quarter/half/full */}
                        {portion.name.includes('Shot') ? (
                          <span className="text-sm text-gray-600">({portion.volume}ml)</span>
                        ) : (
                          <span className="text-sm text-gray-600">
                            ({portion.volume}ml)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {editingPortions[portion._id] ? (
                        <>
                          <div className="w-24">
                            <InputField
                              type="number"
                              step="0.01"
                              min="0"
                              value={tempPrices[portion._id] || 0}
                              onChange={(e) => handlePriceChange(portion._id, e.target.value)}
                              className="text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <Button
                            onClick={() => savePortion(portion._id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Save price"
                          >
                            <FaSave className="text-sm" />
                          </Button>
                          <Button
                            onClick={() => toggleEditPortion(portion._id)}
                            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                            title="Cancel"
                          >
                            <FaTimes className="text-sm" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-green-600 text-base w-20 text-right">
                            LKR {portion.price?.toFixed(2) || '0.00'}
                          </span>
                          <Button
                            onClick={() => toggleEditPortion(portion._id)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                            title="Edit price"
                          >
                            <FaEdit className="text-sm" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Beer/Wine info (no portions) */}
        {!isHardLiquor && (
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700 text-center">
              {liquorItem.type === 'beer' ? 'Beer sold as whole bottles' : 'Wine sold as whole bottles'}
            </p>
          </div>
        )}

        {/* Stock Details */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="bg-blue-50 rounded-lg p-2">
            <p className="text-xs text-blue-600 font-medium">Total Volume</p>
            <p className="text-sm font-semibold text-blue-800">
              {formatVolume(liquorItem.totalVolumeRemaining || (liquorItem.bottlesInStock * liquorItem.bottleVolume))}
            </p>
          </div>
          <div className="bg-green-50 rounded-lg p-2">
            <p className="text-xs text-green-600 font-medium">Sold</p>
            <p className="text-sm font-semibold text-green-800">
              {formatVolume(liquorItem.totalSoldVolume || 0)}
            </p>
          </div>
          <div className="bg-red-50 rounded-lg p-2">
            <p className="text-xs text-red-600 font-medium">Wasted</p>
            <p className="text-sm font-semibold text-red-800">
              {formatVolume(liquorItem.wastedVolume || 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

LiquorMenuCard.propTypes = {
  liquorItem: PropTypes.object.isRequired,
  onUpdatePortions: PropTypes.func.isRequired
};
