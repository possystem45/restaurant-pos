import React, { useState, useCallback, useMemo } from 'react';
import LiquorForm from './components/LiquorForm';
import LiquorItemCard from './components/LiquorItemCard';

export default function LiquorManager() {
    const [liquorItems, setLiquorItems] = useState([
        { id: 1, name: 'Budweiser', category: 'beer', quantity: 48, unit: 'bottle', localPrice: 3.50, foreignPrice: 4.50, pricePerUnit: 3.50, volume: 330, volumeUnit: 'ml' },
        { id: 2, name: 'Corona Extra', category: 'beer', quantity: 24, unit: 'bottle', localPrice: 4.25, foreignPrice: 5.25, pricePerUnit: 4.25, volume: 355, volumeUnit: 'ml' },
        { id: 3, name: 'Jack Daniels', category: 'hard_liquor', quantity: 6, unit: 'bottle', localPrice: 45.99, foreignPrice: 65.99, pricePerUnit: 45.99, volume: 750, volumeUnit: 'ml' },
        { id: 4, name: 'Johnnie Walker Black', category: 'hard_liquor', quantity: 3, unit: 'bottle', localPrice: 65.00, foreignPrice: 85.00, pricePerUnit: 65.00, volume: 750, volumeUnit: 'ml' },
        { id: 5, name: 'Chicken Wings', category: 'bites', type: 'bites', servingSize: 'medium', platesInStock: 20, localPricePerPlate: 850.00, foreignPricePerPlate: 1050.00, pricePerPlate: 850.00, ingredients: 'Chicken wings, spices, sauce', spiceLevel: 'medium' },
        { id: 6, name: 'Fish Fingers', category: 'bites', type: 'bites', servingSize: 'small', platesInStock: 15, localPricePerPlate: 650.00, foreignPricePerPlate: 850.00, pricePerPlate: 650.00, ingredients: 'Fish fillets, breadcrumbs, herbs', spiceLevel: 'mild' },
        { id: 7, name: 'John Player Gold Leaf (12)', category: 'cigarette', cigaretteType: 'john_player_gold_leaf_12', quantity: 15, unit: 'pack', localPrice: 920.00, foreignPrice: 1120.00, pricePerUnit: 920.00 },
        { id: 8, name: 'John Player Gold Leaf (20)', category: 'cigarette', cigaretteType: 'john_player_gold_leaf_20', quantity: 0, unit: 'pack', localPrice: 900.00, foreignPrice: 1100.00, pricePerUnit: 900.00 }
    ]);

    const [editingItem, setEditingItem] = useState(null);

    // Memoized function to get items by category
    const getItemsByCategory = useCallback((category) => {
        return liquorItems.filter(item => item.category === category);
    }, [liquorItems]);

    // Memoized function to get items by cigarette type
    const getItemsByCigaretteType = useCallback((cigaretteType) => {
        return liquorItems.filter(item => 
            item.category === 'cigarette' && item.cigaretteType === cigaretteType
        );
    }, [liquorItems]);

    // Memoized cigarette subcategories configuration
    const cigaretteSubcategories = useMemo(() => [
        { key: 'dunhill_blue', name: 'Dunhill Blue' },
        { key: 'dunhill_tube', name: 'Dunhill Tube' },
        { key: 'john_player_gold_leaf_20', name: 'John Player Gold Leaf (20\'s)' },
        { key: 'john_player_gold_leaf_12', name: 'John Player Gold Leaf (12\'s)' },
        { key: 'john_player_gold_pro', name: 'John Player Gold Pro' }
    ], []);

    // Memoized categories with dynamic data
    const categories = useMemo(() => [
        { 
            key: 'beer', 
            name: 'Beer', 
            items: getItemsByCategory('beer'),
            type: 'regular'
        },
        { 
            key: 'hard_liquor', 
            name: 'Hard Liquor', 
            items: getItemsByCategory('hard_liquor'),
            type: 'regular'
        },
        { 
            key: 'bites', 
            name: 'Bites', 
            items: getItemsByCategory('bites'),
            type: 'regular'
        },
        { 
            key: 'cigarette', 
            name: 'Cigarettes', 
            items: getItemsByCategory('cigarette'),
            type: 'cigarette',
            subcategories: cigaretteSubcategories.map(sub => ({
                ...sub,
                items: getItemsByCigaretteType(sub.key)
            }))
        }
    ], [getItemsByCategory, getItemsByCigaretteType, cigaretteSubcategories]);

    // Memoized total value calculation
    const totalValue = useMemo(() => {
        return liquorItems.reduce((total, item) => total + (item.quantity * item.pricePerUnit), 0);
    }, [liquorItems]);

    // Memoized callback for form submission
    const handleLiquorSubmit = useCallback((formData) => {
        if (formData.mode === 'new') {
            // Add new item
            const newItem = {
                id: Math.max(...liquorItems.map(item => item.id), 0) + 1,
                name: formData.name,
                brand: formData.brand,
                type: formData.type,
                category: formData.category,
                cigaretteType: formData.cigaretteType,
                quantity: formData.bottlesInStock || formData.platesInStock || formData.quantity,
                unit: formData.unit,
                // Dual pricing support
                localPrice: formData.localPrice || formData.localPricePerPlate,
                foreignPrice: formData.foreignPrice || formData.foreignPricePerPlate,
                // Keep for backward compatibility
                pricePerUnit: formData.localPrice || formData.localPricePerPlate || formData.pricePerUnit,
                pricePerPlate: formData.localPricePerPlate || formData.pricePerPlate,
                pricePerBottle: formData.localPrice || formData.pricePerBottle,
                // Add volume info for liquor items only
                ...(formData.category !== 'cigarette' && formData.type !== 'bites' && {
                    volume: formData.bottleVolume || formData.volume || 0,
                    volumeUnit: formData.volumeUnit || 'ml',
                    alcoholPercentage: formData.alcoholPercentage
                }),
                // Bites specific fields
                ...(formData.type === 'bites' && {
                    platesInStock: formData.platesInStock,
                    localPricePerPlate: formData.localPricePerPlate,
                    foreignPricePerPlate: formData.foreignPricePerPlate,
                    ingredients: formData.ingredients,
                    spiceLevel: formData.spiceLevel
                })
            };
            setLiquorItems(prev => [...prev, newItem]);
        } else {
            // Update existing item
            setLiquorItems(prev => prev.map(item => 
                item.id === formData.id 
                    ? { 
                        ...item,
                        name: formData.name,
                        brand: formData.brand,
                        type: formData.type,
                        // Dual pricing support
                        localPrice: formData.localPrice || formData.localPricePerPlate,
                        foreignPrice: formData.foreignPrice || formData.foreignPricePerPlate,
                        // Keep for backward compatibility
                        pricePerUnit: formData.localPrice || formData.localPricePerPlate || formData.pricePerUnit,
                        pricePerPlate: formData.localPricePerPlate || formData.pricePerPlate,
                        pricePerBottle: formData.localPrice || formData.pricePerBottle,
                        quantity: formData.bottlesInStock || formData.platesInStock || formData.quantity,
                        // Update volume if it's a liquor item
                        ...(item.category !== 'cigarette' && item.type !== 'bites' && {
                            volume: formData.bottleVolume || formData.volume || item.volume,
                            volumeUnit: formData.volumeUnit || item.volumeUnit,
                            alcoholPercentage: formData.alcoholPercentage
                        }),
                        // Bites specific updates
                        ...(formData.type === 'bites' && {
                            platesInStock: formData.platesInStock,
                            localPricePerPlate: formData.localPricePerPlate,
                            foreignPricePerPlate: formData.foreignPricePerPlate,
                            ingredients: formData.ingredients,
                            spiceLevel: formData.spiceLevel
                        })
                    }
                    : item
            ));
        }
        setEditingItem(null);
    }, [liquorItems]);

    // Memoized callback for editing item
    const handleEditItem = useCallback((item) => {
        setEditingItem(item);
        // Scroll to top of the page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }, []);

    // Memoized callback for deleting item
    const handleDeleteItem = useCallback((itemId) => {
        setLiquorItems(prev => prev.filter(item => item.id !== itemId));
    }, []);

    // Memoized callback for canceling edit
    const handleCancelEdit = useCallback(() => {
        setEditingItem(null);
    }, []);

    // Memoized render function for item grid
    const renderItemGrid = useCallback((items, gridKey) => (
        <div key={gridKey} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => (
                <LiquorItemCard
                    key={item.id}
                    item={item}
                    onEdit={handleEditItem}
                    onDelete={handleDeleteItem}
                />
            ))}
        </div>
    ), [handleEditItem, handleDeleteItem]);

    // Memoized render function for category section
    const renderCategorySection = useCallback((category) => {
        if (category.items.length === 0) return null;

        return (
            <div key={category.key}>
                <h2 className="text-lg font-semibold text-other1 mb-3">
                    {category.name} ({category.items.length})
                </h2>
                {category.type === 'cigarette' ? (
                    // Render cigarette subcategories
                    category.subcategories.map(subcategory => (
                        subcategory.items.length > 0 && (
                            <div key={subcategory.key} className="ml-4 mb-4">
                                <h3 className="text-md font-medium text-other1 mb-2">
                                    {subcategory.name} ({subcategory.items.length})
                                </h3>
                                {renderItemGrid(subcategory.items, `${category.key}-${subcategory.key}`)}
                            </div>
                        )
                    ))
                ) : (
                    // Render regular category items
                    renderItemGrid(category.items, category.key)
                )}
            </div>
        );
    }, [renderItemGrid]);

    // Memoized stats section
    const statsSection = useMemo(() => (
        <div className="text-sm text-gray-600">
            <div>Total Items: {liquorItems.length}</div>
            <div>Total Value: LKR {totalValue.toFixed(2)}</div>
        </div>
    ), [liquorItems.length, totalValue]);

    // Memoized empty state
    const emptyState = useMemo(() => (
        <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-other1 mb-2">No Liquor Items</h3>
            <p className="text-gray-500">Start by adding your first liquor item above.</p>
        </div>
    ), []);

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-other1">Liquor Management</h1>
                {statsSection}
            </div>

            {/* Liquor Form */}
            <LiquorForm
                existingItems={liquorItems}
                editingItem={editingItem}
                onSubmit={handleLiquorSubmit}
                onCancel={editingItem ? handleCancelEdit : null}
            />

            {/* Liquor Items Display */}
            <div className="space-y-6">
                {categories.map(renderCategorySection)}
            </div>

            {/* Empty State */}
            {liquorItems.length === 0 && emptyState}
        </div>
    );
}
