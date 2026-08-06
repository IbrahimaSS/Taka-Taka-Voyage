import { motion } from 'framer-motion';
import { Cpu, Globe, Zap, DollarSign, MessageCircle, Eye, EyeOff, Copy, Check, ExternalLink } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../../ui/Card';
import Button from '../../ui/Bttn';
import Switch from '../../ui/Switch';
import Badge from '../../ui/Badge';

const getApiServices = (t) => [
  {
    id: 'googleMaps',
    name: 'Google Maps',
    description: t('api.google_maps_desc'),
    icon: Globe,
    color: 'blue',
    gradient: 'from-blue-100 to-blue-200',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-100',
    requiredFields: ['apiKey'],
    docsUrl: 'https://developers.google.com/maps'
  },
  {
    id: 'africastalking',
    name: 'Africa\'s Talking',
    description: t('api.africastalking_desc'),
    icon: Zap,
    color: 'orange',
    gradient: 'from-orange-100 to-orange-200',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-100',
    requiredFields: ['apiKey', 'username'],
    docsUrl: 'https://africastalking.com'
  },
  {
    id: 'stripe',
    name: 'Stripe',
    description: t('api.stripe_desc'),
    icon: DollarSign,
    color: 'purple',
    gradient: 'from-purple-100 to-purple-200',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-100',
    requiredFields: ['publicKey', 'secretKey'],
    docsUrl: 'https://stripe.com'
  },
  {
    id: 'twilio',
    name: 'Twilio',
    description: t('api.twilio_desc'),
    icon: MessageCircle,
    color: 'green',
    gradient: 'from-green-100 to-green-200',
    textColor: 'text-green-600',
    bgColor: 'bg-green-100',
    requiredFields: ['accountSid', 'authToken'],
    docsUrl: 'https://twilio.com'
  }
];

const ExternalIntegrationsCard = ({ t, settings, showToast, showApiKeys, copiedKey, toggleKeyVisibility, onCopyApiKey, onApiKeyChange, onToggleApi }) => {
  const apiServices = getApiServices(t);

  return (
    <Card hoverable className="border-2 border-gray-100 dark:border-gray-800">
      <CardHeader>
        <CardTitle className="text-blue-800 flex items-center">
          <Cpu className="w-5 h-5 mr-2" />
          {t('api.external_integrations')}
        </CardTitle>
        <CardDescription>
          {t('api.external_integrations_desc')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apiServices.map((service) => {
            const Icon = service.icon;
            const isEnabled = settings.api?.[service.id]?.enabled || false;

            return (
              <div
                key={service.id}
                className={`relative p-5 rounded-2xl border-2 transition-all duration-300 ${isEnabled ? 'border-teal-100 bg-teal-50/10 dark:bg-teal-900/10' : 'border-gray-100 bg-gray-50/50 dark:bg-gray-900/50'}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-xl ${isEnabled ? service.bgColor : 'bg-gray-200'} ${isEnabled ? service.textColor : 'text-gray-400'} transition-colors`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 dark:text-gray-100">{service.name}</h4>
                      {isEnabled ? (
                        <Badge variant="success" size="sm" className="mt-1">
                          {t('common.connected')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" size="sm" className="mt-1 text-gray-500">
                          {t('common.disabled')}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                      onClick={() => window.open(service.docsUrl, '_blank')}
                      title={t('common.documentation')}
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </Button>
                    <Switch
                      checked={isEnabled}
                      onChange={() => onToggleApi(service.id)}
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
                  {service.description}
                </p>

                {isEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-3 pt-3 border-t border-gray-100 dark:border-gray-800"
                  >
                    {service.requiredFields.map(field => (
                      <div key={field}>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          {field === 'apiKey' || field === 'publicKey' || field === 'secretKey' ? t('api.main_key') : field}
                        </label>
                        <div className="relative">
                          <input
                            type={showApiKeys[`${service.id}_${field}`] ? "text" : "password"}
                            value={settings.api?.[service.id]?.[field] || ''}
                            onChange={(e) => onApiKeyChange(service.id, field, e.target.value)}
                            className="w-full pl-3 pr-10 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-100 outline-none transition-all"
                            placeholder={`Enter ${field}...`}
                          />
                          <div className="absolute right-2 top-2 flex items-center space-x-1">
                            <button
                              onClick={() => toggleKeyVisibility(`${service.id}_${field}`)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {showApiKeys[`${service.id}_${field}`] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => onCopyApiKey(`${service.id}_${field}`, settings.api?.[service.id]?.[field])}
                              className="p-1 text-gray-400 hover:text-gray-600"
                            >
                              {copiedKey === `${service.id}_${field}` ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full h-8 text-xs border-dashed border-gray-300 hover:border-teal-500 hover:text-teal-600 transition-all font-medium"
                      onClick={() => showToast(t('common.info'), `${t('api.test_conn')} ${service.name}...`, 'info')}
                    >
                      {t('api.test_conn_btn')}
                    </Button>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExternalIntegrationsCard;
