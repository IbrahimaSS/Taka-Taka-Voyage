import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Car,
  LogOut,
  ChevronLeft,
  Star,
} from 'lucide-react';
import MenuItem from './MenuItem';
import { cn } from '../../../utils/cn';
import { useSettings } from '../../../hooks/useSettings';
import { NAV_CONFIG, ROLES } from '../../../config/navConfig';
import { useUserStore } from '../../../data/userStore';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Sidebar = ({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
  role = ROLES.ADMIN
}) => {
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const { settings } = useSettings();
  const { user, logout } = useAuth();
  const { profile: staticProfile } = useUserStore();
  const profile = user || staticProfile;
  const navigate = useNavigate();
  const platform = settings.platform || {};

  const config = NAV_CONFIG[role] || NAV_CONFIG[ROLES.ADMIN];
  const menuItems = config.menuItems;

  const toggleCollapse = () => {
    onToggleCollapse?.();
    if (!collapsed) setActiveSubMenu(null);
  };

  const Logo = ({ compact = false }) => (
    <div className={cn('flex items-center gap-3', compact && 'justify-center')}>
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-600 shadow-sm overflow-hidden">
        {platform.logo ? (
          <img src={platform.logo} alt="Logo" className="w-full h-full object-cover" />
        ) : (
          <Car className="h-7 w-7 text-white" />
        )}
      </div>
      {!compact && (
        <div className="leading-tight min-w-0 flex-1">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            Taka<span className="text-transparent bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text">Taka</span>
          </div>
          <div className="mt-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200 uppercase">
            {config.title}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 glass-sidebar bg-slate-200/30 shadow-lg z-50',
          collapsed ? 'w-20' : 'w-[280px]'
        )}
      >
        <div className="p-5 border-b-[2px] border-gray-200 dark:border-gray-900">
          <Logo compact={collapsed} />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin py-4 px-2">
          <nav className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem
                key={`${item.label}-${item.path}`}
                icon={item.icon}
                label={item.label}
                path={item.path}
                count={item.count}
                collapsed={collapsed}
                subItems={item.subItems}
                onClick={onCloseMobile}
              />
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-900">
          <div className={cn(
            "flex items-center gap-3",
            collapsed ? "justify-center flex-col" : "rounded-2xl dark:bg-gray-800 surface p-3"
          )}>
            <div
              className="relative cursor-pointer group"
              onClick={() => navigate(role === ROLES.CHAUFFEUR ? '/chauffeur/profil' : '/profil')}
            >
              <div className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden relative",
                collapsed ? "ring-2 ring-primary-500/20 ring-offset-2 dark:ring-offset-gray-900" : "bg-gradient-to-br from-primary-600 to-secondary-600"
              )}>
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
                  return (
                    <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center text-white text-xs font-bold">
                      {profile.prenom && profile.nom ? `${profile.prenom[0]}${profile.nom[0]}` : <User className="h-5 w-5" />}
                    </div>
                  );
                })()}
              </div>
              {role === ROLES.CHAUFFEUR && (
                <span className="absolute -bottom-1 -right-1 h-4 w-4 bg-amber-400 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                  <Star className="h-2 w-2 text-white fill-white" />
                </span>
              )}
            </div>

            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 dark:text-white truncate font-poppins">
                  {profile.prenom && profile.nom ? `${profile.prenom} ${profile.nom}` : (profile.nom || 'Utilisateur')}
                </p>
                <div className="flex items-center gap-1">
                  <span className={cn(
                    "text-xs text-slate-500 dark:text-slate-400 truncate",
                    role === ROLES.ADMIN ? "text-gray-500 dark:text-slate-400" : "text-gray-600 dark:text-emerald-400"
                  )}>
                    {profile.role || (role === ROLES.ADMIN ? "Administrateur" : "Chauffeur")}
                  </span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/connexion');
              }}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors shadow-sm border",
                collapsed ? "h-10 w-10 surface text-rose-600 border-none" : (
                  role === ROLES.ADMIN
                    ? "bg-white dark:bg-slate-800 text-rose-600 border-slate-100 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    : "bg-white dark:bg-gray-800 text-rose-500 border-emerald-100 dark:border-emerald-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                )
              )}
              aria-label="Déconnexion"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mobile-menu-overlay lg:hidden"
              onClick={onCloseMobile}
            />

            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="lg:hidden fixed left-0 top-0 h-screen w-[280px] glass-sidebar shadow-2xl z-50"
            >
              <div className="h-full flex flex-col">
                <div className="p-5 flex items-center justify-between border-b border-gray-200 dark:border-gray-900">
                  <Logo />
                  <button
                    type="button"
                    onClick={onCloseMobile}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white/60 text-gray-700 hover:bg-gray-100 transition-colors dark:border-gray-900 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                    aria-label="Fermer"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>

                <nav className="flex-1 overflow-y-auto scrollbar-thin py-4">
                  {menuItems.map((item) => (
                    <MenuItem
                      key={`m-${item.label}-${item.path}`}
                      icon={item.icon}
                      label={item.label}
                      path={item.path}
                      count={item.count}
                      collapsed={false}
                      subItems={item.subItems}
                      onClick={onCloseMobile}
                    />
                  ))}
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-900">
                  <button
                    type="button"
                    onClick={async () => {
                      await logout();
                      navigate('/connexion');
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 surface text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Déconnexion
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
