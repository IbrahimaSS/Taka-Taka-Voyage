import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, LogOut } from 'lucide-react';
import { usePassenger } from '../../../context/PassengerContext';
import { useAuth } from '../../../context/AuthContext';
import { getFullAssetURL } from '../../../utils/urlHelper';

const ProfileMenu = ({ tabs, onTabChange }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { passenger } = usePassenger();
  const { logout } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const getImageUrl = (avatar) => getFullAssetURL(avatar);

  return (
    <div className="relative pl-3 border-l border-gray-200 dark:border-gray-700/50 ml-1">
      <button
        onClick={() => setShowProfileMenu(!showProfileMenu)}
        className="flex items-center space-x-3 focus:outline-none group"
      >
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-100 to-blue-100 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900 overflow-hidden">
          {passenger?.photoUrl || passenger?.avatar || passenger?.photo ? (
            <img
              src={getImageUrl(passenger?.photoUrl || passenger?.avatar || passenger?.photo)}
              alt={passenger?.nom || "User"}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-blue-700 dark:text-blue-400" />
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {passenger ? `${passenger.prenom || ""} ${passenger.nom || ""}` : t('common.loading')}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{t('nav.mode_passager')}</p>
        </div>
        <motion.div
          animate={{ rotate: showProfileMenu ? 180 : 0 }}
          className="hidden sm:block"
        >
          <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </button>

      {showProfileMenu && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
            <p className="font-semibold text-gray-900 dark:text-white">
              {passenger ? `${passenger.prenom} ${passenger.nom}` : t('common.user_label')}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{passenger?.email || ""}</p>
          </div>
          <div className="py-1">
            {tabs.slice(4).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    onTabChange(tab.id);
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left px-4 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400 transition-colors flex items-center"
                >
                  <Icon className="w-4 h-4 mr-3 opacity-70" />
                  <span className="text-sm font-medium">{t(`nav.${tab.id}`)}</span>
                </button>
              );
            })}
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
            <button
              onClick={async () => {
                await logout();
                navigate('/connexion');
              }}
              className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center"
            >
              <LogOut className="w-4 h-4 mr-3 opacity-70" />
              <span className="text-sm font-medium">{t('nav.logout')}</span>
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ProfileMenu;
