import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { PRIMARY_TABS } from './navTabsConfig';
import NavBadgeDot from './NavBadgeDot';
import DesktopPlusMenu from './DesktopPlusMenu';

const DesktopNavTabs = ({ activeTab, onTabChange, badges }) => {
  const { t } = useTranslation();

  return (
    // En dessous de xl, les onglets passent en icône seule (+ tooltip) pour ne jamais
    // déborder ; les libellés reviennent à partir de xl quand la largeur le permet.
    // Pas d'overflow-x-auto ici : sur cet axe, poser overflow-x force le navigateur à
    // calculer overflow-y comme "auto" aussi (règle CSS des deux axes liés), ce qui
    // coupait les sous-menus (Historique, Plus) qui s'ouvrent vers le bas.
    <div className="hidden lg:flex flex-1 min-w-0 items-center justify-center space-x-1 rounded-xl p-1">
      {PRIMARY_TABS.map((tab) => {
        const Icon = tab.icon;
        const hasSubItems = tab.subItems && tab.subItems.length > 0;
        const isActive = activeTab === tab.id || (hasSubItems && tab.subItems.some(s => s.id === activeTab));
        const count = badges.perTab[tab.id];

        return (
          <div key={tab.id} className="relative group shrink-0">
            <button
              onClick={() => !hasSubItems && onTabChange(tab.id)}
              title={t(`nav.${tab.id}`)}
              className={`relative px-2.5 xl:px-5 py-3 text-sm font-medium rounded-lg transition-colors flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 ${isActive ? 'text-green-600 dark:text-green-500' : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
              {isActive && (
                <motion.span
                  layoutId="desktop-nav-active"
                  className="absolute inset-0 bg-white dark:bg-gray-800 shadow-sm rounded-lg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative flex items-center">
                <span className="relative xl:mr-2">
                  <Icon className="w-4 h-4" />
                  <NavBadgeDot count={count} className="-top-1.5 -right-1.5" />
                </span>
                <span className="hidden xl:inline">{t(`nav.${tab.id}`)}</span>
                {hasSubItems && (
                  <svg className="hidden xl:block w-3.5 h-3.5 ml-1.5 opacity-50 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </span>
            </button>

            {/* Sous-menu (Historique) */}
            {hasSubItems && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top translate-y-2 group-hover:translate-y-0 z-50">
                {tab.subItems.map((sub) => {
                  const SubIcon = sub.icon;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => onTabChange(sub.id)}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors flex items-center ${activeTab === sub.id
                        ? 'text-green-600 dark:text-green-500 bg-green-50 dark:bg-green-900/20'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-green-600 dark:hover:text-green-500'
                        }`}
                    >
                      {SubIcon && <SubIcon className="w-4 h-4 mr-3 opacity-70" />}
                      {sub.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      <DesktopPlusMenu activeTab={activeTab} onTabChange={onTabChange} badges={badges} />
    </div>
  );
};

export default DesktopNavTabs;
