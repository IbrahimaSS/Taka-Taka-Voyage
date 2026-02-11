// src/components/settings/components/ApiSettings.jsx
// pour les paramètres des API et intégrations.
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Globe, Shield, Zap, Cpu, Webhook, Eye, EyeOff, Copy, Check, DollarSign, MessageCircle, FileText } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Switch from '../ui/Switch';
import Badge from '../ui/Badge';

const ApiSettings = ({ settings, updateNestedSetting, showToast }) => {
    const [showApiKeys, setShowApiKeys] = useState({});
    const [copiedKey, setCopiedKey] = useState(null);

    const apiServices = [
        {
            id: 'googleMaps',
            name: 'Google Maps',
            description: 'Service de cartographie et calcul d\'itinéraires',
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
            description: 'Service de SMS et USSD',
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
            description: 'Paiements en ligne par carte',
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
            description: 'Service de communication (SMS, voix)',
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
            showToast('Erreur', 'Aucune clé API à copier', 'error');
            return;
        }
        navigator.clipboard.writeText(value);
        setCopiedKey(key);
        showToast('Succès', 'Clé API copiée dans le presse-papier', 'success');
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const generateApiKey = () => {
        const key = `ttk_${Array.from({ length: 32 }, () =>
            Math.random().toString(36)[2]
        ).join('')}`;
        updateNestedSetting('api', 'takataka', 'apiKey', key);
        showToast('Succès', 'Nouvelle clé API générée', 'success');
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
                        Clé API principale
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border-2 border-blue-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">Clé API Taka Taka</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    Utilisez cette clé pour intégrer votre application
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
                                    Générer
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Limite de requêtes</p>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        value={settings.api?.rateLimit || 100}
                                        onChange={(e) => updateNestedSetting('api', 'takataka', 'rateLimit', parseInt(e.target.value))}
                                        className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg pl-2 py-2 outline-none focus:border-blue-500"
                                    />
                                    <span className="ml-2 text-gray-600 dark:text-gray-300">/min</span>
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Expiration du token</p>
                                <div className="flex items-center">
                                    <input
                                        type="number"
                                        min="1"
                                        value={settings.api?.tokenExpiry || 24}
                                        onChange={(e) => updateNestedSetting('api', 'takataka', 'tokenExpiry', parseInt(e.target.value))}
                                        className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                    />
                                    <span className="ml-2 text-gray-600 dark:text-gray-300">heures</span>
                                </div>
                            </div>

                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Version API</p>
                                <div className="flex items-center">
                                    <select
                                        value={settings.api?.version || 'v1'}
                                        onChange={(e) => updateNestedSetting('api', 'takataka', 'version', e.target.value)}
                                        className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                                    >
                                        <option value="v1">v1.0 (Stable)</option>
                                        <option value="v2">v2.0 (Beta)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Intégrations externes */}
            <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-purple-100 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-purple-800 flex items-center">
                        <Cpu className="w-5 h-5 mr-2" />
                        Intégrations externes
                    </CardTitle>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Configurez les services tiers utilisés par la plateforme
                    </p>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {apiServices.map((service) => {
                            const Icon = service.icon;
                            const apiConfig = settings.api?.[service.id] || {};

                            return (
                                <div key={service.id} className="border-2 border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                                    <div className={`p-5 ${apiConfig.enabled ? `bg-gradient-to-r ${service.gradient}` : 'bg-gray-50 dark:bg-gray-950'}`}>
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div className="flex items-center space-x-4">
                                                <div className={`w-12 h-12 rounded-xl ${service.gradient} flex items-center justify-center`}>
                                                    <Icon className={`${service.textColor} w-6 h-6`} />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-gray-800 dark:text-gray-100">{service.name}</h4>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300">{service.description}</p>
                                                    <div className="flex items-center space-x-3 mt-2">
                                                        <Badge variant={apiConfig.enabled ? 'success' : 'default'} size="sm">
                                                            {apiConfig.enabled ? 'Connecté' : 'Désactivé'}
                                                        </Badge>
                                                        <a
                                                            href={service.docsUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                                        >
                                                            <FileText className="w-3 h-3 mr-1" />
                                                            Documentation
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>

                                            <Switch
                                                checked={apiConfig.enabled || false}
                                                onChange={() => handleToggleApi(service.id)}
                                            />
                                        </div>

                                        {/* Champs de configuration */}
                                        {apiConfig.enabled && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-6 space-y-4"
                                            >
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    {service.requiredFields.map((field) => (
                                                        <div key={field}>
                                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 capitalize">
                                                                {field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                                            </label>
                                                            <div className="relative">
                                                                <input
                                                                    type={showApiKeys[`${service.id}_${field}`] ? 'text' : 'password'}
                                                                    value={apiConfig[field] || ''}
                                                                    onChange={(e) => handleApiKeyChange(service.id, field, e.target.value)}
                                                                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl pl-4 pr-10 py-3 outline-none focus:border-blue-500 transition-all"
                                                                    placeholder={`Entrez votre ${field}...`}
                                                                />
                                                                <div className="absolute right-3 top-3 flex items-center space-x-2">
                                                                    <button
                                                                        onClick={() => toggleKeyVisibility(`${service.id}_${field}`)}
                                                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                                                                        aria-label="Afficher/Masquer"
                                                                    >
                                                                        {showApiKeys[`${service.id}_${field}`] ? (
                                                                            <EyeOff className="w-4 h-4" />
                                                                        ) : (
                                                                            <Eye className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleCopyApiKey(`${service.id}_${field}`, apiConfig[field])}
                                                                        className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                                                                        aria-label="Copier"
                                                                    >
                                                                        {copiedKey === `${service.id}_${field}` ? (
                                                                            <Check className="w-4 h-4 text-green-500" />
                                                                        ) : (
                                                                            <Copy className="w-4 h-4" />
                                                                        )}
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Bouton de test */}
                                                <div className="flex justify-end">
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => showToast('Test', `Test de connexion à ${service.name}`, 'info')}
                                                    >
                                                        Tester la connexion
                                                    </Button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Webhooks */}
            <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-teal-100 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-teal-800 flex items-center">
                        <Webhook className="w-5 h-5 mr-2" />
                        Webhooks
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                            URL de webhook
                        </label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
                            <input
                                type="url"
                                value={settings.api?.webhookUrl || ''}
                                onChange={(e) => updateNestedSetting('api', 'takataka', 'webhookUrl', e.target.value)}
                                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-teal-500 transition-all"
                                placeholder="https://votre-domaine.com/webhook"
                            />
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            URL pour recevoir les notifications en temps réel (nouvelles courses, paiements, etc.)
                        </p>
                    </div>

                    <div>
                        <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-3">Événements à notifier</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                { id: 'ride_created', label: 'Nouvelle course', default: true },
                                { id: 'ride_accepted', label: 'Course acceptée', default: true },
                                { id: 'ride_completed', label: 'Course terminée', default: true },
                                { id: 'payment_received', label: 'Paiement reçu', default: true },
                                { id: 'driver_online', label: 'Chauffeur en ligne', default: false },
                                { id: 'driver_offline', label: 'Chauffeur hors ligne', default: false },
                                { id: 'user_registered', label: 'Nouvel utilisateur', default: true },
                                { id: 'review_submitted', label: 'Avis soumis', default: false }
                            ].map(event => (
                                <label key={event.id} className="flex items-center space-x-2 p-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:border-teal-300 transition-all">
                                    <input
                                        type="checkbox"
                                        checked={settings.api?.webhookEvents?.includes(event.id) || event.default}
                                        onChange={(e) => {
                                            const events = settings.api?.webhookEvents || [];
                                            if (e.target.checked) {
                                                updateNestedSetting('api', 'takataka', 'webhookEvents', [...events, event.id]);
                                            } else {
                                                updateNestedSetting('api', 'takataka', 'webhookEvents', events.filter(id => id !== event.id));
                                            }
                                        }}
                                        className="rounded text-teal-600 focus:ring-teal-500"
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-200">{event.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sécurité API */}
            <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-red-100 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-red-800 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Sécurité API
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                Domaines autorisés (CORS)
                            </label>
                            <textarea
                                value={(settings.api?.corsDomains || []).join('\n')}
                                onChange={(e) => {
                                    const domains = e.target.value.split('\n').filter(d => d.trim());
                                    updateNestedSetting('api', 'takataka', 'corsDomains', domains);
                                }}
                                rows="4"
                                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all"
                                placeholder="https://votre-domaine.com"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Un domaine par ligne. Laissez vide pour autoriser tous les domaines (déconseillé).
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                                IPs autorisées
                            </label>
                            <textarea
                                value={(settings.security?.ipWhitelist || []).join('\n')}
                                onChange={(e) => {
                                    const ips = e.target.value.split('\n').filter(ip => ip.trim());
                                    updateNestedSetting('security', 'takataka', 'ipWhitelist', ips);
                                }}
                                rows="4"
                                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-red-500 transition-all"
                                placeholder="192.168.1.1"
                            />
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                Une IP ou plage CIDR par ligne. Laissez vide pour toutes les IPs.
                            </p>
                        </div>
                    </div>

                    <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border-2 border-red-200">
                        <div className="flex items-center">
                            <Shield className="w-5 h-5 text-red-600 mr-3 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-red-700">Recommandations de sécurité</p>
                                <ul className="text-sm text-red-600 mt-2 space-y-1">
                                    <li>• Régénérez vos clés API régulièrement (tous les 3 mois)</li>
                                    <li>• Utilisez des clés d'environnement, jamais en clair dans le code</li>
                                    <li>• Limitez les domaines CORS au strict nécessaire</li>
                                    <li>• Activez l'authentification à deux facteurs pour l'accès aux paramètres API</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ApiSettings;