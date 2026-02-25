// src/components/settings/components/ApiSettings.jsx
// pour les paramètres des API et intégrations.
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Key, Globe, Shield, Zap, Cpu, Webhook, Eye, EyeOff, Copy, Check, DollarSign, MessageCircle, FileText, ExternalLink } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Bttn';
import Switch from '../ui/Switch';
import Badge from '../ui/Badge';

const ApiSettings = ({ settings, updateNestedSetting, showToast }) => {
    const { t } = useTranslation();
    const [showApiKeys, setShowApiKeys] = useState({});
    const [copiedKey, setCopiedKey] = useState(null);

    const apiServices = [
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

    const handleToggleApi = (apiId) => {
        const currentValue = settings.api?.[apiId]?.enabled || false;
        updateNestedSetting('api', apiId, 'enabled', !currentValue);
    };

    const handleApiKeyChange = (apiId, field, value) => {
        updateNestedSetting('api', apiId, field, value);
    };

    const handleCopyApiKey = (key, value) => {
        if (!value) {
            showToast(t('common.error'), t('api.copy_error'), 'error');
            return;
        }
        navigator.clipboard.writeText(value);
        setCopiedKey(key);
        showToast(t('common.success'), t('api.copy_success'), 'success');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const generateApiKey = () => {
        const key = `ttk_${Array.from({ length: 32 }, () =>
            Math.random().toString(36)[2]
        ).join('')}`;
        updateNestedSetting('api', 'takataka', 'apiKey', key);
        showToast(t('common.success'), t('api.key_generated'), 'success');
    };

    const toggleKeyVisibility = (key) => {
        setShowApiKeys(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    return (
        <div className="space-y-8">
            {/* Clé API principale */}
            <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-blue-100 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center">
                        <Key className="w-5 h-5 mr-2" />
                        {t('api.main_key')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900/20 dark:to-teal-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('api.platform_key')}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {t('api.platform_key_desc')}
                                </p>
                            </div>

                            <div className="flex items-center space-x-3">
                                <div className="flex-1 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 min-w-[300px]">
                                    <div className="flex items-center justify-between">
                                        <code className="text-gray-800 dark:text-gray-100 font-mono text-sm truncate">
                                            {showApiKeys.main
                                                ? settings.api?.takataka?.apiKey || 'ttk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
                                                : '••••••••••••••••••••••••••••••••'}
                                        </code>
                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => toggleKeyVisibility('main')}
                                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                                                aria-label="Afficher/Masquer la clé"
                                            >
                                                {showApiKeys.main ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                            <button
                                                onClick={() => handleCopyApiKey('main', settings.api?.takataka?.apiKey)}
                                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                                                aria-label="Copier la clé"
                                            >
                                                {copiedKey === 'main' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    className="bg-gradient-to-r from-blue-700 to-teal-700"
                                    onClick={generateApiKey}
                                >
                                    {t('common.generate')}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('api.rate_limit')}</p>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        value={settings.api?.takataka?.rateLimit || 100}
                                        onChange={(e) => updateNestedSetting('api', 'takataka', 'rateLimit', e.target.value)}
                                        className="w-full bg-transparent border-none outline-none font-bold text-lg text-blue-600"
                                    />
                                    <span className="text-xs text-gray-400 ml-2">req/min</span>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('api.token_expiry')}</p>
                                <div className="flex items-center">
                                    <select
                                        value={settings.api?.takataka?.tokenExpiry || '24h'}
                                        onChange={(e) => updateNestedSetting('api', 'takataka', 'tokenExpiry', e.target.value)}
                                        className="w-full bg-transparent border-none outline-none font-bold text-lg text-teal-600"
                                    >
                                        <option value="1h">1 {t('common.hours')}</option>
                                        <option value="24h">24 {t('common.hours')}</option>
                                        <option value="7d">7 {t('common.days')}</option>
                                        <option value="30d">30 {t('common.days')}</option>
                                        <option value="never">{t('common.never')}</option>
                                    </select>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">{t('api.version')}</p>
                                <div className="flex items-center">
                                    <span className="font-bold text-lg text-gray-800 dark:text-gray-100">v2.1.0</span>
                                    <Badge variant="outline" className="ml-auto text-[10px] py-0">{t('common.stable')}</Badge>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Intégrations externes */}
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
                                                onChange={() => handleToggleApi(service.id)}
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
                                                            onChange={(e) => handleApiKeyChange(service.id, field, e.target.value)}
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
                                                                onClick={() => handleCopyApiKey(`${service.id}_${field}`, settings.api?.[service.id]?.[field])}
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

            {/* Webhooks et Sécurité API */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Webhooks */}
                <Card hoverable className="border-2 border-gray-100 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-blue-800 flex items-center">
                            <Webhook className="w-5 h-5 mr-2" />
                            {t('api.webhooks')}
                        </CardTitle>
                        <CardDescription>
                            {t('api.webhook_desc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                {t('api.webhook_url')}
                            </label>
                            <input
                                type="url"
                                value={settings.api?.webhooks?.url || ''}
                                onChange={(e) => updateNestedSetting('api', 'webhooks', 'url', e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                placeholder="https://votre-serveur.com/webhook"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-4">
                                {t('api.events_to_notify')}
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { id: 'ride.created', label: t('notif.ride_created') },
                                    { id: 'payment.received', label: t('notif.payment_received') },
                                    { id: 'driver.online', label: t('api.driver_online') },
                                    { id: 'driver.offline', label: t('api.driver_offline') },
                                    { id: 'user.registered', label: t('api.user_registered') },
                                    { id: 'review.submitted', label: t('api.review_submitted') },
                                ].map((event) => (
                                    <div key={event.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-lg">
                                        <span className="text-xs font-medium text-gray-700 dark:text-gray-200">{event.label}</span>
                                        <Switch
                                            size="sm"
                                            checked={settings.api?.webhooks?.events?.[event.id] || false}
                                            onChange={() => updateNestedSetting('api', 'webhooks', 'events', {
                                                ...settings.api?.webhooks?.events,
                                                [event.id]: !settings.api?.webhooks?.events?.[event.id]
                                            })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Sécurité API */}
                <Card hoverable className="border-2 border-gray-100 dark:border-gray-800">
                    <CardHeader>
                        <CardTitle className="text-gray-800 flex items-center">
                            <Shield className="w-5 h-5 mr-2" />
                            {t('api.api_security')}
                        </CardTitle>
                        <CardDescription>
                            {t('api.security_recommendations')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                {t('api.cors_domains')}
                            </label>
                            <p className="text-xs text-gray-500 mb-2">{t('api.cors_domains_desc')}</p>
                            <textarea
                                value={settings.api?.security?.corsDomains || ''}
                                onChange={(e) => updateNestedSetting('api', 'security', 'corsDomains', e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none transition-all font-mono text-xs"
                                rows="3"
                                placeholder="https://votre-app.com"
                            />
                        </div>

                        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                            <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4">{t('api.security_recommendations')}</h4>
                            <ul className="space-y-3">
                                {[
                                    t('api.rec_regen_keys'),
                                    t('api.rec_env_vars'),
                                    t('api.rec_limit_cors'),
                                    t('api.rec_2fa'),
                                ].map((rec, i) => (
                                    <li key={i} className="flex items-start space-x-2 text-xs text-gray-600 dark:text-gray-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1 flex-shrink-0" />
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ApiSettings;