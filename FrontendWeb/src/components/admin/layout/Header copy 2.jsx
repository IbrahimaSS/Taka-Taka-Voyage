import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  LogOut,
  Navigation,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useUserStore } from '../../../data/userStore';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../hooks/useSettings';
import { NAV_CONFIG, ROLES } from '../../../config/navConfig';
import AvailabilityToggle from '../../chauffeur/AvailabilityToggle';
import { useDriverContext } from '../../../context/DriverContext';
import { useNotificationCenter } from '../../../context/NotificationContext';

function parsePath(pathname, basePath) {
  if (!pathname.startsWith(basePath)) return { segments: [], first: '' };
  const rest = pathname.slice(basePath.length).replace(/^\/+/, '');
  const segments = rest ? rest.split('/').filter(Boolean) : [];
  return { segments, first: segments[0] || '' };
}

export default function Header({
  currentDate,
  onMenuToggle,
  onSidebarToggle,
  sidebarCollapsed,
  showToast,
  role = ROLES.ADMIN
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { profile: staticProfile } = useUserStore();
  const profile = user || staticProfile;
  const { settings } = useSettings();
  const platform = settings.platform || {};

  // Integrated real notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationCenter();

  const config = NAV_CONFIG[role] || NAV_CONFIG[ROLES.ADMIN];
  const BASE_PATH = config.basePath;
  const TITLES = config.titles;

  // Driver context for tracking button
  let driverContext = null;
  try {
    if (role === ROLES.CHAUFFEUR) {
      driverContext = useDriverContext();
    }
  } catch (e) {
    console.warn("DriverContext not found in Header");
  }

  const tripInProgress = driverContext?.tripStep === 'in_progress';

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const { segments, first } = useMemo(() => parsePath(location.pathname, BASE_PATH), [location.pathname, BASE_PATH]);
  const pageTitle = TITLES[first] || TITLES[''];

  const breadcrumbs = useMemo(() => {
    const crumbs = [{ label: platform.name || config.title, to: BASE_PATH }];
    if (!segments.length) return crumbs;
    let acc = BASE_PATH;
    segments.forEach((seg) => {
      acc += `/${seg}`;
      crumbs.push({ label: TITLES[seg] || (seg.charAt(0).toUpperCase() + seg.slice(1)), to: acc });
    });
    return crumbs;
  }, [segments, BASE_PATH, config.title, TITLES]);

  useEffect(() => {
    const onDocDown = (e) => {
      if (notificationsOpen && !e.target.closest('.notifications-container')) setNotificationsOpen(false);
      if (profileOpen && !e.target.closest('.profile-container')) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [notificationsOpen, profileOpen]);

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
    setNotificationsOpen(false);
  };

  const badgeColor = (type) => {
    if (type === 'success') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300';
    if (type === 'error' || type === 'urgent') return 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300';
    return 'bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300';
  };

  const profileLink = role === ROLES.ADMIN ? '/admin/profil' : '/chauffeur/profil';
  const settingsLink = role === ROLES.ADMIN ? '/admin/parametres' : '/chauffeur/settings';
  const supportLink = role === ROLES.ADMIN ? '#' : '/chauffeur/support';
  const evaluationsLink = role === ROLES.ADMIN ? '#' : '/chauffeur/evaluations';

  return (
    <header className="glass-header bg-white/90 dark:bg-gray-800  border-b-2 border-gray-200/30 dark:border-gray-900 shadow-sm animate-fade-in-down sticky top-0 z-30 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onMenuToggle}
            className="lg:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl surface hover:bg-gray-50 dark:hover:bg-gray-700 ring-primary"
            aria-label="Ouvrir le menu"
            type="button"
          >
            <Menu className="h-5 w-5 text-slate-700 dark:text-slate-200" />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={onSidebarToggle}
            className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-xl surface dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 ring-primary"
            aria-label="Réduire/étendre la sidebar"
            type="button"
          >
            <ChevronRight className={cn('h-5 w-5 text-slate-700 dark:text-slate-200 transition-transform', !sidebarCollapsed && 'rotate-180')} />
          </motion.button>

          <div className="min-w-0">
            <nav className="hidden md:flex items-center gap-2 text-sm">
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={b.to}>
                  <Link
                    to={b.to}
                    className={cn(
                      'font-semibold transition-colors',
                      idx === breadcrumbs.length - 1
                        ? 'text-slate-900 dark:text-slate-100'
                        : 'text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400'
                    )}
                  >
                    {b.label}
                  </Link>
                  {idx < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />}
                </React.Fragment>
              ))}
            </nav>
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg md:text-xl font-semibold  tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {pageTitle}
              </h1>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Toggle Disponibilité */}
          {role === ROLES.CHAUFFEUR && (
            <div className="flex items-center gap-2">
              {tripInProgress && (
                <Link
                  to="/chauffeur/live-tracking"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all animate-pulse"
                >
                  <Navigation className="h-4 w-4" />
                  <span>Suivi</span>
                </Link>
              )}
              <div className="hidden md:block">
                <AvailabilityToggle />
              </div>
            </div>
          )}

          {/* Theme */}
          <button
            type="button"
            onClick={toggleTheme}
            className="inline-flex  h-10 w-10 items-center justify-center rounded-xl surface hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 ring-primary"
            aria-label="Changer le thème"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-amber-500" /> : <Moon className="h-5 w-5 text-slate-700" />}
          </button>

          {/* Notifications */}
          <div className="relative notifications-container">
            <button
              type="button"
              onClick={() => setNotificationsOpen((v) => !v)}
              className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl surface hover:bg-gray-50 dark:bg-gray-800 dark:hover:bg-gray-700 ring-primary"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-700 dark:text-slate-200" />
              {unreadCount > 0 ? (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              ) : (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center animate-pulse">
                  0
                </span>
              )}
            </button>

            <AnimatePresence>
              {notificationsOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar-v5">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          onClick={() => handleNotificationClick(notification)}
                          className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors"
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                              <span className="text-green-600 dark:text-green-400">
                                <Bell className="w-5 h-5" />
                              </span>
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
                              {formatDistanceToNow(new Date(notification.timestamp), { locale: fr })}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-gray-500">
                        Aucune notification
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile */}
          <div className="relative profile-container">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ring-primary"
              aria-label="Menu utilisateur"
            >
              <div className="h-10 w-10 rounded-full overflow-hidden shadow-sm flex items-center justify-center relative">
                {(() => {
                  const avatar = profile.avatar || profile.photoProfil || profile.photoUrl;
                  if (avatar) {
                    const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                    const baseUrl = apiURL.replace(/\/api$/, '');
                    const avatarUrl = (avatar.startsWith('data:') || avatar.startsWith('http'))
                      ? avatar
                      : `${baseUrl}${avatar.startsWith('/') ? avatar : `/${avatar}`}`;

                    return (
                      <img
                        src={avatarUrl}
                        alt={`${profile.prenom || ''} ${profile.nom || ''}`}
                        className="h-full w-full object-cover z-10"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    );
                  }
                  return null;
                })()}
                <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-xs font-bold">
                  {profile.prenom && profile.nom ? `${profile.prenom[0]}${profile.nom[0]}` : <User className="h-5 w-5" />}
                </div>
              </div>

              {role !== ROLES.CHAUFFEUR && (
                <>
                  <div className="hidden md:flex flex-col text-left">
                    <p className="text-sm font-semibold leading-tight truncate max-w-[120px]">
                      {profile.prenom && profile.nom ? `${profile.prenom} ${profile.nom}` : (profile.name || 'Admin')}
                    </p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-primary-600 text-xs leading-tight truncate">
                      {profile.role || (role === ROLES.ADMIN ? "Administrateur" : "Chauffeur")}
                    </div>
                  </div>
                  <ChevronDown className={cn('hidden md:block h-4 w-4 text-slate-400 transition-transform', profileOpen && 'rotate-180')} />
                </>
              )}
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ duration: 0.18 }}
                  className="profile-dropdown absolute right-0 mt-2 w-72 z-50 bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden"
                >
                  <div className="p-4 border-b border-gray-200 dark:border-gray-900 bg-gray-50 dark:bg-gray-800">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-full overflow-hidden flex items-center justify-center relative">
                        {(() => {
                          const avatar = profile.avatar || profile.photoProfil || profile.photoUrl;
                          if (avatar) {
                            const apiURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                            const baseUrl = apiURL.replace(/\/api$/, '');
                            const avatarUrl = (avatar.startsWith('data:') || avatar.startsWith('http'))
                              ? avatar
                              : `${baseUrl}${avatar.startsWith('/') ? avatar : `/${avatar}`}`;

                            return (
                              <img
                                src={avatarUrl}
                                alt={`${profile.prenom || ''} ${profile.nom || ''}`}
                                className="h-full w-full object-cover z-10"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            );
                          }
                          return null;
                        })()}
                        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white font-bold">
                          {profile.prenom && profile.nom ? `${profile.prenom[0]}${profile.nom[0]}` : <User className="h-6 w-6" />}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate max-w-[180px] font-poppins">
                          {profile.prenom && profile.nom ? `${profile.prenom} ${profile.nom}` : (profile.name || 'Admin')}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{profile.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <Link
                      to={profileLink}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      Mon profil
                    </Link>

                    <Link
                      to={settingsLink}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                      onClick={() => setProfileOpen(false)}
                    >
                      Paramètres
                    </Link>
                  </div>

                  <div className="p-2 border-t border-gray-200 dark:border-gray-900">
                    <button
                      onClick={async () => {
                        await logout();
                        navigate('/connexion');
                      }}
                      className="w-full flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
