// src/components/settings/components/PaymentsSettings.jsx
import React, { useState } from 'react';
import { CreditCard, Smartphone, DollarSign, Wallet, Clock, Shield, TrendingUp } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Switch from '../ui/Switch';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';

const PaymentsSettings = ({ settings, updateNestedSetting, showToast }) => {
  const [showApiKeys, setShowApiKeys] = useState({});

  const paymentMethods = [
    {
      id: 'cash',
      name: 'Espèces',
      icon: DollarSign,
      color: 'white',
      description: 'Paiement en espèces à la livraison'
    },
    {
      id: 'orangeMoney',
      name: 'Orange Money',
      icon: Smartphone,
      color: 'white',
      description: 'Paiement mobile via Orange Money'
    },
    {
      id: 'mtnMoney',
      name: 'MTN Mobile Money',
      icon: Smartphone,
      color: 'white',
      description: 'Paiement mobile via MTN Money'
    },
    {
      id: 'stripe',
      name: 'Carte bancaire',
      icon: CreditCard,
      color: 'white',
      description: 'Paiement par carte Visa/Mastercard'
    }
  ];

  const toggleKeyVisibility = (key) => {
    setShowApiKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-8">
      {/* Méthodes de paiement */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-blue-100 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <CreditCard className="w-5 h-5 mr-2" />
            Méthodes de paiement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {paymentMethods.map(method => {
            const Icon = method.icon;
            const methodConfig = settings.payments?.methods?.[method.id] || {};
            
            return (
              <div key={method.id} className="border-2 border-gray-200  rounded-xl overflow-hidden">
                <div className="p-5 ">
                  <div className="flex flex-col  md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4 ">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-600 text-white flex items-center justify-center`}>
                        <Icon className={`text-${method.color}-600 w-6 h-6`} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 dark:text-gray-100">{method.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{method.description}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <Badge variant={methodConfig.enabled ? 'success' : 'default'} size="sm">
                            {methodConfig.enabled ? 'Activé' : 'Désactivé'}
                          </Badge>
                          {methodConfig.commission && (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Commission: {methodConfig.commission}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Switch
                      checked={methodConfig.enabled || false}
                      onChange={() => updateNestedSetting('payments', 'methods', method.id, {
                        ...methodConfig,
                        enabled: !methodConfig.enabled
                      })}
                    />
                  </div>

                  {/* Configuration API pour les méthodes mobiles */}
  
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Retraits automatiques */}
      <Card className="border-2 border-green-100 ">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Wallet className="w-5 h-5 mr-2" />
            Retraits automatiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">Activer les retraits automatiques</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Les chauffeurs reçoivent automatiquement leurs gains</p>
            </div>
            <Switch
              checked={settings.payments?.autoWithdrawal?.enabled || false}
              onChange={() => updateNestedSetting('payments', 'autoWithdrawal', 'enabled', 
                !settings.payments?.autoWithdrawal?.enabled
              )}
            />
          </div>

          {settings.payments?.autoWithdrawal?.enabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Seuil minimum
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type="number"
                    min="0"
                    value={settings.payments.autoWithdrawal.threshold || 50000}
                    onChange={(e) => updateNestedSetting('payments', 'autoWithdrawal', 'threshold', 
                      parseInt(e.target.value) || 0
                    )}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 dark:bg-gray-900/40 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-green-500"
                  />
                  <span className="absolute right-3 top-3 text-gray-500 dark:text-gray-400">GNF</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Montant minimum pour déclencher un retrait</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Fréquence
                </label>
                <select
                  value={settings.payments.autoWithdrawal.schedule || 'daily'}
                  onChange={(e) => updateNestedSetting('payments', 'autoWithdrawal', 'schedule', e.target.value)}
                  className="w-full border-2 border-gray-200 dark:border-gray-800 dark:bg-gray-900/40 rounded-xl px-4 py-3 outline-none focus:border-green-500"
                >
                  <option value="daily">Quotidien (minuit)</option>
                  <option value="weekly">Hebdomadaire (dimanche)</option>
                  <option value="monthly">Mensuel (1er du mois)</option>
                  <option value="manual">Manuel seulement</option>
                </select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Frais et commissions */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Frais et commissions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(settings.pricing?.commissionRates || {}).map(([service, rate]) => (
              <div key={service} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600 text-sm font-bold">
                      {settings.services?.[service]?.icon || '🚗'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{settings.services?.[service]?.name || service}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Commission plateforme</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="0.5"
                    value={rate}
                    onChange={(e) => updateNestedSetting('pricing', 'commissionRates', service, 
                      parseFloat(e.target.value)
                    )}
                    className="w-32 h-2 bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg"
                  />
                  <span className="w-16 text-right font-bold text-purple-700">{rate}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-purple-600 mr-3" />
              <div>
                <p className="font-medium text-purple-700">Recommandations</p>
                <p className="text-sm text-purple-600 mt-1">
                  • Commission moyenne recommandée: 15-25%<br/>
                  • Réduisez les commissions pour attirer plus de chauffeurs<br/>
                  • Ajustez selon la compétition locale
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsSettings;