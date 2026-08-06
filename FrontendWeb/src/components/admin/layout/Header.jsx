import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronRight,
  Menu,
  Moon,
  Sun,
  Navigation,
  Wallet,
  QrCode,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import QRScannerWeb from '../../common/QRScannerWeb';
import axios from 'axios';
import { useTheme } from '../../../context/ThemeContext';
import { cn } from '../../../utils/cn';
import { useUserStore } from '../../../data/userStore';
import { useAuth } from '../../../context/AuthContext';
import { useSettings } from '../../../context/SettingsContext';
import { NAV_CONFIG, ROLES } from '../../../config/navConfig';
import AvailabilityToggle from '../../chauffeur/AvailabilityToggle';
import { useDriverContext } from '../../../context/DriverContext';
import { useNotificationCenter } from '../../../context/NotificationContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../common/LanguageSwitcher';
import { parsePath } from './header/parsePath';
import { useWalletBalance } from './header/useWalletBalance';
import { useHeaderAdminAlerts } from './header/useHeaderAdminAlerts';
import NotificationsDropdown from './header/NotificationsDropdown';
import ProfileDropdown from './header/ProfileDropdown';

export default function Header({
  currentDate,
  onMenuToggle,
  onSidebarToggle,
  sidebarCollapsed,
  showToast,
  role = ROLES.ADMIN
}) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const { profile: staticProfile } = useUserStore();
  const profile = user || staticProfile;
  const { settings } = useSettings();
  const platform = settings?.platform || {};

  // Integrated real notifications
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationCenter();

  const config = NAV_CONFIG[role] || NAV_CONFIG[ROLES.ADMIN];
  const BASE_PATH = config.basePath;
  const TITLES = config.titles;

  // Driver context for tracking button
  // useDriverContext() ne lance jamais d'erreur hors du Provider (retourne null via useContext),
  // donc l'appel peut être inconditionnel comme l'exigent les règles des Hooks React.
  const driverContext = useDriverContext();

  const tripInProgress = driverContext?.tripStep === 'in_progress';

  const [showScanner, setShowScanner] = useState(false);
  const walletBalance = useWalletBalance({ role, user });

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

  useHeaderAdminAlerts({ role, user, showToast });

  const profileLink = role === ROLES.ADMIN ? '/admin/profil' : '/chauffeur/profil';
  const settingsLink = role === ROLES.ADMIN ? '/admin/parametres' : '/chauffeur/settings';

  const handleQRScanSuccess = async (code) => {
    try {
      setShowScanner(false);
      if (showToast) showToast('Validation...', 'Traitement du ticket', 'info');

      const token = localStorage.getItem('token');
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/tickets/scanner`, {
        codeUnique: code
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.succes) {
        if (showToast) showToast('Succès', 'Ticket validé avec succès !', 'success');
        // Optionnel: rafraîchir les données ou rediriger
      } else {
        if (showToast) showToast('Erreur', response.data.message || 'Ticket invalide', 'error');
      }
    } catch (err) {
      console.error("Scan Error:", err);
      if (showToast) showToast('Erreur', err.response?.data?.message || 'Erreur lors de la validation', 'error');
    }
  };

  return (
    <header className="glass-header bg-white/90 dark:bg-gray-800  border-b-2 border-gray-200/30 dark:border-gray-900 shadow-sm animate-fade-in-down sticky top-0 z-30 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 shrink-0">
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
                    {t(`nav.${b.label.toLowerCase().replace(/\s+/g, '_')}`, b.label)}
                  </Link>
                  {idx < breadcrumbs.length - 1 && <ChevronRight className="h-4 w-4 text-slate-400 dark:text-slate-600" />}
                </React.Fragment>
              ))}
            </nav>
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="text-lg md:text-xl font-semibold  tracking-tight text-slate-900 dark:text-slate-100 truncate">
                {t(`nav.${pageTitle.toLowerCase().replace(/\s+/g, '_')}`, pageTitle)}
              </h1>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 md:gap-2.5">
          {/* Toggle Disponibilité */}
          {role === ROLES.CHAUFFEUR && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigate('/chauffeur/wallet')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-all shrink-0"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  {walletBalance.toLocaleString()} GNF
                </span>
              </button>
              {tripInProgress && (
                <Link
                  to="/chauffeur/live-tracking"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-blue-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all animate-pulse"
                >
                  <Navigation className="h-4 w-4" />
                  <span>{i18n.language === 'en' ? 'Live' : 'Suivi'}</span>
                </Link>
              )}
              <div className="hidden md:block">
                <AvailabilityToggle />
              </div>
              <LanguageSwitcher variant="simple" />
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

          {/* QR Scanner Web */}
          {role === ROLES.CHAUFFEUR && (
            <button
              type="button"
              onClick={() => setShowScanner(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 ring-emerald-500 transition-all shadow-sm border border-emerald-100/50 dark:border-emerald-800/30"
              aria-label="Scanner un ticket"
              title="Scanner un QR Code"
            >
              <QrCode className="h-5 w-5" />
            </button>
          )}

          <NotificationsDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
            navigate={navigate}
            t={t}
          />

          <ProfileDropdown
            profile={profile}
            role={role}
            profileLink={profileLink}
            settingsLink={settingsLink}
            t={t}
            logout={logout}
            navigate={navigate}
          />
        </div>
      </div>

      {showScanner && (
        <QRScannerWeb
          onScanSuccess={handleQRScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </header>
  );
}
