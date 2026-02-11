import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  DollarSign,
  Car,
  Bell,
  Shield,
  AlertTriangle,
  CheckCircle,
  Info,
  User,
  CreditCard,
  Star,
  MessageSquare,
  Zap
} from 'lucide-react';
import { NOTIFICATION_CATEGORIES, NOTIFICATION_TYPES } from '../../context/NotificationContext';

const categoryIcons = {
  [NOTIFICATION_CATEGORIES.ACCOUNT]: User,
  [NOTIFICATION_CATEGORIES.TRIP]: Car,
  [NOTIFICATION_CATEGORIES.PAYMENT]: CreditCard,
  [NOTIFICATION_CATEGORIES.SYSTEM]: Bell,
  [NOTIFICATION_CATEGORIES.REVIEW]: Star,
  [NOTIFICATION_CATEGORIES.MODERATION]: Shield,
  [NOTIFICATION_CATEGORIES.FINANCIAL]: DollarSign,
  [NOTIFICATION_CATEGORIES.EMERGENCY]: AlertTriangle,
};

const typeColors = {
  [NOTIFICATION_TYPES.INFO]: 'bg-blue-100 text-blue-600 border-blue-200',
  [NOTIFICATION_TYPES.SUCCESS]: 'bg-green-100 text-green-600 border-green-200',
  [NOTIFICATION_TYPES.WARNING]: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  [NOTIFICATION_TYPES.ERROR]: 'bg-red-100 text-red-600 border-red-200',
  [NOTIFICATION_TYPES.URGENT]: 'bg-red-600 text-white border-red-700 animate-pulse',
};

const categoryLabels = {
  [NOTIFICATION_CATEGORIES.ACCOUNT]: 'Compte',
  [NOTIFICATION_CATEGORIES.TRIP]: 'Course',
  [NOTIFICATION_CATEGORIES.PAYMENT]: 'Paiement',
  [NOTIFICATION_CATEGORIES.SYSTEM]: 'Système',
  [NOTIFICATION_CATEGORIES.REVIEW]: 'Avis',
  [NOTIFICATION_CATEGORIES.MODERATION]: 'Modération',
  [NOTIFICATION_CATEGORIES.FINANCIAL]: 'Finance',
  [NOTIFICATION_CATEGORIES.EMERGENCY]: 'Urgence',
};

export const NotificationItem = ({
  notification,
  onMarkAsRead
}) => {
  const navigate = useNavigate();
  const Icon = categoryIcons[notification.category] || Bell;
  const colorClass = typeColors[notification.type] || typeColors[NOTIFICATION_TYPES.INFO];

  const formatTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleClick = () => {
    onMarkAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div
      className={`flex items-start p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer border-b dark:border-gray-700 ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
        }`}
      onClick={handleClick}
    >
      {/* Category Icon */}
      <div className={`p-2.5 rounded-xl border ${colorClass} shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="ml-4 flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <h4 className={`text-sm font-semibold truncate ${notification.type === NOTIFICATION_TYPES.URGENT ? 'text-red-600' : 'text-gray-900 dark:text-gray-100'
            }`}>
            {notification.title}
          </h4>
          <span className="text-[11px] font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
            {formatTime(notification.timestamp)}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-snug">
          {notification.message}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border dark:border-gray-600">
            {categoryLabels[notification.category]}
          </span>

          {/* Metadata chips */}
          {notification.metadata?.price && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800">
              <DollarSign className="w-3 h-3 mr-1" />
              {notification.metadata.price}
            </span>
          )}
          {notification.metadata?.duration && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
              <Clock className="w-3 h-3 mr-1" />
              {notification.metadata.duration}
            </span>
          )}
        </div>
      </div>

      {/* Unread dot */}
      {!notification.isRead && (
        <div className="ml-3 self-center shrink-0">
          <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm shadow-blue-500/50" />
        </div>
      )}
    </div>
  );
};