import { useTranslation } from 'react-i18next';

const MobileBottomNav = ({ tabs, activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default MobileBottomNav;
