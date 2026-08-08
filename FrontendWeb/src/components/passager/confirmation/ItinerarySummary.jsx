import { useTranslation } from 'react-i18next';
import { MapPin, Flag, Radar, Clock } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const ItinerarySummary = ({ tripDetails }) => {
  const { t } = useTranslation();

  return (
    <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
      <CardHeader className="p-0">
        <CardTitle size="md">{t('confirmation.itinerary')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('confirmation.pickup')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {tripDetails?.pickup || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                <Flag className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('confirmation.destination')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {tripDetails?.destination || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                <Radar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('confirmation.distance')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {tripDetails?.estimatedDistance || "—"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('confirmation.duration')}</p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {tripDetails?.estimatedDuration || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ItinerarySummary;
