import { useTranslation } from 'react-i18next';
import { Loader, Phone, Shield, Star, Car, Clock, Map, MapPin, BadgePercent } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';
import Badge from '../../admin/ui/Badge';
import Progress from '../../admin/ui/Progress';

const formatPrice = (price) => {
  if (!price) return "0 GNF";
  return typeof price === "number" ? `${price.toLocaleString()} GNF` : price;
};

const formatSeconds = (s) => {
  if (s == null) return null;
  const sec = Number(s);
  if (Number.isNaN(sec) || sec <= 0) return "00:00";
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const ss = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
};

const DriverFoundCard = ({ driver, tripDetails, arrivalSecondsRemaining, onContact, onTrack, onCancelClick }) => {
  const { t } = useTranslation();

  if (!driver) {
    return (
      <Card className="mb-6">
        <CardContent>
          <div className="flex items-center justify-center py-8 text-gray-600 dark:text-gray-400">
            <Loader className="w-5 h-5 mr-2 animate-spin" />
            {t('status.driver_found.waiting_driver')}
          </div>
        </CardContent>
      </Card>
    );
  }

  const name = driver.name || `${driver?.nom || ""} ${driver?.prenom || ""}`.trim() || "Chauffeur";
  const rating = driver.rating ?? driver.noteMoyenne ?? 4.5;

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center min-w-0">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center mr-4 relative shadow-lg overflow-hidden border-2 border-white dark:border-gray-800 shrink-0">
                {driver.photo ? (
                  <img src={driver.photo} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">
                    {name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </span>
                )}
                {driver.verified && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                    <Shield className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg truncate max-w-[160px] sm:max-w-none">{name}</h3>
                  {driver.verified && (
                    <Badge variant="info" size="xs">
                      {t('status.driver_found.verified')}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(rating)
                        ? "text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500"
                        : "text-gray-300 dark:text-gray-600"
                        }`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">{rating}</span>
                </div>
              </div>
            </div>

            <Button variant="ghost" size="small" icon={Phone} onClick={onContact} className="!p-2 shrink-0" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center">
              <Car className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 truncate">
                {driver.vehicle?.brand || driver.vehicleBrand || "—"} {driver.vehicle?.model || driver.vehicleModel || ""} •{" "}
                {driver.vehicle?.plate || driver.plate || "—"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-3 shrink-0" />
                <div className="text-gray-700 dark:text-gray-300">
                  <div>
                    {t('status.driver_found.arrival_scheduled')} • <span className="font-medium">{driver.eta || "—"}</span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{driver.distance || "—"}</div>
                </div>
              </div>

              {arrivalSecondsRemaining != null && (
                <div className="flex items-center space-x-3">
                  <Badge variant="secondary" size="sm">
                    {formatSeconds(arrivalSecondsRemaining)}
                  </Badge>
                  <Progress value={100} color="green" size="sm" showLabel={false} className="w-20" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle size="sm">{t('status.trip_details')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{t('status.pickup')}</span>
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium text-right">{tripDetails?.pickup}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <MapPin className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{t('status.destination')}</span>
              </div>
              <span className="text-gray-900 dark:text-gray-100 font-medium text-right">{tripDetails?.destination}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BadgePercent className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
                <span className="text-gray-700 dark:text-gray-300">{t('status.price')}</span>
              </div>
              <span className="text-green-700 dark:text-green-400 font-bold">
                {formatPrice(tripDetails?.estimatedPrice)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <Button variant="primary" fullWidth icon={Map} onClick={onTrack}>
          {t('status.driver_found.track_on_map')}
        </Button>
        <Button variant="danger" onClick={onCancelClick} className="sm:w-auto">
          {t('status.driver_found.cancel_btn')}
        </Button>
      </div>
    </>
  );
};

export default DriverFoundCard;
