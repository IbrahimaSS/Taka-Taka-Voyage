// components/NotificationModal.tsx
import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { NotificationItem } from './Notification';
import { Bell } from 'lucide-react';
import { mockNotifications } from './mockNotifications';



export const NotificationModal: = ({
  isOpen,
  onClose
}) => {
  const [notifications, setNotifications] = useState(mockNotifications);

  // Compter les notifications non lues
  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Marquer une notification comme lue
  const markAsRead = (id) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id 
          ? { ...notification, isRead }
          
      )
    );
  };

  // Marquer toutes comme lues
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead }))
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Notifications"
    >
      {/* En-tête avec compteur */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <Bell className="w-5 h-5 text-gray-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">
            {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}
          </span>
        </div>
        
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover-blue-800 font-medium"
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Liste des notifications */}
      <div className="max-h-[400px] overflow-y-auto border rounded-lg">
        {notifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={markAsRead}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">
            Total: {notifications.length} notifications
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover-gray-200 transition-colors text-sm font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </Modal>
  );
};