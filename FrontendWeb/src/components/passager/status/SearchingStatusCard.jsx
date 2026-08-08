import { useTranslation } from 'react-i18next';
import { Loader, Users, Clock, AlertCircle } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';

const SearchingStatusCard = ({ onCancelClick }) => {
  const { t } = useTranslation();

  return (
    <Card className="mb-6">
      <CardContent>
        <div className="text-center mb-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 flex items-center justify-center mx-auto mb-4">
            <Loader className="w-12 h-12 text-green-600 dark:text-green-400 animate-spin" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-center space-x-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-lg font-bold text-blue-700 dark:text-blue-400">—</p>
                  <p className="text-xs text-blue-600 dark:text-blue-300">{t('status.searching.drivers_contacted')}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl">
              <div className="flex items-center justify-center space-x-2">
                <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-lg font-bold text-green-700 dark:text-green-400">—</p>
                  <p className="text-xs text-green-600 dark:text-green-300">{t('status.searching.estimated_time')}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-xl">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mr-2" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {t('status.searching.cancel_info')}
              </p>
            </div>
          </div>
        </div>

        <Button variant="danger" fullWidth onClick={onCancelClick}>
          {t('status.searching.cancel_btn')}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SearchingStatusCard;
