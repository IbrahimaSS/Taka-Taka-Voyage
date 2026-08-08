import { useTranslation } from 'react-i18next';
import { Check, Navigation, Calendar, X, Flag, ChevronRight, Star } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';

const OtherStatusCard = ({ status, onStartTrip, onTripComplete, onViewPlanning, onSearchAgain, onClose, onRateTrip }) => {
  const { t } = useTranslation();

  switch (status) {
    case "arrived":
      return (
        <Card>
          <CardContent>
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('status.arrived.title_full')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{t('status.arrived.subtitle')}</p>
            </div>

            <Button variant="primary" fullWidth icon={Navigation} onClick={onStartTrip}>
              {t('status.arrived.start_trip')}
            </Button>
          </CardContent>
        </Card>
      );

    case "en_route":
      return (
        <Card>
          <CardContent>
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                <Navigation className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('status.en_route.title')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('status.en_route.description')}</p>
            </div>

            <Button variant="primary" fullWidth icon={Flag} onClick={onTripComplete}>
              {t('status.en_route.finish_trip')}
            </Button>
          </CardContent>
        </Card>
      );

    case "scheduled":
      return (
        <Card>
          <CardContent>
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('status.scheduled.title_full')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('status.scheduled.subtitle')}</p>
            </div>

            <Button variant="primary" fullWidth icon={ChevronRight} onClick={onViewPlanning}>
              {t('status.scheduled.view_planning')}
            </Button>
          </CardContent>
        </Card>
      );

    case "cancelled":
      return (
        <Card>
          <CardContent>
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <X className="w-12 h-12 text-gray-600 dark:text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('status.cancelled.title_full')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('status.cancelled.subtitle')}</p>
            </div>

            <div className="space-y-3">
              <Button variant="primary" fullWidth onClick={onSearchAgain}>
                {t('status.cancelled.search_again')}
              </Button>
              <Button variant="secondary" fullWidth onClick={onClose}>
                {t('status.cancelled.back_home')}
              </Button>
            </div>
          </CardContent>
        </Card>
      );

    case "completed":
      return (
        <Card>
          <CardContent>
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('status.completed.title_full')}</h3>
              <p className="text-gray-600 dark:text-gray-400">{t('status.completed.subtitle')}</p>
            </div>

            <Button variant="primary" fullWidth icon={Star} onClick={onRateTrip}>
              {t('status.completed.rate_trip')}
            </Button>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <Button variant="info" fullWidth onClick={onSearchAgain}>
                {t('status.completed.new_trip')}
              </Button>
              <Button variant="secondary" fullWidth onClick={onClose}>
                {t('status.completed.back')}
              </Button>
            </div>
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
};

export default OtherStatusCard;
