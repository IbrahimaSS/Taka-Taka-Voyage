import { useTranslation } from 'react-i18next';
import { Clock, Calendar } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const TripTypeToggle = ({ tripType, onTripTypeChange, scheduleDate, onScheduleDateChange, scheduleTime, onScheduleTimeChange }) => {
  const { t } = useTranslation();
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
        <CardHeader className="p-0">
          <CardTitle size="md">{t('confirmation.trip_type')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onTripTypeChange("now")}
              className={`p-4 rounded-xl border-2 transition-all ${tripType === "now"
                ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                }`}
            >
              <div className="flex flex-col items-center">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('confirmation.now')}
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => onTripTypeChange("schedule")}
              className={`p-4 rounded-xl border-2 transition-all ${tripType === "schedule"
                ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20"
                : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                }`}
            >
              <div className="flex flex-col items-center">
                <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('confirmation.schedule')}
                </span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {tripType === "schedule" && (
        <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('confirmation.date')}
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => onScheduleDateChange(e.target.value)}
                  min={today}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('confirmation.time')}
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => onScheduleTimeChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
};

export default TripTypeToggle;
