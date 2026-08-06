import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Eye, Ban, UserCheck, Mail } from 'lucide-react';
import Button from '../../ui/Bttn';

const UserActionsMenu = ({ user, isOpen, onToggle, onViewDetails, onToggleStatus, onSendEmail, menuRef, t }) => {
  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="small"
        icon={MoreVertical}
        onClick={(e) => onToggle(user._id, e)}
      />
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 z-40"
          >
            <div className="py-1">
              <button
                onClick={() => onViewDetails(user)}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
              >
                <Eye className="w-4 h-4 mr-3 text-blue-500" />
                {t('common.view_details') || 'Voir les détails'}
              </button>
              <button
                onClick={() => onToggleStatus(user)}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
              >
                {user.statut === 'ACTIF' ? (
                  <Ban className="w-4 h-4 mr-3 text-amber-500" />
                ) : (
                  <UserCheck className="w-4 h-4 mr-3 text-emerald-500" />
                )}
                {user.statut === 'ACTIF' ? (t('common.deactivate') || 'Désactiver') : (t('common.activate') || 'Activer')}
              </button>
              <button
                onClick={() => onSendEmail(user)}
                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
              >
                <Mail className="w-4 h-4 mr-3 text-purple-500" />
                {t('common.send_email') || 'Envoyer un email'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserActionsMenu;
