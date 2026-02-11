// src/components/ui/Toast.jsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';

const Toast = ({ title, message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose?.();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    info: Info,
    warning: AlertTriangle,
  };

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  };

  const Icon = icons[type];

  if (!Icon) console.warn(`[Toast] icon for type '${type}' not found`);
  if (!X) console.warn("[Toast] close icon 'X' is undefined");

  return (
    <AnimatePresence>
      {title && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-6 right-6 w-96 bg-gray-800 text-white rounded-xl shadow-xl z-50 overflow-hidden"
        >
          <div className="p-4">
            <div className="flex items-start">
              <div className="mr-3">
                {Icon ? (
                  <Icon className={`w-6 h-6 ${type === 'success' ? 'text-green-400' : ''}`} />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{title}</p>
                <p className="text-sm text-gray-300 mt-1">{message}</p>
              </div>
              <button
                onClick={onClose}
                className="ml-4 text-gray-400 dark:text-gray-500 hover:text-white transition"
              >
                {X ? <X className="w-5 h-5" /> : <span className="text-sm">×</span>}
              </button>
            </div>
            <div className="mt-3">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className={`h-1 ${colors[type]} rounded-full`}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;