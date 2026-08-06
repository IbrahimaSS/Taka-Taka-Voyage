import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ChevronDown, User, Wallet, Settings, LogOut } from 'lucide-react';
import { cn } from '../../../../utils/cn';
import { getFullAssetURL } from '../../../../utils/urlHelper';
import { ROLES } from '../../../../config/navConfig';

const ProfileDropdown = ({ profile, role, profileLink, settingsLink, t, logout, navigate }) => {
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const onDocDown = (e) => {
      if (profileOpen && !e.target.closest('.profile-container')) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, [profileOpen]);

  return (
    <div className="relative profile-container pl-3 border-l border-gray-200 dark:border-gray-700 ml-1">
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
              const avatarUrl = getFullAssetURL(avatar);

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

        <div className="hidden md:flex flex-col text-left">
          <p className="text-sm font-semibold leading-tight truncate max-w-[120px]">
            {profile.prenom && profile.nom ? `${profile.prenom} ${profile.nom}` : (profile.name || 'Admin')}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5 text-primary-600 text-xs leading-tight truncate">
            {profile.role ? t(`nav.${profile.role.toLowerCase()}`, profile.role) : (role === ROLES.ADMIN ? t('nav.admin') : t('nav.chauffeur'))}
          </div>
        </div>
        <ChevronDown className={cn('hidden md:block h-4 w-4 text-slate-400 transition-transform', profileOpen && 'rotate-180')} />
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
                      const avatarUrl = getFullAssetURL(avatar);

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
                <User className="h-4 w-4 opacity-70" />
                {t('nav.profile')}
              </Link>

              {role === ROLES.CHAUFFEUR && (
                <Link
                  to="/chauffeur/wallet"
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                  onClick={() => setProfileOpen(false)}
                >
                  <Wallet className="h-4 w-4 opacity-70" />
                  {t('nav.wallet') || "Portefeuille"}
                </Link>
              )}

              <Link
                to={settingsLink}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                onClick={() => setProfileOpen(false)}
              >
                <Settings className="h-4 w-4 opacity-70" />
                {t('nav.settings')}
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
                {t('nav.logout')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProfileDropdown;
