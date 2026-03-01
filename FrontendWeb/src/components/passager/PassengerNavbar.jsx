import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Gift, User, MapPin, LogOut, Navigation, Moon, Sun, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import { usePassenger } from '../../context/PassengerContext';
import { useTheme } from '../../context/ThemeContext';
import { useNotificationCenter } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../common/LanguageSwitcher';
import { getFullAssetURL } from '../../utils/urlHelper';

const PassengerNavbar = ({
  activeTab,
  onTabChange,
  tabs,
  isTripInProgress = false,
  onNavigateToTracking
}) => {
  const { t, i18n } = useTranslation();
  const { settings } = useSettings();
  const platform = settings?.platform || {};

  console.log('🔍 [PassengerNavbar] Platform settings:', platform);

  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { passenger } = usePassenger();
  const { theme, toggleTheme, isDark } = useTheme();
  const { logout } = useAuth();

  const dateLocale = i18n.language === 'en' ? enUS : fr;

  const getImageUrl = (avatar) => getFullAssetURL(avatar);

  // Integrated real notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationCenter();

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    setShowNotifications(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-800  backdrop-blur-lg shadow-sm border-b-2   border-gray-200/30 dark:border-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300">
              {platform.logo ? (
                <img src={platform.logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
              ) : (
                <Car className="w-6 h-6 text-white" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold uppercase bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                {platform.name || 'TakaTaka'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">{platform.tagline || t('common.welcome')}</p>
            </div>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="hidden md:flex items-center space-x-1 rounded-xl p-1">
            {tabs.slice(0, 4).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`px-6 py-3 text-sm font-medium rounded-lg transition-all duration-300 flex items-center ${activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-500 shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {t(`nav.${tab.id}`)}
                </button>
              );
            })}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Bouton "Suivi actif" */}
            {isTripInProgress && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="relative"
              >
                <button
                  onClick={onNavigateToTracking}
                  className="bg-gradient-to-r from-green-500 to-blue-600 text-white px-3 py-2 rounded-lg flex items-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{t('nav.live_tracking')}</span>
                  <span className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs animate-pulse">
                    ●
                  </span>
                </button>
              </motion.div>
            )}

            {/* Language Switcher */}
            <LanguageSwitcher variant="simple" />

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300"
              title={isDark ? t('settings.light_mode') : t('settings.dark_mode')}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={theme}
                  initial={{ opacity: 0, rotate: -90 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  {isDark ? (
                    <Sun className="w-5 h-5 text-amber-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-blue-600" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative cursor-pointer p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title={t('common.notifications') || 'Notifications'}
              >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}

              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                  >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm uppercase tracking-wider">{t('notifications.title')}</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={(e) => { e.stopPropagation(); markAllAsRead(); }}
                          className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                        >
                          {t('notifications.mark_all_as_read')}
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar-v5">
                      {notifications.filter(n => !n.isRead).length > 0 ? (
                        notifications.filter(n => !n.isRead).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors"
                          >
                            <div className="flex items-start space-x-3">
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                                  <span className="text-green-600 dark:text-green-400">
                                    <Bell className="w-5 h-5" />
                                  </span>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1">
                                  {notification.title}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                  {notification.message}
                                </p>
                              </div>
                              <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                                {formatDistanceToNow(new Date(notification.timestamp), { locale: dateLocale })}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center text-gray-500">
                          {t('notifications.no_notifications')}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu */}
            <div className="relative">
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
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 overflow-hidden"
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
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-1 inset-x-4 z-50">
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-2xl px-2 py-2">
          <div className="flex justify-around items-center">
            {tabs.slice(0, 4).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${isActive
                    ? 'text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'text-gray-500 dark:text-gray-400'
                    }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'scale-110' : ''}`} />
                  <span className="text-[10px] mt-1 font-medium">{t(`nav.${tab.id}`)}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PassengerNavbar;