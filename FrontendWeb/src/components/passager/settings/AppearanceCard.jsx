import { useTranslation } from 'react-i18next';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Switch from '../../admin/ui/Switch';

const AppearanceCard = ({ theme, sound, onToggleTheme, onToggleSound }) => {
  const { t } = useTranslation();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('passenger_settings.appearance')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.dark_mode')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.dark_mode_desc')}</p>
          </div>
          <Switch
            checked={theme === 'dark'}
            onChange={onToggleTheme}
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100">{t('passenger_settings.sounds')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{t('passenger_settings.sounds_desc')}</p>
          </div>
          <Switch
            checked={sound}
            onChange={onToggleSound}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceCard;
