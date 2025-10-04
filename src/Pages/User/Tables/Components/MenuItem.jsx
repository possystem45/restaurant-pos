import React, { useCallback, memo, useState } from 'react'
import PropTypes from 'prop-types'
import { PrimaryButton } from '../../../../components/Button'
import { FaPlus, FaTimes, FaMinus } from 'react-icons/fa'

const MenuItem = memo(function MenuItem({item, customerType = 'local', onAddItem, selectedTable}) {
    const [showPortionModal, setShowPortionModal] = useState(false);
    const [showCigaretteModal, setShowCigaretteModal] = useState(false);
    const [showFullBottleModal, setShowFullBottleModal] = useState(false);
    const [cigaretteQuantity, setCigaretteQuantity] = useState(1);
    
    // Check if this is a hard liquor that needs portion selection
    const isHardLiquor = item.category === 'Hard Liquor' || (item.type && item.type === 'hard_liquor');
    
    // Check if this is cigarettes that need pack/individual selection
    const isCigarettes = item.category === 'Cigarettes' || (item.type && item.type === 'cigarettes');
    
    // Check if this is beer or wine
    const isBeerOrWine = item.type === 'beer' || item.type === 'wine';
    
    // Check if this is bites
    const isBites = item.category === 'Bites' || (item.type && item.type === 'bites');
    
    // Check if this is ice cubes
    const isIceCubes = item.type === 'ice_cubes';
    
    // Function to get the correct price based on customer type
    const getPrice = () => {
        if (customerType === 'foreign') {
            // Use foreign price if available, fallback to local price
            return item.foreignPrice || item.localPrice || item.price;
        } else {
            // Use local price if available, fallback to regular price
            return item.localPrice || item.price;
        }
    };
     // Get the current price to display
    const currentPrice = getPrice();

    // Function to get cigarette individual price based on customer type
    const getCigaretteIndividualPrice = () => {
        if (customerType === 'foreign') {
            return item.cigaretteForeignPrice || item.cigaretteLocalPrice || item.cigaretteIndividualPrice;
        } else {
            return item.cigaretteLocalPrice || item.cigaretteIndividualPrice;
        }
    };

    // Function to get pack price based on customer type
    const getPackPrice = () => {
        return currentPrice; // This already handles customer type
    };

    
    // Use real portions from database or fallback to shot portions only
    const getPortions = () => {
        if (item.portions && item.portions.length > 0) {
            // Filter out full, half, and quarter bottle options - these should be unit sales
            return item.portions
                .filter(portion => {
                    const portionName = portion.name.toLowerCase();
                    return  !portionName.includes('full bottle') && 
                            !portionName.includes('half bottle') && 
                            !portionName.includes('quarter bottle');
                })
                .map(portion => ({
                    name: portion.name,
                    ml: portion.volume,
                    price: customerType === 'foreign' 
                        ? (portion.foreignPrice || portion.localPrice || portion.price || 0)
                        : (portion.localPrice || portion.price || 0),
                    isCustom: false
                }));
        } else {
            // Fallback to calculated shot portions only (no bottle sales)
            const liquorPortions = [
                { name: '180ml Shot', ml: 180, priceMultiplier: 0.25 },
                { name: '100ml Shot', ml: 100, priceMultiplier: 0.15 },
                { name: '75ml Shot', ml: 75, priceMultiplier: 0.12 },
                { name: '50ml Shot', ml: 50, priceMultiplier: 0.08 },
                { name: '25ml Shot', ml: 25, priceMultiplier: 0.05 }
            ];
            
            return liquorPortions.map(portion => ({
                name: portion.name,
                ml: portion.ml,
                price: Math.round(currentPrice * portion.priceMultiplier),
                isCustom: true
            }));
        }
    };

    const handleAddItem = useCallback(() => {
        if (isHardLiquor) {
            setShowFullBottleModal(true);
        } else if (isCigarettes) {
            setCigaretteQuantity(1);
            setShowCigaretteModal(true);
        } else {
            // For beer, wine, bites, and other items
            const itemToAdd = {
                ...item,
                price: currentPrice, // Use the customer type specific price
                type: item.type // Ensure type is passed for all items including bites
            };
            onAddItem(selectedTable.id, itemToAdd);
        }
    }, [isHardLiquor, isCigarettes, onAddItem, selectedTable.id, item]);

    const handlePortionSelect = useCallback((portion) => {
        const liquorItem = {
            ...item,
            id: `${item.id}_${portion.ml}ml`,
            name: `${item.name} (${portion.name})`,
            price: portion.price,
            type: item.type, // Ensure type is passed
            portion: {
                type: portion.name,
                ml: portion.ml,
                price: portion.price
            },
            originalItemId: item.id
        };
        
        onAddItem(selectedTable.id, liquorItem);
        setShowPortionModal(false);
    }, [item, onAddItem, selectedTable.id]);

    const handleFullBottleSelect = useCallback((option) => {
        if (option.type === 'portion') {
            setShowFullBottleModal(false);
            setShowPortionModal(true);
        } else {
            // Full bottle sale
            const fullBottleItem = {
                ...item,
                id: `${item.id}_full`,
                name: `${item.name} (Full Bottle)`,
                price: currentPrice, // Use customer type specific price
                type: item.type, // Ensure type is passed
                isFullBottle: true,
                originalItemId: item.id
            };
            
            onAddItem(selectedTable.id, fullBottleItem);
            setShowFullBottleModal(false);
        }
    }, [item, onAddItem, selectedTable.id]);

    const handleCigaretteSelect = useCallback((option) => {
        const cigaretteName = option.isIndividual 
            ? `${item.name} (${cigaretteQuantity} Individual Cigarette${cigaretteQuantity > 1 ? 's' : ''})` 
            : `${item.name} (Pack)`;
            
        const cigaretteItem = {
            ...item,
            id: option.isIndividual ? `${item.id}_individual_${cigaretteQuantity}` : item.id,
            name: cigaretteName,
            price: option.isIndividual ? option.price * cigaretteQuantity : option.price,
            type: item.type, // Ensure type is passed
            isIndividual: option.isIndividual,
            quantity: option.isIndividual ? cigaretteQuantity : 1,
            originalItemId: item.id
        };
        
        onAddItem(selectedTable.id, cigaretteItem, option.isIndividual ? cigaretteQuantity : 1);
        setShowCigaretteModal(false);
        setCigaretteQuantity(1);
    }, [item, onAddItem, selectedTable.id, cigaretteQuantity]);

    const closeModal = useCallback(() => {
        setShowPortionModal(false);
        setShowCigaretteModal(false);
        setShowFullBottleModal(false);
        setCigaretteQuantity(1);
    }, []);

    // Check if item has stock and display stock info
    const getStockDisplay = () => {
        // Don't show stock for bites and ice cubes as they don't have stock tracking
        if (isBites || isIceCubes) {
            return null;
        }
        
        if (item.stock && (item.stock.bottlesInStock !== undefined || item.stock.millilitersRemaining !== undefined)) {
            const bottles = item.stock.bottlesInStock || 0;
            const ml = item.stock.millilitersRemaining || 0;
            
            if (isCigarettes) {
                // For cigarettes, show detailed stock info including individual cigarettes
                const packs = item.stock.bottlesInStock || 0;
                const totalCigarettes = item.stock.totalCigarettes || 0;
                const soldFromOpenedPack = item.stock.remainingIndividualCigarettes || 0;
                
                let stockInfo = `${packs} packs (${totalCigarettes} remaining)`;
                if (soldFromOpenedPack > 0) {
                    stockInfo += `, ${soldFromOpenedPack} sold from opened pack`;
                }
                return stockInfo;
            } else if (isHardLiquor && ml > 0) {
                return `${bottles} bottles, ${ml}ml remaining`;
            } else {
                return `${bottles} in stock`;
            }
        }
        return null;
    };

    // Check if item is out of stock
    const isOutOfStock = () => {
        // Bites and ice cubes don't have stock tracking, so they're always available
        if (isBites || isIceCubes) {
            return false;
        }
        
        if (item.stock) {
            const bottles = item.stock.bottlesInStock || 0;
            const ml = item.stock.millilitersRemaining || 0;
            return bottles === 0 && ml === 0;
        }
        return false;
    };

    return (
        <>
            <div key={item.id} className={`bg-white p-3 sm:p-4 rounded-lg border border-gray-200 ${isOutOfStock() ? 'opacity-50' : ''}`}>
                <h4 className="font-semibold text-other1 text-sm sm:text-base">{item.name}</h4>
                <p className="text-xs sm:text-sm text-gray-600">{item.brand ? `${item.brand} - ` : ''}{item.category}</p>
                
                {/* Stock Information */}
                {getStockDisplay() && (
                    <p className="text-xs text-blue-600 mt-1">{getStockDisplay()}</p>
                )}
                {isOutOfStock() && (
                    <p className="text-xs text-red-500 mt-1">Out of Stock</p>
                )}
                
                <div className="flex justify-between items-center mt-2 gap-2">
                    <span className="font-medium text-gray-800 text-sm sm:text-base">
                        LKR {currentPrice}
                        {isHardLiquor && <span className="text-xs text-gray-500"> (bottle)</span>}
                        {isCigarettes && <span className="text-xs text-gray-500"> (pack)</span>}
                        {isBites && <span className="text-xs text-gray-500"> (per plate)</span>}
                        {isIceCubes && <span className="text-xs text-gray-500"> (per bowl)</span>}
                    </span>
                    <PrimaryButton
                        onClick={handleAddItem}
                        className="flex items-center text-xs sm:text-sm py-1.5 sm:py-1 px-2 sm:px-3 flex-shrink-0"
                        disabled={isOutOfStock()}
                    >
                        <FaPlus className="mr-1" size={10} />
                        <span className="hidden sm:inline">
                            {(() => {
                                if (isHardLiquor) return 'Select';
                                if (isCigarettes) return 'Choose';
                                return 'Add';
                            })()}
                        </span>
                        <span className="sm:hidden">+</span>
                    </PrimaryButton>
                </div>
            </div>

            {/* Hard Liquor Sale Type Selection Modal */}
            {showFullBottleModal && (
                <div className="fixed inset-0 bg-other1 bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-other1">Choose Sale Type - {item.name}</h3>
                            <button 
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 p-1"
                            >
                                <FaTimes size={16} />
                            </button>
                        </div>
                        
                        <div className="space-y-2 sm:space-y-3">
                            {/* Portion Sale Option */}
                            <button
                                onClick={() => handleFullBottleSelect({ type: 'portion' })}
                                className="w-full p-3 sm:p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primaryColor transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-medium text-other1 text-sm sm:text-base">Sell by Portion</span>
                                        <div className="text-xs sm:text-sm text-gray-600 mt-1">
                                            25ml, 50ml, 75ml, 100ml shots
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            Volume will be deducted from current bottle
                                        </div>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </div>
                            </button>

                            {/* Full Bottle Sale Option */}
                            <button
                                onClick={() => handleFullBottleSelect({ type: 'full' })}
                                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primaryColor transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-medium text-other1">Sell Full Bottle</span>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {item.bottleVolume || 750}ml bottle
                                        </div>
                                        <div className="text-xs text-orange-600 mt-1">
                                            One complete bottle will be deducted from stock
                                        </div>
                                    </div>
                                    <span className="font-medium text-primaryColor">
                                        LKR {currentPrice}
                                    </span>
                                </div>
                            </button>
                        </div>
                        
                        <button 
                            onClick={closeModal}
                            className="w-full mt-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Liquor Portion Selection Modal */}
            {showPortionModal && (
                <div className="fixed inset-0 bg-other1 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-90vw max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-other1">Select Portion - {item.name}</h3>
                            <button 
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {getPortions().map((portion) => (
                                <button
                                    key={`${portion.ml}_${portion.name}`}
                                    onClick={() => handlePortionSelect(portion)}
                                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primaryColor transition-colors"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <span className="font-medium text-other1">{portion.name}</span>
                                            <span className="text-sm text-other1 ml-2">({portion.ml}ml)</span>
                                            {portion.isCustom && (
                                                <span className="text-xs text-gray-500 ml-2">(calculated)</span>
                                            )}
                                        </div>
                                        <span className="font-medium text-primaryColor">
                                            LKR {portion.price}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                        
                        <button 
                            onClick={closeModal}
                            className="w-full mt-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {/* Cigarette Selection Modal */}
            {showCigaretteModal && (
                <div className="fixed inset-0 bg-other1 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-other1">Choose Option - {item.name}</h3>
                            <button 
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <FaTimes />
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {/* Pack Option */}
                            <button
                                onClick={() => handleCigaretteSelect({
                                    isIndividual: false,
                                    price: getPackPrice()
                                })}
                                className="w-full p-4 text-left border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primaryColor transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="font-medium text-other1">Full Pack</span>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {item.cigarettesPerPack || 20} cigarettes per pack
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            LKR {((getPackPrice()) / (item.cigarettesPerPack || 20)).toFixed(2)} per cigarette
                                        </div>
                                    </div>
                                    <span className="font-medium text-primaryColor">
                                        LKR {getPackPrice()}
                                    </span>
                                </div>
                            </button>

                            {/* Individual Option with Quantity Controls */}
                            {getCigaretteIndividualPrice() && (
                                <div className="border border-gray-200 rounded-lg p-4">
                                    <div className="mb-3">
                                        <span className="font-medium text-other1">Individual Cigarettes</span>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Select quantity
                                        </div>
                                        <div className="text-xs text-orange-600 mt-1">
                                            {(((getCigaretteIndividualPrice() / (getPackPrice() / (item.cigarettesPerPack || 20))) - 1) * 100).toFixed(1)}% 
                                            higher than pack price
                                        </div>
                                    </div>
                                    
                                    {/* Quantity Controls */}
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center space-x-3">
                                            <button
                                                onClick={() => setCigaretteQuantity(Math.max(1, cigaretteQuantity - 1))}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                disabled={cigaretteQuantity <= 1}
                                            >
                                                <FaMinus size={12} />
                                            </button>
                                            <span className="font-semibold text-lg min-w-[40px] text-center">
                                                {cigaretteQuantity}
                                            </span>
                                            <button
                                                onClick={() => setCigaretteQuantity(Math.min(20, cigaretteQuantity + 1))}
                                                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
                                                disabled={cigaretteQuantity >= 20}
                                            >
                                                <FaPlus size={12} />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm text-gray-600">Total Price</div>
                                            <div className="font-medium text-primaryColor">
                                                LKR {(getCigaretteIndividualPrice() * cigaretteQuantity).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleCigaretteSelect({
                                            isIndividual: true,
                                            price: getCigaretteIndividualPrice()
                                        })}
                                        className="w-full py-2 bg-primaryColor text-white rounded-lg hover:bg-primaryColor/90 transition-colors"
                                    >
                                        Add {cigaretteQuantity} Individual Cigarette{cigaretteQuantity > 1 ? 's' : ''}
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={closeModal}
                            className="w-full mt-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </>
    )
});

// Add PropTypes
MenuItem.propTypes = {
    item: PropTypes.object.isRequired,
    customerType: PropTypes.oneOf(['local', 'foreign']),
    onAddItem: PropTypes.func.isRequired,
    selectedTable: PropTypes.object.isRequired
};

export default MenuItem;
