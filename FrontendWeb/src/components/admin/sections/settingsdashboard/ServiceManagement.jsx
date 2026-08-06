import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Bike, Car, Package, Truck } from 'lucide-react';
import Card from '../../ui/Card';

const serviceIcons = {
  motoTaxi: Bike,
  sharedTaxi: Car,
  privateCar: Car,
  delivery: Package,
  truck: Truck
};

const getServiceIcon = (serviceId) => {
  const Icon = serviceIcons[serviceId];
  return Icon ? <Icon className="w-6 h-6" /> : <Car className="w-6 h-6" />;
};

// Carte de service améliorée
const ServiceCard = ({ service, serviceId, icon, onUpdate, onToggle }) => {
  const { t } = useTranslation();
  const [localPrice, setLocalPrice] = useState({
    basePrice: service.basePrice || '',
    perKm: service.perKm || '',
    perMinute: service.perMinute || ''
  });

  useEffect(() => {
    setLocalPrice({
      basePrice: service.basePrice || '',
      perKm: service.perKm || '',
      perMinute: service.perMinute || ''
    });
  }, [service]);

  const handlePriceChange = (field, value) => {
    const numValue = parseInt(value) || '';
    setLocalPrice(prev => ({ ...prev, [field]: numValue }));

    // Mettre à jour immédiatement
    onUpdate({ [field]: numValue });
  };

  const calculateExample = () => {
    return (localPrice.basePrice + (5 * localPrice.perKm) + (15 * localPrice.perMinute)).toLocaleString();
  };

  return (
    <Card className={`border-2 ${service.enabled ? 'border-green-200' : 'border-gray-200 dark:border-gray-900'} hover:shadow-md transition-all duration-200`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center text-white`}>
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-800 dark:text-gray-100">{service.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{service.description}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${service.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100'}`}>
                  {service.enabled ? t('common.active') : t('common.inactive')}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('common.example')}: {calculateExample()} {t('common.currency_symbol')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className={`w-12 h-6 rounded-full transition-colors duration-200 ${service.enabled ? 'bg-green-500' : 'bg-gray-300'}`}
            aria-label={service.enabled ? t('settings.deactivate_service') : t('settings.activate_service')}
          >
            <div className={`w-5 h-5 rounded-full bg-white dark:bg-gray-700 transform transition-transform duration-200 ${service.enabled ? 'translate-x-7' : 'translate-x-1'}`} />
          </button>
        </div>

        {service.enabled && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('settings.base_price')}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={localPrice.basePrice}
                    onChange={(e) => handlePriceChange('basePrice', e.target.value)}
                    className="w-full border border-gray-300 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-lg px-2 py-1.5 text-sm pr-6"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-500 dark:text-gray-400">{t('common.currency_symbol')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('settings.per_km')}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={localPrice.perKm}
                    onChange={(e) => handlePriceChange('perKm', e.target.value)}
                    className="w-full border border-gray-300 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-lg px-2 py-1.5 text-sm pr-6"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-500 dark:text-gray-400">{t('common.currency_symbol')}</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('settings.per_min')}</label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    value={localPrice.perMinute}
                    onChange={(e) => handlePriceChange('perMinute', e.target.value)}
                    className="w-full border border-gray-300 dark:bg-gray-900/40 dark:border-gray-900/40 rounded-lg px-2 py-1.5 text-sm pr-6"
                  />
                  <span className="absolute right-2 top-1.5 text-xs text-gray-500 dark:text-gray-400">{t('common.currency_symbol')}</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-gray-500 dark:text-gray-400 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <div className="flex justify-between">
                <span>{t('settings.example_ride')}:</span>
                <span className="font-bold text-green-600">{calculateExample()} {t('common.currency_symbol')}</span>
              </div>
              <div className="text-[10px] mt-1">
                {localPrice.basePrice} + (5 × {localPrice.perKm}) + (15 × {localPrice.perMinute})
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Composant de gestion des services
const ServiceManagement = ({ settings, updateNestedSetting, showToast }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">{t('nav.services_management')}</h2>
        <p className="text-gray-600 dark:text-gray-300">{t('settings.services_description')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
        {Object.entries(settings.services || {}).map(([key, service]) => (
          <ServiceCard
            key={key}
            service={service}
            serviceId={key}
            icon={getServiceIcon(key)}
            onUpdate={(updates) => {
              Object.entries(updates).forEach(([field, value]) => {
                updateNestedSetting('services', key, field, value);
              });
            }}
            onToggle={() => updateNestedSetting('services', key, 'enabled', !service.enabled)}
          />
        ))}
      </div>

      <div className="p-4 bg-slate-200/30 dark:bg-gray-800 rounded-xl border-2 border-blue-200">
        <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
          {t('settings.config_tips')}
        </h4>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
          <li>• {t('settings.tip_active_services')}</li>
          <li>• {t('settings.tip_competitive_rates')}</li>
          <li>• {t('settings.tip_test_service')}</li>
          <li>• {t('settings.tip_op_hours')}</li>
        </ul>
      </div>
    </div>
  );
};

export default ServiceManagement;
