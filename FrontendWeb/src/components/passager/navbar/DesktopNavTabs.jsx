import { useTranslation } from 'react-i18next';

const DesktopNavTabs = ({ tabs, activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <div className="hidden md:flex flex-1 items-center justify-center space-x-1 rounded-xl p-1">
      {tabs.slice(0, 4).map((tab) => {
        const Icon = tab.icon;
        const hasSubItems = tab.subItems && tab.subItems.length > 0;

        return (
          <div key={tab.id} className="relative group">
            <button
              onClick={() => !hasSubItems && onTabChange(tab.id)}
              className={`px-3 lg:px-5 py-3 text-sm font-medium rounded-lg transition-all duration-300 flex items-center ${(activeTab === tab.id || (hasSubItems && tab.subItems.some(s => s.id === activeTab)))
                ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-500 shadow-sm'
                : 'text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                }`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {t(`nav.${tab.id}`)}
              {hasSubItems && (
                <svg className="w-3.5 h-3.5 ml-1.5 opacity-50 group-hover:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* Sous-menu (Dropdown) */}
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
    </div>
  );
};

export default DesktopNavTabs;
