import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext();

export const NOTIFICATION_TYPES = {
    INFO: 'info',
    SUCCESS: 'success',
    WARNING: 'warning',
    ERROR: 'error',
    URGENT: 'urgent',
};

export const NOTIFICATION_CATEGORIES = {
    ACCOUNT: 'account',
    TRIP: 'trip',
    PAYMENT: 'payment',
    SYSTEM: 'system',
    REVIEW: 'review',
    MODERATION: 'moderation',
    FINANCIAL: 'financial',
    EMERGENCY: 'emergency',
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('takataka_notifications');
        return saved ? JSON.parse(saved) : [];
    });

    const [toasts, setToasts] = useState([]);

    // Persistence
    useEffect(() => {
        localStorage.setItem('takataka_notifications', JSON.stringify(notifications));
    }, [notifications]);

    /**
     * Trigger a new notification
     * @param {Object} data - Notification details
     */
    const addNotification = useCallback((data) => {
        const newNotification = {
            id: Date.now().toString(),
            timestamp: new Date().toISOString(),
            isRead: false,
            type: data.type || NOTIFICATION_TYPES.INFO,
            category: data.category || NOTIFICATION_CATEGORIES.SYSTEM,
            title: data.title,
            message: data.message,
            link: data.link || null,
            metadata: data.metadata || {},
            actor: data.actor || 'system',
            priority: data.priority || 'normal',
        };

        // Add to history
        setNotifications(prev => [newNotification, ...prev]);

        // Add to active toasts if not purely informational/background
        if (data.showToast !== false) {
            setToasts(prev => [...prev, newNotification]);

            // Auto-remove toast after 5s unless urgent
            if (newNotification.type !== NOTIFICATION_TYPES.URGENT) {
                setTimeout(() => {
                    removeToast(newNotification.id);
                }, 5000);
            }
        }

        return newNotification.id;
    }, []);

    const markAsRead = useCallback((id) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: true } : n
        ));
    }, []);

    const markAllAsRead = useCallback(() => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const value = {
        notifications,
        toasts,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        removeToast,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotificationCenter = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotificationCenter must be used within a NotificationProvider');
    }
    return context;
};
