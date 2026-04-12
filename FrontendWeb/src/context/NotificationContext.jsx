import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

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
    const { user } = useAuth();
    const userId = user?._id || user?.id;
    const userRole = user?.role;

    const [notifications, setNotifications] = useState([]);
    const [toasts, setToasts] = useState([]);

    // Persistence – Isolé par USER_ID pour éviter les fuites entre comptes sur le même navigateur
    useEffect(() => {
        if (userId) {
            const storageKey = `takataka_notifications_${userId}`;
            const saved = localStorage.getItem(storageKey);
            if (saved) {
                setNotifications(JSON.parse(saved));
            } else {
                setNotifications([]);
            }
        } else {
            setNotifications([]);
        }
    }, [userId]);

    useEffect(() => {
        if (userId) {
            const storageKey = `takataka_notifications_${userId}`;
            localStorage.setItem(storageKey, JSON.stringify(notifications));
        }
    }, [notifications, userId]);

    /**
     * Trigger a new notification
     * @param {Object} data - Notification details
     */
    const addNotification = useCallback((data) => {
        const newNotification = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            isRead: false,
            type: data.type || NOTIFICATION_TYPES.INFO,
            category: data.category || NOTIFICATION_CATEGORIES.SYSTEM,
            title: data.title,
            message: data.message,
            link: data.link || null,
            onAction: data.onAction || null,
            metadata: data.metadata || {},
            actor: data.actor || 'system',
            priority: data.priority || 'normal',
            targetRole: data.targetRole || userRole, // Défini par défaut sur le rôle actuel si non spécifié
        };

        // Check for duplicates in history to avoid spam
        const isHistoryDuplicate = notifications.some(n => 
            n.title === newNotification.title && 
            n.message === newNotification.message && 
            (Date.now() - new Date(n.timestamp).getTime() < 30000) // 30s window
        );

        if (isHistoryDuplicate) return null;

        // Add to history
        setNotifications(prev => [newNotification, ...prev]);

        // Add to active toasts if not purely informational/background
        if (data.showToast !== false) {
            setToasts(prev => {
                let filtered = prev;
                if (newNotification.category === NOTIFICATION_CATEGORIES.SYSTEM) {
                    filtered = prev.filter(t => t.category !== NOTIFICATION_CATEGORIES.SYSTEM);
                }
                return [...filtered.slice(-1), newNotification];
            });

            if (newNotification.type !== NOTIFICATION_TYPES.URGENT) {
                setTimeout(() => {
                    removeToast(newNotification.id);
                }, 3000);
            }
        }

        return newNotification.id;
    }, [notifications, userRole, userId]);

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

    // Filtered count and lists based on context/role to avoid cross-role visibility
    const unreadCount = notifications.filter(n => !n.isRead && (!n.targetRole || n.targetRole === userRole)).length;
    const roleNotifications = notifications.filter(n => !n.targetRole || n.targetRole === userRole);

    const value = {
        notifications: roleNotifications,
        allNotifications: notifications, // For debugging/admin if needed
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
