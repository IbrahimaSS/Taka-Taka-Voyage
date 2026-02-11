// src/components/ui/Modal.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children, title, size = 'md' }) => {
  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1000]"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              {title && (
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-950 rounded-xl transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
                {children}
              </div>
              {!title && (
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 dark:bg-gray-950 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Modal;