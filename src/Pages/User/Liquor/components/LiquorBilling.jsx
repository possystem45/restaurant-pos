import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../../../components/Button';
import { InputField } from '../../../../components/InputField';
import SelectField from '../../../../components/SelectField';
import Modal from '../../../../components/Modal';
import LoadingSpinner from '../../../../components/LoadingSpinner';
import { menuLiquorService } from '../../../../services/menuLiquorService';
import { FaWineGlass, FaBeer, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';

const LiquorBilling = ({ isOpen, onClose, onSaleComplete }) => {
  const [liquorItems, setLiquorItems] = useState([]);
  const [selectedLiquor, setSelectedLiquor] = useState('');
  const [selectedPortion, setSelectedPortion] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saleResult, setSaleResult] = useState(null);

  // Load liquor items when modal opens
  useEffect(() => {
    if (isOpen) {
      loadLiquorItems();
      setSaleResult(null);
      setError('');
    }
  }, [isOpen]);

  const loadLiquorItems = async () => {
    try {
      setLoading(true);
      const response = await menuLiquorService.getAvailableLiquorItems();
      setLiquorItems(response.data.filter(item => item.bottlesInStock > 0));
    } catch (error) {
      setError('Failed to load liquor items');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedLiquorData = () => {
    return liquorItems.find(item => item._id === selectedLiquor);
  };

  const getLiquorIcon = (type) => {
    return type === 'beer' ? <FaBeer className="text-yellow-600" /> : <FaWineGlass className="text-red-600" />;
  };

  const handleLiquorChange = (liquorId) => {
    setSelectedLiquor(liquorId);
    setSelectedPortion('');
    setQuantity(1);
    setSaleResult(null);
  };

  const handleSale = async () => {
    const liquorData = getSelectedLiquorData();
    if (!liquorData) return;

    try {
      setLoading(true);
      setError('');
      
      let totalConsumed = 0;
      let totalWasted = 0;
      let saleDetails = [];

      for (let i = 0; i < quantity; i++) {
        let result;
        if (liquorData.type === 'beer') {
          // For beer, consume full bottle
          result = await menuLiquorService.processLiquorSale(
            liquorData._id,
            null,
            liquorData.bottleVolume
          );
        } else {
          // For hard liquor, use selected portion
          if (!selectedPortion) {
            throw new Error('Please select a portion for hard liquor');
          }
          result = await menuLiquorService.processLiquorSale(
            liquorData._id,
            selectedPortion
          );
        }

        totalConsumed += result.consumed;
        totalWasted += result.wasted;
        
        if (i === 0) {
          saleDetails.push({
            remainingBottles: result.remainingBottles,
            remainingVolume: result.remainingVolume,
            portionName: result.portionName
          });
        }
      }

      setSaleResult({
        liquorName: liquorData.name,
        quantity,
        totalConsumed,
        totalWasted,
        ...saleDetails[0]
      });

      // Reload liquor items to reflect updated stock
      await loadLiquorItems();

      // Notify parent component
      if (onSaleComplete) {
        const portion = liquorData.type === 'beer' ? null : 
          liquorData.portions.find(p => p._id === selectedPortion);
        
        onSaleComplete({
          liquorId: liquorData._id,
          liquorName: liquorData.name,
          portionId: selectedPortion,
          portionName: portion?.name || 'Full Bottle',
          quantity,
          totalPrice: quantity * (portion?.price || liquorData.pricePerBottle),
          totalConsumed,
          totalWasted
        });
      }

    } catch (error) {
      setError(error.message || 'Failed to process sale');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    const liquorData = getSelectedLiquorData();
    if (!liquorData) return 0;

    if (liquorData.type === 'beer') {
      return quantity * liquorData.pricePerBottle;
    } else {
      const portion = liquorData.portions.find(p => p._id === selectedPortion);
      return portion ? quantity * portion.price : 0;
    }
  };

  const getPortionOptions = () => {
    const liquorData = getSelectedLiquorData();
    if (!liquorData || liquorData.type === 'beer') return [];

    return liquorData.portions.map(portion => ({
      value: portion._id,
      label: `${portion.name} (${portion.volume}ml) - LKR ${portion.price.toFixed(2)}`
    }));
  };

  const canMakeSale = () => {
    if (!selectedLiquor || quantity < 1) return false;
    
    const liquorData = getSelectedLiquorData();
    if (!liquorData) return false;
    
    if (liquorData.type !== 'beer' && !selectedPortion) return false;
    
    return true;
  };

  const reset = () => {
    setSelectedLiquor('');
    setSelectedPortion('');
    setQuantity(1);
    setError('');
    setSaleResult(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Liquor Billing">
      <div className="space-y-6">
        {loading && <LoadingSpinner />}
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2 text-red-700">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        )}

        {saleResult && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">Sale Completed Successfully!</h3>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>{saleResult.liquorName}</strong> - {saleResult.quantity}x {saleResult.portionName}</p>
              <p>Consumed: {saleResult.totalConsumed}ml</p>
              {saleResult.totalWasted > 0 && (
                <p className="text-orange-600">Wasted: {saleResult.totalWasted}ml (remainder discarded)</p>
              )}
              <p>Remaining: {saleResult.remainingBottles} bottles, {saleResult.remainingVolume}ml total</p>
            </div>
          </div>
        )}

        <div>
          <SelectField
            id="liquor-select"
            label="Select Liquor Item"
            value={selectedLiquor}
            onChange={(value) => handleLiquorChange(value)}
            placeholder="Choose liquor item..."
            required
          >
            {liquorItems.map(item => (
              <option key={item._id} value={item._id}>
                {item.name} - {item.brand} ({item.bottlesInStock} bottles) - LKR {item.pricePerBottle.toFixed(2)}
                {item.bottlesInStock <= item.minimumBottles && ' - Low Stock'}
              </option>
            ))}
          </SelectField>
        </div>

        {selectedLiquor && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              {getLiquorIcon(getSelectedLiquorData()?.type)}
              <h3 className="font-medium">Selected: {getSelectedLiquorData()?.name}</h3>
            </div>
            <div className="text-sm text-gray-600 space-y-1">
              <p>Brand: {getSelectedLiquorData()?.brand}</p>
              <p>Type: {getSelectedLiquorData()?.type}</p>
              <p>Bottle Volume: {getSelectedLiquorData()?.bottleVolume}ml</p>
              <p>In Stock: {getSelectedLiquorData()?.bottlesInStock} bottles</p>
              <p>Total Volume Remaining: {getSelectedLiquorData()?.totalVolumeRemaining}ml</p>
              {getSelectedLiquorData()?.wastedVolume > 0 && (
                <p className="text-orange-600">Total Wasted: {getSelectedLiquorData()?.wastedVolume}ml</p>
              )}
              {getSelectedLiquorData()?.totalSoldVolume > 0 && (
                <p className="text-green-600">Total Sold: {getSelectedLiquorData()?.totalSoldVolume}ml</p>
              )}
            </div>
          </div>
        )}

        {selectedLiquor && getSelectedLiquorData()?.type !== 'beer' && (
          <div>
            <SelectField
              id="portion-select"
              label="Select Portion"
              value={selectedPortion}
              onChange={setSelectedPortion}
              placeholder="Choose portion size..."
              required
            >
              {getPortionOptions().map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </SelectField>
          </div>
        )}

        <div>
          <InputField
            id="quantity"
            type="number"
            label="Quantity"
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={getSelectedLiquorData()?.bottlesInStock || 1}
            required
          />
        </div>

        {canMakeSale() && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaInfoCircle className="text-blue-600" />
              <h3 className="font-medium text-blue-800">Sale Summary</h3>
            </div>
            <div className="text-sm text-blue-700">
              <p><strong>Total: LKR {calculateTotal().toFixed(2)}</strong></p>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <PrimaryButton
            onClick={handleSale}
            disabled={!canMakeSale() || loading}
            className="flex-1"
          >
            Process Sale
          </PrimaryButton>
          <PrimaryButton
            onClick={reset}
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Reset
          </PrimaryButton>
          <PrimaryButton
            onClick={onClose}
            className="bg-gray-500 hover:bg-gray-600"
          >
            Close
          </PrimaryButton>
        </div>
      </div>
    </Modal>
  );
};

export default LiquorBilling;
