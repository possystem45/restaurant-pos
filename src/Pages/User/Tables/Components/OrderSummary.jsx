import React, { useState, useCallback, useMemo, memo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { PrimaryButton, SecondaryButton } from '../../../../components/Button';
import { FaPlus, FaMinus, FaTrash, FaReceipt } from 'react-icons/fa';
import MenuItem from './MenuItem';
import ConfirmationModal from '../../../../components/ConfirmationModal';

const OrderSummary = memo(function OrderSummary({
    selectedTable,
    bill,
    menuItems, // Now receiving real API-based menu items
    customerType = 'local', // New prop for customer type
    onCreateBill,
    onAddItem,
    onRemoveItem,
    onUpdateQuantity,
    onToggleServiceCharge,
    onToggleCustomerType, // New prop for toggling customer type
    onToggleEmptyBottle, // New prop for toggling empty bottle return
    onEmptyBottleCountChange, // New prop for changing empty bottle count
    onCloseBill
}) {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [showPaymentModal, setShowPaymentModal] = useState(false);



    // Memoize categories to prevent recalculation on every render
    const categories = useMemo(() => {
        const allCategories = ['All', ...new Set(menuItems.map(item => item.category))];
        // Ensure categories are in a specific order
        const orderedCategories = ['All'];
        const foodCategories = ['Foods', 'Rice Dishes', 'Bites', 'Beverage'];
        const liquorCategories = ['Hard Liquor', 'Beer', 'Wine', 'Cigarettes'];
        const otherCategories = ['Others'];

        // Add categories in order if they exist
        [...foodCategories, ...liquorCategories, ...otherCategories].forEach(cat => {
            if (allCategories.includes(cat) && !orderedCategories.includes(cat)) {
                orderedCategories.push(cat);
            }
        });

        // Add any remaining categories
        allCategories.forEach(cat => {
            if (!orderedCategories.includes(cat)) {
                orderedCategories.push(cat);
            }
        });

        return orderedCategories;
    }, [menuItems]);

    // Memoize filtered menu items
    const filteredMenuItems = useMemo(() => {
        return selectedCategory === 'All' 
            ? menuItems 
            : menuItems.filter(item => item.category === selectedCategory);
    }, [selectedCategory, menuItems]);

    // Callback for category selection
    const handleCategorySelect = useCallback((category) => {
        setSelectedCategory(category);
    }, []);

    // Callback for bill creation
    const handleCreateBill = useCallback(() => {
        if (selectedTable) {
            onCreateBill(selectedTable.id);
        }
    }, [selectedTable, onCreateBill]);

    // Callback for closing bill
    const handleCloseBill = useCallback(() => {
        if (selectedTable) {
            // Allow closing bills even if no items have been added
            onCloseBill(selectedTable.id);
        }
    }, [selectedTable, onCloseBill]);

    // Callback for toggling service charge
    const handleToggleServiceCharge = useCallback(() => {
        if (selectedTable) {
            onToggleServiceCharge(selectedTable.id);
        }
    }, [selectedTable, onToggleServiceCharge]);

    // Callback for updating item quantity
    const handleUpdateQuantity = useCallback((itemId, newQuantity) => {
        if (selectedTable) {
            onUpdateQuantity(selectedTable.id, itemId, newQuantity);
        }
    }, [selectedTable, onUpdateQuantity]);

    // Empty bottle handlers
    const handleToggleEmptyBottle = useCallback(() => {
        if (selectedTable) {
            onToggleEmptyBottle(selectedTable.id);
        }
    }, [selectedTable, onToggleEmptyBottle]);

    const handleEmptyBottleCountChange = useCallback((change) => {
        if (selectedTable) {
            onEmptyBottleCountChange(selectedTable.id, change);
        }
    }, [selectedTable, onEmptyBottleCountChange]);

    // Callback for removing item
    const handleRemoveItem = useCallback((itemId) => {
        if (selectedTable) {
            onRemoveItem(selectedTable.id, itemId);
        }
    }, [selectedTable, onRemoveItem]);

    // Function to get the correct price for an item based on customer type
    const getItemPrice = useCallback((item) => {
        // Find the original menu item to get pricing info
        const menuItem = menuItems.find(m => 
            m.id === item.id || 
            m.id === item.originalItemId || 
            item.id.startsWith(m.id)
        );
        
        // Handle portion items - recalculate based on customer type
        if (item.portion && menuItem && menuItem.portions) {
            const originalPortion = menuItem.portions.find(portion => 
                portion.volume === item.portion.ml && portion.name === item.portion.type
            );
            if (originalPortion) {
                return customerType === 'foreign' 
                    ? (originalPortion.foreignPrice || originalPortion.localPrice || originalPortion.price || 0)
                    : (originalPortion.localPrice || originalPortion.price || 0);
            }
            // Fallback to stored portion price if original not found
            return item.portion.price;
        }
        
        // Handle cigarette items
        if (item.isIndividual && menuItem) {
            const basePrice = customerType === 'foreign'
                ? (menuItem.cigaretteForeignPrice || menuItem.cigaretteLocalPrice || menuItem.cigaretteIndividualPrice || 0)
                : (menuItem.cigaretteLocalPrice || menuItem.cigaretteIndividualPrice || 0);
            return basePrice * (item.quantity || 1);
        }
        
        // Handle regular items (full bottles, packs, etc.)
        if (menuItem) {
            if (customerType === 'foreign') {
                return menuItem.foreignPrice || menuItem.localPrice || menuItem.price || 0;
            } else {
                return menuItem.localPrice || menuItem.price || 0;
            }
        }
        
        // Fallback to stored price if menu item not found
        return item.price || 0;
    }, [menuItems, customerType]);

    // Memoize bill calculations with dynamic pricing
    const billCalculations = useMemo(() => {
        if (!bill) return null;
        
        // Calculate subtotal based on current customer type pricing
        const subtotal = bill.items.reduce((sum, item) => {
            const currentPrice = getItemPrice(item);
            return sum + (currentPrice * item.quantity);
        }, 0);
        
        const serviceCharge = bill.serviceCharge ? subtotal * 0.1 : 0;
        
        // Empty bottle deduction
        const emptyBottleDeduction = (bill.emptyBottleCount || 0) * 100;
        
        const total = subtotal + serviceCharge - emptyBottleDeduction;
        const itemCount = bill.items.reduce((sum, item) => sum + item.quantity, 0);
        
        return {
            subtotal,
            serviceCharge,
            emptyBottleDeduction,
            total,
            itemCount
        };
    }, [bill, getItemPrice]);

    // Memoize quantity control buttons configuration
    const quantityControlButtons = useMemo(() => [
        {
            id: 'decrease',
            icon: FaMinus,
            onClick: (itemId, quantity) => handleUpdateQuantity(itemId, quantity - 1),
            className: "p-1 text-red-500 hover:bg-red-50 rounded",
            size: 10
        },
        {
            id: 'increase',
            icon: FaPlus,
            onClick: (itemId, quantity) => handleUpdateQuantity(itemId, quantity + 1),
            className: "p-1 text-green-500 hover:bg-green-50 rounded",
            size: 10
        },
        {
            id: 'delete',
            icon: FaTrash,
            onClick: (itemId) => handleRemoveItem(itemId),
            className: "p-1 text-red-500 hover:bg-red-50 rounded ml-2",
            size: 10
        }
    ], [handleUpdateQuantity, handleRemoveItem]);

    // Memoized render function for quantity controls
    const renderQuantityControls = useCallback((item) => {
        return (
            <div className="flex items-center gap-2">
                {quantityControlButtons.map((button) => {
                    const IconComponent = button.icon;
                    
                    if (button.id === 'decrease' || button.id === 'increase') {
                        return (
                            <button
                                key={button.id}
                                onClick={() => button.onClick(item.id, item.quantity)}
                                className={button.className}
                            >
                                <IconComponent size={button.size} />
                            </button>
                        );
                    } else if (button.id === 'delete') {
                        return (
                            <button
                                key={button.id}
                                onClick={() => button.onClick(item.id)}
                                className={button.className}
                            >
                                <IconComponent size={button.size} />
                            </button>
                        );
                    }
                    return null;
                })}
                <span className="w-8 text-center text-sm font-medium text-other1">{item.quantity}</span>
            </div>
        );
    }, [quantityControlButtons]);

    // Memoize date formatting function
    const formatBillDate = useCallback((date) => {
        return new Date(date).toLocaleString();
    }, []);

    // Callback for printing bill
    const handlePrintBill = useCallback(() => {
        if (!bill || !selectedTable) return;
        
        // Create print content
        const printContent = `
            <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="margin: 0; font-size: 24px;">Restaurant Bill</h2>
                    <p style="margin: 5px 0;">Table ${selectedTable.tableNumber}</p>
                    <p style="margin: 5px 0; font-size: 12px;">${formatBillDate(bill.createdAt)}</p>
                </div>
                
                <div style="border-top: 2px solid #003151; padding-top: 10px;">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="border-bottom: 1px solid #003151;">
                                <th style="text-align: left; padding: 5px 0;">Item</th>
                                <th style="text-align: center; padding: 5px 0;">Qty</th>
                                <th style="text-align: right; padding: 5px 0;">Price</th>
                                <th style="text-align: right; padding: 5px 0;">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${bill.items.map(item => `
                                <tr>
                                    <td style="padding: 3px 0; font-size: 12px;">
                                        ${item.name}
                                    </td>
                                    <td style="text-align: center; padding: 3px 0;">${item.quantity}</td>
                                    <td style="text-align: right; padding: 3px 0;">LKR ${item.price}</td>
                                    <td style="text-align: right; padding: 3px 0;">LKR ${(item.price * item.quantity).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div style="border-top: 2px solid #003151; padding-top: 10px; margin-top: 15px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                        <span>Subtotal:</span>
                        <span>LKR ${billCalculations.subtotal.toFixed(2)}</span>
                    </div>
                    ${bill.serviceCharge ? `
                        <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                            <span>Service Charge (10%):</span>
                            <span>LKR ${billCalculations.serviceCharge.toFixed(2)}</span>
                        </div>
                    ` : ''}
                    <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 18px; border-top: 1px solid #003151; padding-top: 5px;">
                        <span>Total:</span>
                        <span>LKR ${billCalculations.total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px; font-size: 12px;">
                    <p>Thank you for dining with us!</p>
                    <p>Items: ${billCalculations.itemCount}</p>
                </div>
            </div>
        `;
        
        // Open print window
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
                <head>
                    <title>Bill - Table ${selectedTable.tableNumber}</title>
                    <style>
                        @media print {
                            body { margin: 0; }
                        }
                    </style>
                </head>
                <body>
                    ${printContent}
                    <script>
                        window.onload = function() {
                            window.print();
                            window.onafterprint = function() {
                                window.close();
                            }
                        }
                    </script>
                </body>
            </html>
        `);
        printWindow.document.close();
    }, [bill, selectedTable, billCalculations, formatBillDate]);

    // Callback for payment completion
    const handlePaymentComplete = useCallback(() => {
        setShowPaymentModal(true);
    }, []);

    // Callback for payment completion
    const confirmPayment = useCallback(() => {
        if (selectedTable && bill) {
            // Payment processing is now handled in TableManagement component
            handleCloseBill();
        }
        setShowPaymentModal(false);
    }, [selectedTable, bill, handleCloseBill]);

    const cancelPayment = useCallback(() => {
        setShowPaymentModal(false);
    }, []);

    // Memoize bill status checks
    const billStatus = useMemo(() => {
        return {
            hasActiveBill: bill && (bill.status === 'created' || bill.status === 'pending'),
            hasItems: bill?.items?.length > 0,
            isNoBill: !bill || bill.status === 'closed'
        };
    }, [bill]);

    // Memoize the no table selected content
    const noTableContent = useMemo(() => (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <div className="text-6xl mb-4">🍽️</div>
                <h2 className="text-xl font-semibold text-other1 mb-2">Select a Table</h2>
                <p className="text-text">Click on a table to view or create orders</p>
            </div>
        </div>
    ), []);

    // Memoize the no active bill content
    const noActiveBillContent = useMemo(() => (
        <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center text-center">
                <div className="text-6xl mb-4">📋</div>
                <h2 className="text-xl font-semibold text-other1 mb-4">No Active Bill</h2>
                <p className="text-text mb-6">Create a new bill for Table {selectedTable?.tableNumber}</p>
                <PrimaryButton onClick={handleCreateBill} className='flex items-center gap-1'>
                    <FaReceipt className="mr-2" />
                    Create New Bill
                </PrimaryButton>
            </div>
        </div>
    ), [selectedTable?.tableNumber, handleCreateBill]);

    // Memoize the empty cart content
    const emptyCartContent = useMemo(() => (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl mb-2">🛒</div>
                <p className="text-text">No items added yet</p>
            </div>
        </div>
    ), []);

    if (!selectedTable) {
        return noTableContent;
    }

    return (
        <div className="h-full flex flex-col">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 sm:mb-4 gap-2 sm:gap-0">
                <h1 className="text-lg sm:text-xl lg:text-[24px] font-[500] text-other1">
                    Table {selectedTable.tableNumber} - Order Summary
                </h1>
                {billStatus.hasActiveBill && (
                    <SecondaryButton onClick={handleCloseBill} className="text-sm sm:text-base px-3 sm:px-4 py-2">
                        Close Bill
                    </SecondaryButton>
                )}
            </div>

            {billStatus.isNoBill ? (
                // No active bill - show create bill option
                noActiveBillContent
            ) : (
                // Active bill exists - show order management
                <div className="flex-1 flex flex-col lg:flex-row gap-3 sm:gap-4 overflow-hidden">
                    {/* Menu Items Section */}
                    <div className="flex-1 flex flex-col min-h-0">
                        <h3 className="text-base sm:text-lg font-semibold text-other1 mb-2 sm:mb-3">Menu Items</h3>
                        
                        {/* Category Filter */}
                        <div className="flex gap-1 sm:gap-2 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide">
                            {categories.map(category => (
                                <button
                                    key={category}
                                    onClick={() => handleCategorySelect(category)}
                                    className={`px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap flex-shrink-0 ${
                                        selectedCategory === category
                                            ? 'bg-primaryColor text-white'
                                            : 'bg-white text-other1 hover:bg-gray-100'
                                    }`}
                                >
                                    {category}
                                </button>
                            ))}
                        </div>

                        {/* Menu Items Grid */}
                        <div className="flex-1 overflow-y-auto">
                            {filteredMenuItems.length === 0 ? (
                                <div className="flex items-center justify-center h-32">
                                    <div className="text-center">
                                        <p className="text-sm text-gray-600">No items found in this category</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2 sm:gap-3">
                                    {filteredMenuItems.map(item => (
                                        <MenuItem 
                                            key={item.id}
                                            item={item} 
                                            customerType={customerType}
                                            onAddItem={onAddItem} 
                                            selectedTable={selectedTable}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Current Bill Section */}
                    <div className="w-96  bg-white rounded-lg p-3 sm:p-4 border border-gray-200 flex flex-col order-first lg:order-last">
                        <div className="flex justify-between items-center mb-2 sm:mb-3">
                            <h3 className="text-base sm:text-lg font-semibold text-other1">Current Bill</h3>
                            {/* Customer Type Toggle - Only show when bill has been created */}
                            {billStatus.hasActiveBill && (
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs font-medium ${customerType === 'local' ? 'text-blue-600' : 'text-gray-500'}`}>
                                        Local
                                    </span>
                                    <button
                                        onClick={onToggleCustomerType}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                            customerType === 'foreign' ? 'bg-blue-600' : 'bg-gray-300'
                                        }`}
                                        role="switch"
                                        aria-checked={customerType === 'foreign'}
                                        title={`Switch to ${customerType === 'local' ? 'foreign' : 'local'} prices`}
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
                                                customerType === 'foreign' ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                        />
                                    </button>
                                    <span className={`text-xs font-medium ${customerType === 'foreign' ? 'text-blue-600' : 'text-gray-500'}`}>
                                        Foreign
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {!billStatus.hasItems ? (
                            emptyCartContent
                        ) : (
                            <>
                                {/* Bill Items */}
                                <div className="flex-1 overflow-y-auto mb-3 sm:mb-4 max-h-48 lg:max-h-none">
                                    {bill.items.map(item => {
                                        const currentPrice = getItemPrice(item);
                                        return (
                                            <div key={item.id} className="flex justify-between items-center py-1.5 sm:py-2 border-b border-gray-100">
                                                <div className="flex-1 min-w-0 pr-2">
                                                    <h5 className="font-medium text-other1 text-xs sm:text-sm truncate">{item.name}</h5>
                                                    <p className="text-xs text-gray-600">
                                                        LKR {currentPrice} each
                                                    </p>
                                                </div>
                                                {renderQuantityControls(item)}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Bill Total */}
                                <div className="border-t border-gray-200 pt-3 sm:pt-4">
                                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                                        <span className="text-xs sm:text-sm text-gray-600">Subtotal:</span>
                                        <span className="font-medium text-other1 text-sm">LKR {billCalculations.subtotal.toFixed(2)}</span>
                                    </div>
                                    
                                    {/* Service Charge Toggle */}
                                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <span className="text-xs sm:text-sm text-gray-600">Service Charge (10%):</span>
                                            <input
                                                type="checkbox"
                                                checked={bill.serviceCharge}
                                                onChange={handleToggleServiceCharge}
                                                className="w-3 h-3 sm:w-4 sm:h-4 appearance-none rounded 
                                                            border border-gray-300 bg-white
                                                            checked:bg-primaryColor checked:border-primaryColor
                                                            focus:ring-0 focus:outline-none
                                                            relative flex items-center justify-center
                                                            checked:after:content-['✓'] 
                                                            checked:after:absolute 
                                                            checked:after:text-white 
                                                            checked:after:text-xs 
                                                            checked:after:font-bold
                                                            checked:after:left-1/2 
                                                            checked:after:top-1/2
                                                            checked:after:transform 
                                                            checked:after:-translate-x-1/2 
                                                            checked:after:-translate-y-1/2"
                                                />                                            
                                        </div>
                                        <span className="font-medium text-other1 text-sm">
                                            LKR {billCalculations.serviceCharge.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Empty Bottle Return */}
                                    <div className="flex justify-between items-center mb-1 sm:mb-2">
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <span className="text-xs sm:text-sm text-gray-600">Empty Bottle Return:</span>
                                            <input
                                                type="checkbox"
                                                checked={bill.emptyBottleReturn || false}
                                                onChange={handleToggleEmptyBottle}
                                                className="w-3 h-3 sm:w-4 sm:h-4 appearance-none rounded 
                                                            border border-gray-300 bg-white
                                                            checked:bg-green-500 checked:border-green-500
                                                            focus:ring-0 focus:outline-none
                                                            relative flex items-center justify-center
                                                            checked:after:content-['✓'] 
                                                            checked:after:absolute 
                                                            checked:after:text-white 
                                                            checked:after:text-xs 
                                                            checked:after:font-bold
                                                            checked:after:left-1/2 
                                                            checked:after:top-1/2
                                                            checked:after:transform 
                                                            checked:after:-translate-x-1/2 
                                                            checked:after:-translate-y-1/2"
                                                />
                                        </div>
                                        <span className="font-medium text-green-600 text-sm">
                                            -LKR {billCalculations.emptyBottleDeduction.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Empty Bottle Count Controls - Only show when checkbox is checked */}
                                    {bill.emptyBottleReturn && (
                                        <div className="flex justify-between items-center mb-1 sm:mb-2 ml-4">
                                            <span className="text-xs text-gray-500">Bottle Count:</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEmptyBottleCountChange(-1)}
                                                    disabled={(bill.emptyBottleCount || 0) <= 0}
                                                    className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center text-red-600 disabled:text-gray-400"
                                                >
                                                    <FaMinus size={10} />
                                                </button>
                                                <span className="font-medium text-sm min-w-[20px] text-center">
                                                    {bill.emptyBottleCount || 0}
                                                </span>
                                                <button
                                                    onClick={() => handleEmptyBottleCountChange(1)}
                                                    disabled={(bill.emptyBottleCount || 0) >= 20}
                                                    className="w-6 h-6 rounded-full bg-green-100 hover:bg-green-200 disabled:bg-gray-100 disabled:cursor-not-allowed flex items-center justify-center text-green-600 disabled:text-gray-400"
                                                >
                                                    <FaPlus size={10} />
                                                </button>
                                                <span className="text-xs text-gray-500">× LKR 100</span>
                                            </div>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between items-center text-base sm:text-lg font-bold border-t border-gray-200 pt-2">
                                        <span>Total:</span>
                                        <span className="text-primaryColor">
                                            LKR {billCalculations.total.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-3 sm:mt-4 space-y-2">
                                    <PrimaryButton 
                                        onClick={() => handlePrintBill()}
                                        className="w-full flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                        </svg>
                                        <span className="hidden sm:inline">Print Receipt</span>
                                        <span className="sm:hidden">Print</span>
                                    </PrimaryButton>
                                    
                                    <SecondaryButton 
                                        onClick={() => handlePaymentComplete()}
                                        className="w-full flex items-center justify-center gap-2 text-sm sm:text-base py-2 sm:py-3 bg-green-500 hover:bg-green-600 border-green-500 hover:border-green-600"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="hidden sm:inline">Payment Complete</span>
                                        <span className="sm:hidden">Pay</span>
                                    </SecondaryButton>
                                </div>

                                {/* Bill Info */}
                                <div className="mt-3 sm:mt-4 text-xs text-gray-500">
                                    <p>Bill Created: {formatBillDate(bill.createdAt)}</p>
                                    <p>Items: {billCalculations.itemCount}</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Payment Confirmation Modal */}
            <ConfirmationModal
                isOpen={showPaymentModal}
                onClose={cancelPayment}
                onConfirm={confirmPayment}
                title="Complete Payment"
                message={selectedTable && billCalculations ? 
                    `Complete payment for Table ${selectedTable.tableNumber}?\n\nTotal: LKR ${billCalculations.total.toFixed(2)}\n\nThis will close the bill and cannot be undone.` :
                    'Complete this payment?'
                }
                confirmText="Complete Payment"
                cancelText="Cancel"
                type="info"
            />
        </div>
    );
});

// PropTypes validation
OrderSummary.propTypes = {
    selectedTable: PropTypes.object,
    bill: PropTypes.object,
    menuItems: PropTypes.array.isRequired,
    customerType: PropTypes.oneOf(['local', 'foreign']),
    onCreateBill: PropTypes.func.isRequired,
    onAddItem: PropTypes.func.isRequired,
    onRemoveItem: PropTypes.func.isRequired,
    onUpdateQuantity: PropTypes.func.isRequired,
    onToggleServiceCharge: PropTypes.func.isRequired,
    onToggleCustomerType: PropTypes.func.isRequired,
    onToggleEmptyBottle: PropTypes.func.isRequired,
    onEmptyBottleCountChange: PropTypes.func.isRequired,
    onCloseBill: PropTypes.func.isRequired
};

export default OrderSummary;
