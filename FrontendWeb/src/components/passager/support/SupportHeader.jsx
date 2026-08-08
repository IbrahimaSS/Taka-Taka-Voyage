import { useTranslation } from 'react-i18next';
import { Headphones, MessageCircle } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';
import Badge from '../../admin/ui/Badge';

const SupportHeader = () => {
  const { t } = useTranslation();

  return (
    <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
      <CardContent>
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {t('support.title')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {t('support.subtitle')}
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                <Headphones className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-bold text-gray-900 dark:text-gray-100">{t('support.support_247')}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('support.response_time')}</p>
              </div>
            </div>
            <Badge variant="success" size="lg">
              <span className="flex items-center">
                <MessageCircle className="w-4 h-4 mr-1" />
                {t('support.online_status')}
              </span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SupportHeader;
