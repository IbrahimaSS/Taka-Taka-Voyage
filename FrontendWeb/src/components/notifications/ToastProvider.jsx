import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Bell, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { useNotificationCenter, NOTIFICATION_TYPES } from '../../context/NotificationContext';

const typeStyles = {
    [NOTIFICATION_TYPES.INFO]: {
        icon: Info,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
    },
    [NOTIFICATION_TYPES.SUCCESS]: {
        icon: CheckCircle,
        color: 'text-green-500',
        bg: 'bg-green-50 dark:bg-green-900/20',
        border: 'border-green-200 dark:border-green-800',
    },
    [NOTIFICATION_TYPES.WARNING]: {
        icon: AlertTriangle,
        color: 'text-yellow-500',
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
    },
    [NOTIFICATION_TYPES.ERROR]: {
        icon: AlertCircle,
        color: 'text-red-500',
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
    },
    [NOTIFICATION_TYPES.URGENT]: {
        icon: Bell,
        color: 'text-white',
        bg: 'bg-red-600',
        border: 'border-red-700',
    },
};

const Toast = ({ notification, onRemove }) => {
    const style = typeStyles[notification.type] || typeStyles[NOTIFICATION_TYPES.INFO];
    const Icon = style.icon;

    return (
        <div
            className={`
                flex items-center gap-3 p-4 rounded-xl shadow-lg border-l-4 mb-3
                animate-in slide-in-from-right-10 duration-300 max-w-sm w-full
                ${style.bg} ${style.border} pointer-events-auto
            `}
            role="alert"
        >
            <div className={`shrink-0 ${style.color}`}>
                <Icon className="w-6 h-6" />
            </div>

            <div className="flex-1 min-w-0">
                <h5 className={`text-sm font-bold truncate ${notification.type === NOTIFICATION_TYPES.URGENT ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                    {notification.title}
                </h5>
                <p className={`text-xs mt-0.5 line-clamp-2 ${notification.type === NOTIFICATION_TYPES.URGENT ? 'text-red-50' : 'text-gray-600 dark:text-gray-400'}`}>
                    {notification.message}
                </p>
            </div>

            <button
                onClick={() => onRemove(notification.id)}
                className={`p-1.5 rounded-lg transition-colors shrink-0 ${notification.type === NOTIFICATION_TYPES.URGENT
                        ? 'text-white/80 hover:bg-white/20'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
};

export const ToastProvider = () => {
    const { toasts, removeToast } = useNotificationCenter();
    const [container, setContainer] = useState(null);

    useEffect(() => {
        let div = document.getElementById('toast-root');
        if (!div) {
            div = document.createElement('div');
            div.id = 'toast-root';
            div.className = 'fixed top-4 right-4 z-[9999] pointer-events-none flex flex-col items-end';
            document.body.appendChild(div);
        }
        setContainer(div);
    }, []);

    if (!container) return null;

    return createPortal(
        <div className="flex flex-col items-end w-full max-w-[calc(100vw-2rem)]">
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    notification={toast}
                    onRemove={removeToast}
                />
            ))}
        </div>,
        container
    );
};
