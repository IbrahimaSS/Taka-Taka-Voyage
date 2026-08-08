import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { AlertCircle, Check } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';
import Badge from '../../admin/ui/Badge';

const VehicleSelector = ({ vehicles, loadingServices, selectedVehicle, onSelectVehicle }) => {
  const { t } = useTranslation();

  return (
    <Card hoverable={false} className="bg-transparent border-none shadow-none p-0">
      <CardHeader className="p-0">
        <CardTitle size="md">{t('confirmation.choose_vehicle')}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-4">
        {loadingServices ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            <span className="ml-3 text-gray-500">{t('confirmation.loading_services')}</span>
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('confirmation.no_services')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {vehicles.map((vehicle) => {
              const Icon = vehicle.icon;
              const isSelected = selectedVehicle === vehicle.id;
              const isDisabled = !vehicle.enabled;

              return (
                <button
                  type="button"
                  key={vehicle.id}
                  onClick={() => {
                    if (isDisabled) {
                      toast.error(`Le service "${vehicle.name}" est actuellement désactivé par l'administrateur`);
                      return;
                    }
                    onSelectVehicle(vehicle.id);
                  }}
                  disabled={isDisabled}
                  className={`relative p-6 rounded-xl border-2 transition-all ${isDisabled
                    ? "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 opacity-50 cursor-not-allowed grayscale"
                    : isSelected
                      ? "border-green-500 bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-green-900/10 dark:to-blue-900/10"
                      : "border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-400"
                    }`}
                >
                  {/* Badge désactivé */}
                  {isDisabled && (
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 uppercase tracking-wider">
                        {t('confirmation.unavailable')}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col items-center text-center">
                    <div
                      className={`w-20 h-20 rounded-full ${isDisabled
                        ? "bg-gray-200 dark:bg-gray-700"
                        : vehicle.color.bg
                        } flex items-center justify-center mb-4 ${isSelected && !isDisabled
                          ? "ring-2 ring-green-500 ring-offset-2 dark:ring-offset-gray-900"
                          : ""
                        }`}
                    >
                      <Icon
                        className={`w-10 h-10 ${isDisabled
                          ? "text-gray-400 dark:text-gray-500"
                          : vehicle.color.text
                          }`}
                      />
                    </div>
                    <h4 className={`font-bold mb-2 ${isDisabled ? "text-gray-400 dark:text-gray-600" : "text-gray-900 dark:text-gray-100"}`}>
                      {vehicle.name}
                    </h4>
                    <p className={`text-sm mb-3 ${isDisabled ? "text-gray-300 dark:text-gray-600" : "text-gray-600 dark:text-gray-400"}`}>
                      {vehicle.description}
                    </p>
                    <div className={`font-bold text-xl mb-3 ${isDisabled ? "text-gray-300 dark:text-gray-600 line-through" : "text-green-600 dark:text-green-400"}`}>
                      {Number(vehicle.price).toLocaleString()} GNF
                    </div>
                    <div className="space-y-1 mb-3">
                      {vehicle.features.map((feature, idx) => (
                        <p key={idx} className={`text-xs ${isDisabled ? "text-gray-300 dark:text-gray-600" : "text-gray-500 dark:text-gray-400"}`}>
                          {feature}
                        </p>
                      ))}
                    </div>
                    {isSelected && !isDisabled && (
                      <div className="mt-2">
                        <Badge variant="success" size="sm">
                          <Check className="w-3 h-3 mr-1" />
                          {t('confirmation.selected')}
                        </Badge>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VehicleSelector;
