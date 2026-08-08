import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { MoreHorizontal } from 'lucide-react';
import { PRIMARY_TABS, SECONDARY_TAB_IDS } from './navTabsConfig';
import NavBadgeDot from './NavBadgeDot';

const MobileBottomNav = ({ activeTab, onTabChange, badges, onOpenMore }) => {
  const { t } = useTranslation();
  const isMoreActive = SECONDARY_TAB_IDS.includes(activeTab);

  return (
    <div className="md:hidden fixed bottom-1 inset-x-4 z-50">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-2xl px-2 py-2">
        <div className="flex justify-around items-center">
          {PRIMARY_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const count = badges.perTab[tab.id];
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className="relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl"
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-active"
                    className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative">
                  <Icon className={`w-5 h-5 transition-transform ${isActive ? 'text-green-600 dark:text-green-500 scale-110' : 'text-gray-500 dark:text-gray-400'}`} />
                  <NavBadgeDot count={count} className="-top-1.5 -right-2" />
                </span>
                <span className={`relative text-[10px] mt-1 font-medium ${isActive ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
                  {t(`nav.${tab.id}`)}
                </span>
              </button>
            );
          })}

          <button
            onClick={onOpenMore}
            className="relative flex flex-col items-center justify-center min-w-[44px] min-h-[44px] p-2 rounded-xl"
          >
            {isMoreActive && (
              <motion.span
                layoutId="mobile-nav-active"
                className="absolute inset-0 bg-green-50 dark:bg-green-900/20 rounded-xl"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative">
              <MoreHorizontal className={`w-5 h-5 ${isMoreActive ? 'text-green-600 dark:text-green-500 scale-110' : 'text-gray-500 dark:text-gray-400'}`} />
              <NavBadgeDot count={badges.secondaryTotal} className="-top-1.5 -right-2" />
            </span>
            <span className={`relative text-[10px] mt-1 font-medium ${isMoreActive ? 'text-green-600 dark:text-green-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {t('nav.more', 'Plus')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileBottomNav;
