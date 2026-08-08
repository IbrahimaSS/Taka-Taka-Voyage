import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCircle, AlertTriangle } from 'lucide-react';

const notificationStyles = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  danger: 'bg-red-500'
};

const notificationIcons = {
  info: <Bell className="w-5 h-5" />,
  success: <CheckCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  danger: <AlertTriangle className="w-5 h-5" />
};

const NotificationToast = ({ show, notification }) => (
  <AnimatePresence>
    {show && (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`fixed top-6 right-6 z-50 ${notificationStyles[notification.type]} text-white px-6 py-4 rounded-xl shadow-2xl max-w-sm`}
      >
        <div className="flex items-center space-x-3">
          {notificationIcons[notification.type]}
          <p className="font-medium">{notification.message}</p>
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default NotificationToast;
