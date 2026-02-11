// src/components/settings/components/SmsUssdSettings.jsx
import React, { useState } from 'react';
import { Smartphone, MessageSquare, Hash, Key, Zap, Bell } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Switch from '../ui/Switch';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';

const SmsUssdSettings = ({ settings, updateNestedSetting, showToast }) => {
  const [showApiKey, setShowApiKey] = useState(false);

  return (
    <div className="space-y-8">
      {/* Configuration SMS */}
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-800 hover:border-blue-100 transition-all duration-300">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            Service SMS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">Activer le service SMS</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Envoyer des notifications par SMS</p>
            </div>
            <Switch
              checked={settings.smsUssd?.enabled || false}
              onChange={() => updateNestedSetting('smsUssd', 'enabled', 
                !settings.smsUssd?.enabled
              )}
            />
          </div>

          {settings.smsUssd?.enabled && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Code court
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                    <input
                      type="text"
                      value={settings.smsUssd?.shortCode || '8000'}
                      onChange={(e) => updateNestedSetting('smsUssd', 'shortCode', e.target.value)}
                      className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:border-blue-500"
                      placeholder="8000"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Numéro pour recevoir les SMS</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Expéditeur (Sender ID)
                  </label>
                  <input
                    type="text"
                    value={settings.smsUssd?.senderId || 'TAKATAKA'}
                    onChange={(e) => updateNestedSetting('smsUssd', 'senderId', e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                    placeholder="TAKATAKA"
                    maxLength="11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Clé API Africa's Talking
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={settings.smsUssd?.apiKey || ''}
                    onChange={(e) => updateNestedSetting('smsUssd', 'apiKey', e.target.value)}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-10 py-3 outline-none focus:border-blue-500"
                    placeholder="Entrez votre clé API..."
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-3 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => showToast('Test', 'Envoi d\'un SMS test...', 'info')}
                >
                  Tester l'envoi SMS
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mots-clés USSD */}
      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            Mots-clés USSD
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(settings.smsUssd?.keywords || {}).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Zap className="text-green-600 w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100 capitalize">{key}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {key === 'register' ? 'Inscription' : 
                       key === 'balance' ? 'Vérification solde' : 
                       'Aide et support'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateNestedSetting('smsUssd', 'keywords', {
                      ...settings.smsUssd?.keywords,
                      [key]: e.target.value.toUpperCase()
                    })}
                    className="w-32 border-2 border-gray-200 dark:border-gray-800 rounded-lg px-3 py-2 text-center font-mono outline-none focus:border-green-500"
                    maxLength="10"
                  />
                  <Badge variant="outline">USSD</Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl">
            <p className="text-sm text-green-800">
              <strong>Note :</strong> Les utilisateurs peuvent composer *8000*CODE# pour accéder aux services.
              Exemple : *8000*REG# pour s'inscrire.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Réponses automatiques */}
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Réponses automatiques
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Message de bienvenue
            </label>
            <textarea
              value={settings.smsUssd?.autoResponse?.welcome || ''}
              onChange={(e) => updateNestedSetting('smsUssd', 'autoResponse', {
                ...settings.smsUssd?.autoResponse,
                welcome: e.target.value
              })}
              rows="3"
              className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              placeholder="Bienvenue sur Taka Taka! Envoyez REG pour vous inscrire..."
              maxLength="160"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mt-2">
              <span>SMS standard (160 caractères max)</span>
              <span>{settings.smsUssd?.autoResponse?.welcome?.length || 0}/160</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Réponse solde
            </label>
            <textarea
              value={settings.smsUssd?.autoResponse?.balance || ''}
              onChange={(e) => updateNestedSetting('smsUssd', 'autoResponse', {
                ...settings.smsUssd?.autoResponse,
                balance: e.target.value
              })}
              rows="3"
              className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              placeholder="Votre solde est de {balance} GNF. Merci d'utiliser Taka Taka!"
            />
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Utilisez {'{balance}'} pour insérer le solde de l'utilisateur
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Réponse aide
            </label>
            <textarea
              value={settings.smsUssd?.autoResponse?.help || ''}
              onChange={(e) => updateNestedSetting('smsUssd', 'autoResponse', {
                ...settings.smsUssd?.autoResponse,
                help: e.target.value
              })}
              rows="3"
              className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              placeholder="Taka Taka - Service de transport. Commandez un véhicule en envoyant RIDE au 8000. Support: +224 XXX XX XX"
            />
          </div>
        </CardContent>
      </Card>

      {/* Tarification SMS */}
      <Card className="border-2 border-orange-100 bg-gradient-to-r from-orange-50 to-yellow-50">
        <CardHeader>
          <CardTitle className="text-orange-800 flex items-center">
            <Smartphone className="w-5 h-5 mr-2" />
            Tarification SMS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Coût par SMS (GNF)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  value={settings.smsUssd?.costPerSms || 50}
                  onChange={(e) => updateNestedSetting('smsUssd', 'costPerSms', 
                    parseInt(e.target.value) || 0
                  )}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                />
                <span className="ml-3 text-gray-600 dark:text-gray-300">GNF</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Coût facturé par le fournisseur</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Limite quotidienne
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="1"
                  value={settings.smsUssd?.dailyLimit || 10}
                  onChange={(e) => updateNestedSetting('smsUssd', 'dailyLimit', 
                    parseInt(e.target.value) || 10
                  )}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-orange-500"
                />
                <span className="ml-3 text-gray-600 dark:text-gray-300">SMS/jour</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Par utilisateur</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-xl border border-orange-200">
            <h4 className="font-medium text-gray-800 dark:text-gray-100 mb-2">Simulation de coûts</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">1000 utilisateurs actifs :</span>
                <span className="font-bold text-orange-700">
                  {((settings.smsUssd?.costPerSms || 50) * 1000).toLocaleString()} GNF/mois
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Notifications quotidiennes :</span>
                <span className="font-bold text-orange-700">
                  {((settings.smsUssd?.costPerSms || 50) * 1000 * 30).toLocaleString()} GNF/mois
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmsUssdSettings;