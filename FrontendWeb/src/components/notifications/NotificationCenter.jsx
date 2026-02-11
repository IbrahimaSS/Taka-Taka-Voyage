import React, { useMemo } from 'react';
import {
    X,
    Bell,
    Settings,
    Trash2,
    CheckCheck,
    BellOff,
    Filter
} from 'lucide-react';
import { useNotificationCenter, NOTIFICATION_CATEGORIES } from '../../context/NotificationContext';
import { NotificationItem } from './Notification';

export const NotificationCenter = ({ isOpen, onClose }) => {
    const {
        notifications,
        markAsRead,
        markAllAsRead,
        clearAll,
        unreadCount
    } = useNotificationCenter();

    const [activeFilter, setActiveFilter] = React.useState('all');

    const filteredNotifications = useMemo(() => {
        if (activeFilter === 'all') return notifications;
        if (activeFilter === 'unread') return notifications.filter(n => !n.isRead);
        return notifications.filter(n => n.category === activeFilter);
    }, [notifications, activeFilter]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] pointer-events-none">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm pointer-events-auto transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Side Panel */}
            <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm sm:max-w-md bg-white dark:bg-gray-900 shadow-2xl pointer-events-auto flex flex-col animate-in slide-in-from-right-full duration-300">
                {/* Header */}
                <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between bg-white dark:bg-gray-900 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                            {unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500 text-[10px] text-white items-center justify-center font-bold">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notifications</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="px-4 py-3 border-b dark:border-gray-800 flex items-center gap-2 overflow-x-auto no-scrollbar bg-gray-50/50 dark:bg-gray-800/20">
                    <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
                    {[
                        { id: 'all', label: 'Toutes' },
                        { id: 'unread', label: 'Non lues' },
                        { id: NOTIFICATION_CATEGORIES.TRIP, label: 'Trajets' },
                        { id: NOTIFICATION_CATEGORIES.PAYMENT, label: 'Paiements' },
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`
                                whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                                ${activeFilter === filter.id
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/30'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-300 dark:hover:border-blue-700'
                                }
                            `}
                        >
                            {filter.label}
                        </button>
                    ))}
                </div>

                {/* Actions Bar */}
                {notifications.length > 0 && (
                    <div className="px-4 py-2 border-b dark:border-gray-800 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        <span>{filteredNotifications.length} notification(s)</span>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={markAllAsRead}
                                className="hover:text-blue-600 transition-colors flex items-center gap-1"
                            >
                                Tout lire
                            </button>
                            <button
                                onClick={clearAll}
                                className="hover:text-red-600 transition-colors flex items-center gap-1 text-red-500/80"
                            >
                                <Trash2 className="w-3 h-3" />
                                Tout effacer
                            </button>
                        </div>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    {filteredNotifications.length > 0 ? (
                        <div className="divide-y dark:divide-gray-800">
                            {filteredNotifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onMarkAsRead={markAsRead}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                                <BellOff className="w-10 h-10 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Aucune notification</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                {activeFilter !== 'all'
                                    ? `Aucune notification trouvée pour ce filtre.`
                                    : "Vous recevrez ici les mises à jour importantes de Taka Taka."}
                            </p>
                            {activeFilter !== 'all' && (
                                <button
                                    onClick={() => setActiveFilter('all')}
                                    className="mt-4 text-sm text-blue-600 font-bold hover:underline"
                                >
                                    Afficher tout
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                    <button
                        className="w-full py-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl text-sm font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                        onClick={() => { /* Navigation vers paramètres */ }}
                    >
                        <Settings className="w-4 h-4" />
                        Gérer mes préférences
                    </button>
                </div>
            </div>
        </div>
    );
};
