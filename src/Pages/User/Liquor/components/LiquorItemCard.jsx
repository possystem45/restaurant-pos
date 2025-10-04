import React, { useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { SecondaryButton } from '../../../../components/Button';
import LiquorAnalyticsCard from '../../../../components/LiquorAnalyticsCard';
import { formatQuantity } from '../../../../utils/numberFormat';

const LiquorItemCard = React.memo(({ 
    item, 
    onEdit, 
    onDelete
}) => {
    // Memoize low stock calculation
    const isLowStock = useMemo(() => 
        item.quantity <= (item.minimumQuantity || 5),
        [item.quantity, item.minimumQuantity]
    );

    // Memoize type color calculation
    const typeColor = useMemo(() => {
        switch (item.type) {
            case 'beer': return 'bg-yellow-100 text-yellow-800';
            case 'whiskey': return 'bg-amber-100 text-amber-800';
            case 'vodka': return 'bg-blue-100 text-blue-800';
            case 'rum': return 'bg-orange-100 text-orange-800';
            case 'gin': return 'bg-green-100 text-green-800';
            case 'bites': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }, [item.type]);

    // Memoize handlers
    const handleEdit = useCallback(() => {
        onEdit(item);
    }, [item, onEdit]);

    const handleDelete = useCallback(() => {
        onDelete(item);
    }, [item, onDelete]);
    
    return (
        <div className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow h-auto sm:h-[28rem] flex flex-col">
            {/* Header */}
            <div className="p-3 sm:p-4 border-b">
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">{item.brand}</p>
                        <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                            <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs rounded-full font-medium ${typeColor}`}>
                                {item.type.toUpperCase()}
                            </span>
                            {isLowStock && (
                                <span className="px-2 py-1 text-xs rounded-full font-medium bg-red-100 text-red-800">
                                    LOW STOCK
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 overflow-y-auto">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <div className="text-sm text-gray-600">Price per {item.type === 'bites' ? 'plate' : item.unit || 'unit'}</div>
                        {/* Dual Pricing Display */}
                        <div className="space-y-1">
                            <div className="flex justify-between gap-2">
                                <div className="text-sm">
                                    <div className="text-xs text-gray-500">Local</div>
                                    <div className="text-sm font-bold text-blue-600">
                                        LKR {(
                                            item.type === 'bites' 
                                                ? (item.localPricePerPlate || item.pricePerPlate || 0)
                                                : (item.localPrice || item.pricePerBottle || 0)
                                        ).toFixed(2)}
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <div className="text-xs text-gray-500">Foreign</div>
                                    <div className="text-sm font-bold text-green-600">
                                        LKR {(
                                            item.type === 'bites' 
                                                ? (item.foreignPricePerPlate || item.pricePerPlate || 0)
                                                : (item.foreignPrice || item.pricePerBottle || 0)
                                        ).toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">In Stock</div>
                        <div className={`text-lg font-semibold ${isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                            {item.type === 'cigarettes' ? (
                                // Special display for cigarettes
                                <div>
                                    <div>{item.quantity || item.bottlesInStock || 0} packs</div>
                                    <div className="text-sm text-gray-500">
                                        ({((item.quantity || item.bottlesInStock || 0) * (item.cigarettesPerPack || 20)) - (item.individualCigaretteSales || 0)} remaining)
                                    </div>
                                </div>
                            ) : item.type === 'bites' ? (
                                `${item.platesInStock || item.quantity || 0} plates in stock`
                            ) : item.type === 'ice_cubes' ? (
                                `${item.quantity || item.bottlesInStock || 0} bowls in stock`
                            ) : item.type === 'sandy_bottles' ? (
                                `${item.quantity || item.bottlesInStock || 0} bottles in stock`
                            ) : (
                                `${item.quantity || item.bottlesInStock || 0} ${
                                    item.unit || (item.type === 'hard_liquor' ? 'bottle' : 'unit')
                                }s`
                            )}
                        </div>
                    </div>
                </div>

                {/* Type Specific Information */}
                {item.category !== 'cigarette' && item.type !== 'ice_cubes' && item.type !== 'sandy_bottles' && item.type !== 'beer' && item.type !== 'bites' && (
                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <div className="text-sm text-gray-600">Volume</div>
                            <div className="text-lg font-semibold text-gray-900">
                                {item.volume}{item.volumeUnit}
                            </div>
                        </div>
                        {item.alcoholPercentage && (
                            <div>
                                <div className="text-sm text-gray-600">Alcohol %</div>
                                <div className="text-lg font-semibold text-blue-600">
                                    {item.alcoholPercentage}%
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Bites Specific Information */}
                {item.type === 'bites' && (
                    <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-2 rounded border">
                                <div className="text-sm text-gray-600">Plates Sold</div>
                                <div className="text-md font-semibold text-purple-600">
                                    {item.totalSoldItems || 0} plates
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                                <div className="text-sm text-gray-600">Revenue</div>
                                <div className="text-md font-semibold text-green-600">
                                    LKR {((item.totalSoldItems || 0) * (item.localPricePerPlate || item.pricePerPlate || 0)).toFixed(2)}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                {item.type === 'cigarettes' && (
                    <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <div>
                                <div className="text-sm text-gray-600">Cigarettes per Pack</div>
                                <div className="text-lg font-semibold text-orange-600">
                                    {item.cigarettesPerPack || 20} pieces
                                </div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600">Individual Price</div>
                                <div className="text-lg font-semibold text-green-600">
                                    LKR {item.cigaretteIndividualPrice ? Number(item.cigaretteIndividualPrice).toFixed(2) : 'N/A'}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white p-2 rounded border">
                                <div className="text-sm text-gray-600">Packs Sold</div>
                                <div className="text-md font-semibold text-purple-600">
                                    {item.totalSoldItems || 0} packs
                                </div>
                            </div>
                            <div className="bg-white p-2 rounded border">
                                <div className="text-sm text-gray-600">Individual Sales</div>
                                <div className="text-md font-semibold text-blue-600">
                                    {item.individualCigaretteSales || 0} pieces
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sales and Analytics Information */}
                {item.type !== 'beer' && item.type !== 'cigarettes' && item.type !== 'ice_cubes' && item.type !== 'sandy_bottles' && item.type !== 'bites' &&(
                    <>
                        <div className="bg-gray-50 rounded-lg p-3 mt-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-2 rounded border">
                                    <div className="text-sm text-gray-600">Total Remaining</div>
                                    <div className="text-md font-semibold text-green-600">
                                        {Math.round(item.totalVolumeRemaining || 0)}ml
                                    </div>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                    <div className="text-sm text-gray-600">Current Bottle</div>
                                    <div className="text-md font-semibold text-yellow-600">
                                        {Math.round(item.currentBottleVolume || 0)}ml
                                    </div>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                    <div className="text-sm text-gray-600">Total Sold</div>
                                    <div className="text-md font-semibold text-purple-600">
                                        {item.totalSoldItems || 0}
                                    </div>
                                </div>
                                <div className="bg-white p-2 rounded border">
                                    <div className="text-sm text-gray-600">Total Wasted</div>
                                    <div className="text-md font-semibold text-red-600">
                                        {Math.round(item.wastedVolume || 0)}ml
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Analytics Card */}
                        <div className="mt-4">
                            <LiquorAnalyticsCard liquor={item} />
                        </div>
                    </>
                )}
            </div>
            {/* Footer */}
            <div className="p-4 border-t mt-auto bg-gray-50">
                <div className="flex gap-2 justify-end">
                    <SecondaryButton
                        onClick={handleEdit}
                        className="!px-3 !py-1.5 text-sm flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                    </SecondaryButton>
                    <SecondaryButton
                        onClick={handleDelete}
                        className="!px-3 !py-1.5 text-sm !text-red-600 !border-red-600 hover:!bg-red-600 hover:!text-white flex items-center"
                    >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
});

LiquorItemCard.propTypes = {
    item: PropTypes.object.isRequired,
    onEdit: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired
};

export default LiquorItemCard;
