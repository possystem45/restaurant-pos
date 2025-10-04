import React, { useEffect, useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    // Close modal on escape key press
    const handleEscapeKey = useCallback((event) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleEscapeKey);
            // Prevent body scroll when modal is open
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleEscapeKey]);

    // Don't render if not open
    if (!isOpen) return null;

    // Size classes - responsive
    const sizeClasses = {
        sm: 'max-w-xs sm:max-w-md',
        md: 'max-w-sm sm:max-w-lg',
        lg: 'max-w-md sm:max-w-xl lg:max-w-2xl',
        xl: 'max-w-lg sm:max-w-2xl lg:max-w-4xl',
        full: 'max-w-full sm:max-w-7xl'
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-other1 bg-opacity-50 transition-opacity"
                onClick={onClose}
            />
            
            {/* Modal Container */}
            <div className="flex min-h-full items-center justify-center p-3 sm:p-4">
                {/* Modal Content */}
                <div 
                    className={`relative bg-white rounded-xl sm:rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[95vh] sm:max-h-[90vh] overflow-hidden`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                        <h2 className="text-lg sm:text-xl font-semibold text-other1">
                            {title}
                        </h2>
                        <button
                            onClick={onClose}
                            className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                            type="button"
                        >
                            <FaTimes size={14} className="sm:hidden text-gray-500" />
                            <FaTimes size={16} className="hidden sm:block text-gray-500" />
                        </button>
                    </div>
                    
                    {/* Body */}
                    <div className="overflow-y-auto max-h-[calc(95vh-64px)] sm:max-h-[calc(90vh-80px)]">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export named exports for specific use cases
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmButtonClass = 'bg-red-500 hover:bg-red-600' }) => (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
        <div className="p-4 sm:p-6">
            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">{message}</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
                <button
                    onClick={onClose}
                    className="w-full sm:w-auto px-3 sm:px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    {cancelText}
                </button>
                <button
                    onClick={onConfirm}
                    className={`w-full sm:w-auto px-3 sm:px-4 py-2 text-sm sm:text-base text-white rounded-lg transition-colors ${confirmButtonClass} bg-primaryColor`}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </Modal>
);
