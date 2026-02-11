import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function Modal({ 
  children, 
  onClose, 
  isOpen,
  title,
  size = 'md',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
}) {
  const modalRef = useRef(null);

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm w-full mx-4',
    md: 'max-w-md w-full mx-4',
    lg: 'max-w-lg w-full mx-4',
    xl: 'max-w-2xl w-full mx-4',
    full: 'max-w-[95vw] w-[95vw] mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/50 transition-opacity duration-300"
        onClick={closeOnOverlayClick ? onClose : undefined}
      />
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <div
          ref={modalRef}
          className={`
            relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl
            transform transition-all duration-300
            ${sizeClasses[size]}
            ${className}
          `}
          onClick={handleModalClick}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
              {title && (
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              )}
              
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="ml-auto p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
          )}

          <div className="p-6 max-h-[70vh] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}