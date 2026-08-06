import { useTranslation } from 'react-i18next';
import Card from '../../ui/Card';

const getTabColorClasses = (tab) => {
  const colorMap = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
    orange: { bg: 'bg-orange-50', border: 'border-orange-200', icon: 'text-orange-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-600' },
    yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: 'text-yellow-600' },
    pink: { bg: 'bg-pink-50', border: 'border-pink-200', icon: 'text-pink-600' },
    gray: { bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-900', icon: 'text-gray-600 dark:text-gray-300' }
  };

  return colorMap[tab.color] || colorMap.blue;
};

const SettingsSidebarNav = ({ tabs, activeTab, onChange }) => {
  const { t } = useTranslation();

  return (
    <div className="hidden lg:block lg:w-64">
      <Card className="border-2 border-gray-100 dark:border-gray-900 sticky top-6 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-900">
          <h3 className="font-bold text-gray-800 dark:text-gray-100">{t('common.categories') || 'Catégories'}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{t('settings.all_settings') || 'Tous les paramètres'}</p>
        </div>
        <div className="space-y-1 p-2">
          {tabs.map(tab => {
            const colors = getTabColorClasses(tab);
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 ${isActive
                  ? `${colors.bg} ${colors.border} dark:bg-gray-800 border-2 shadow-sm`
                  : 'hover:bg-gray-50 dark:hover:bg-gray-900/40 dark:bg-gray-800 border-2 border-transparent'
                  }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? colors.bg : 'bg-gray-100 dark:bg-gray-800'
                  }`}>
                  <tab.icon className={`w-4 h-4 ${isActive ? colors.icon : 'text-gray-500 dark:text-gray-400'}`} />
                </div>
                <span className={`font-medium ${isActive ? 'text-gray-800 dark:text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default SettingsSidebarNav;
