import { motion } from 'framer-motion';
import { Shield, MessageSquare } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Switch from '../../ui/Switch';

const MaintenanceCard = ({ t, settings, updateSetting }) => {
  return (
    <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-red-100 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          {t('settings.maintenance_mode')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between p-4 border-2 border-gray-200 dark:border-gray-800 rounded-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield className="text-red-600 w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{t('settings.activate_maintenance')}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('settings.maintenance_description')}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.platform?.maintenanceMode || false}
            onChange={() => updateSetting('platform.maintenanceMode', !settings.platform?.maintenanceMode)}
          />
        </div>

        {settings.platform?.maintenanceMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="overflow-hidden"
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                {t('settings.maintenance_message')}
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <textarea
                  value={settings.platform?.maintenanceMessage || ''}
                  onChange={(e) => updateSetting('platform.maintenanceMessage', e.target.value)}
                  rows="4"
                  className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="Message à afficher aux utilisateurs..."
                />
              </div>

              <div className="flex items-center space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-700">
                  <strong>{t('common.note')} :</strong> {t('settings.maintenance_note')}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default MaintenanceCard;
