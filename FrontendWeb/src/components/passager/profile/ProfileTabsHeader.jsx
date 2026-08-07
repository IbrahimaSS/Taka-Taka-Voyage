import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import Badge from '../../admin/ui/Badge';

const ProfileTabsHeader = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('profile.title')}</h2>

      <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-full md:w-auto">
        <button
          onClick={() => onTabChange('info')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'info' ? 'bg-white dark:bg-gray-800 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Informations personnelles
        </button>
        <button
          onClick={() => onTabChange('tickets')}
          className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tickets' ? 'bg-white dark:bg-gray-800 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          Mes Tickets
        </button>
      </div>

      <Badge className="hidden md:flex bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800" size="sm">
        <Crown className="w-4 h-4 mr-1" />
        {t('profile.membership.premium')}
      </Badge>
    </div>
  );
};

export default ProfileTabsHeader;
