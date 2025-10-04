import React, { memo, useState } from 'react';
import { PrimaryButton, SecondaryButton } from '../../../../components/Button';
import { FaEdit, FaTrash } from 'react-icons/fa';

const MenuItemCard = memo(function MenuItemCard({ item, onEdit, onDelete }) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        onDelete(item.id);
        setShowDeleteModal(false);
    };

    const handleCancelDelete = () => {
        setShowDeleteModal(false);
    };

    const getCategoryColor = (category) => {
        const colors = {
            'Foods': 'bg-green-100 text-green-800',
            'Liquor': 'bg-purple-100 text-purple-800',
            'Cigarettes': 'bg-gray-100 text-gray-800',
            'Bites': 'bg-orange-100 text-orange-800',
            'Beverage': 'bg-yellow-100 text-yellow-800',
            'Others': 'bg-yellow-100 text-yellow-800'
        };
        return colors[category] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow h-fit">
            {/* Item Header */}
            <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                    <h3 className="font-semibold text-other1 text-lg mb-1">{item.name}</h3>
                    <div className="flex gap-2 flex-wrap">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getCategoryColor(item.category)}`}>
                            {item.category}
                        </span>
                        {item.category === 'Liquor' && (
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                {item.volume}ml
                            </span>
                        )}
                        {item.category === 'Cigarettes' && (
                            <span className="inline-block px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                {item.unitsPerPack} per pack
                            </span>
                        )}
                    </div>
                </div>
                <div className="text-right">
                    {/* Dual Pricing Display */}
                    <div className="space-y-1">
                        <div className="flex justify-end gap-4">
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Local</div>
                                <div className="text-sm font-bold text-blue-600">
                                    LKR {(item.localPrice || item.price)?.toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xs text-gray-500">Foreign</div>
                                <div className="text-sm font-bold text-green-600">
                                    LKR {(item.foreignPrice || item.price)?.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Description */}
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {item.description}
            </p>
            
            {/* Item Details */}
            <div className="mb-4 space-y-1">
                {(item.category === 'Liquor' || item.category === 'Cigarettes') && (
                    <div className="text-xs text-yellow-600 bg-yellow-50 rounded px-2 py-1 inline-flex items-center gap-1">
                        ✨ {item.category === 'Liquor' ? 'Portion' : 'Pack'} tracking enabled
                    </div>
                )}
            </div>
            
            {/* Action Buttons - Hide for Cigarettes */}
            {item.category !== 'Cigarettes' && (
                <div className="flex gap-2">
                    <PrimaryButton
                        onClick={() => onEdit(item)}
                        className="flex-1 flex items-center justify-center gap-2 text-sm py-2"
                    >
                        <FaEdit size={12} />
                        Edit
                    </PrimaryButton>
                    <SecondaryButton
                        onClick={handleDeleteClick}
                        className="flex-1 flex items-center justify-center gap-2 text-sm py-2 bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                    >
                        <FaTrash size={12} />
                        Delete
                    </SecondaryButton>
                </div>
            )}
            
            {/* Info message for Cigarettes */}
            {item.category === 'Cigarettes' && (
                <div className="text-center py-2">
                    <p className="text-xs text-gray-500">
                        Cigarette items are managed through Stock Management
                    </p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-other1 mb-2">Confirm Delete</h3>
                            <p className="text-text">
                                Are you sure you want to delete <strong>{item.name}</strong>? 
                                This action cannot be undone.
                            </p>
                        </div>
                        
                        <div className="flex gap-3 justify-end">
                            <SecondaryButton type="button" onClick={handleCancelDelete}>
                                Cancel
                            </SecondaryButton>
                            <PrimaryButton 
                                type="button" 
                                onClick={handleConfirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white"
                            >
                                Delete
                            </PrimaryButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
});

export default MenuItemCard;
