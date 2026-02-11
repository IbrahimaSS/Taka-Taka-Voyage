import React, { useState } from 'react';
import { Bell, Shield, Car, Globe, CreditCard, Phone, Moon, Sun, Lock, Smartphone, Volume2, VolumeX, Eye, EyeOff } from 'lucide-react';

// Composants réutilisables
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Button from '../admin/ui/Bttn';
import Switch from '../admin/ui/Switch';
import Badge from '../admin/ui/Badge';
import ConfirmModal from '../admin/ui/ConfirmModal';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      tripUpdates: true,
      promotions: true,
      sms: false,
    },
    privacy: {
      publicProfile: true,
      locationSharing: false,
      anonymousHistory: false,
    },
    preferences: {
      vehicle: 'taxi',
      language: 'fr',
      paymentMethod: 'mobile_money',
      contactPreference: 'call',
    },
    theme: 'light',
    sound: true,
  });

  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [resetKey, setResetKey] = useState(0);

  const languages = [
    { code: 'fr', name: 'Français' },
    { code: 'en', name: 'Anglais' },
    { code: 'ln', name: 'Pular' },
    { code: 'sw', name: 'Soussou' },
    { code: 'ml', name: 'Malinké' },
  ];

  const vehicles = [
    { value: 'moto', label: 'Moto-taxi' },
    { value: 'taxi', label: 'Taxi' },
    { value: 'voiture', label: 'Voiture privée' },
    { value: 'any', label: 'Peu importe' },
  ];

  const paymentMethods = [
    { value: 'mobile_money', label: 'Mobile Money' },
    { value: 'wallet', label: 'Portefeuille Taka Taka' },
    { value: 'cash', label: 'Espèces' },
    { value: 'card', label: 'Carte bancaire' },
  ];

  const contactPreferences = [
    { value: 'call', label: 'Appel uniquement' },
    { value: 'message', label: 'Message uniquement' },
    { value: 'both', label: 'Appel ou message' },
    { value: 'none', label: 'Pas de contact' },
  ];

  const toggleSetting = (category, key) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const updatePreference = (key, value) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const handleSave = () => {
    // Simuler l'enregistrement des paramètres
    console.log('Paramètres sauvegardés:', settings);
    setShowSaveConfirm(false);
    // Afficher une notification de succès
  };

  const handleCancel = () => {
    // Réinitialiser les paramètres
    setResetKey(prev => prev + 1);
    setShowCancelConfirm(false);
  };

  const handleDeleteAccount = () => {
    // Logique de suppression de compte
    console.log('Compte supprimé');
    setShowDeleteAccount(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Paramètres principaux */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Paramètres du compte</h2>
          <Badge variant="info" size="sm">Version 1.0</Badge>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Bell className="w-6 h-6 text-green-600 dark:text-green-500 mr-3" />
                <CardTitle>Notifications</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Notifications de trajet</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recevoir des notifications sur l'état de vos trajets</p>
                </div>
                <Switch
                  checked={settings.notifications.tripUpdates}
                  onChange={() => toggleSetting('notifications', 'tripUpdates')}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Notifications promotionnelles</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recevoir des offres spéciales et promotions</p>
                </div>
                <Switch
                  checked={settings.notifications.promotions}
                  onChange={() => toggleSetting('notifications', 'promotions')}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Notifications par SMS</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recevoir des notifications par SMS</p>
                </div>
                <Switch
                  checked={settings.notifications.sms}
                  onChange={() => toggleSetting('notifications', 'sms')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Confidentialité */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-blue-600 dark:text-blue-500 mr-3" />
                <CardTitle>Confidentialité</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Profil public</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Permettre aux autres de voir votre profil</p>
                </div>
                <Switch
                  checked={settings.privacy.publicProfile}
                  onChange={() => toggleSetting('privacy', 'publicProfile')}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Partage de position</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Partager votre position en temps réel</p>
                </div>
                <Switch
                  checked={settings.privacy.locationSharing}
                  onChange={() => toggleSetting('privacy', 'locationSharing')}
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">Historique anonyme</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Ne pas enregistrer l'historique des trajets</p>
                </div>
                <Switch
                  checked={settings.privacy.anonymousHistory}
                  onChange={() => toggleSetting('privacy', 'anonymousHistory')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Préférences de trajet */}
          <Card>
            <CardHeader>
              <div className="flex items-center">
                <Car className="w-6 h-6 text-green-600 dark:text-green-500 mr-3" />
                <CardTitle>Préférences de trajet</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Véhicule préféré</label>
                  <select
                    key={`vehicle-${resetKey}`}
                    value={settings.preferences.vehicle}
                    onChange={(e) => updatePreference('vehicle', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                  >
                    {vehicles.map(vehicle => (
                      <option key={vehicle.value} value={vehicle.value} className="dark:bg-gray-800">{vehicle.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Langue préférée</label>
                  <select
                    key={`language-${resetKey}`}
                    value={settings.preferences.language}
                    onChange={(e) => updatePreference('language', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                  >
                    {languages.map(lang => (
                      <option key={lang.code} value={lang.code} className="dark:bg-gray-800">{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Moyen de paiement par défaut</label>
                  <select
                    key={`payment-${resetKey}`}
                    value={settings.preferences.paymentMethod}
                    onChange={(e) => updatePreference('paymentMethod', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                  >
                    {paymentMethods.map(method => (
                      <option key={method.value} value={method.value} className="dark:bg-gray-800">{method.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Contact préféré</label>
                  <select
                    key={`contact-${resetKey}`}
                    value={settings.preferences.contactPreference}
                    onChange={(e) => updatePreference('contactPreference', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition"
                  >
                    {contactPreferences.map(pref => (
                      <option key={pref.value} value={pref.value} className="dark:bg-gray-800">{pref.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Boutons de sauvegarde */}
          <Card>
            <CardFooter align="between">
              <Button
                variant="danger"
                onClick={() => setShowDeleteAccount(true)}
              >
                Supprimer le compte
              </Button>
              <div className="flex space-x-4">
                <Button
                  variant="secondary"
                  onClick={() => setShowCancelConfirm(true)}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setShowSaveConfirm(true)}
                >
                  Sauvegarder les modifications
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle>Apparence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Mode sombre</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Activer l'interface sombre</p>
              </div>
              <Switch
                checked={settings.theme === 'dark'}
                onChange={() => setSettings(prev => ({
                  ...prev,
                  theme: prev.theme === 'light' ? 'dark' : 'light'
                }))}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Sons</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Activer les sons de l'application</p>
              </div>
              <Switch
                checked={settings.sound}
                onChange={() => setSettings(prev => ({ ...prev, sound: !prev.sound }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* À propos */}
        <Card>
          <CardHeader>
            <CardTitle>À propos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 rounded-xl border border-green-100 dark:border-green-800/30 shadow-sm">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Taka Taka Version 1.0</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Build 2024.12.01</p>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                <p className="font-medium text-gray-900 dark:text-gray-100">Politique de confidentialité</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Comment nous protégeons vos données</p>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                <p className="font-medium text-gray-900 dark:text-gray-100">Conditions d'utilisation</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Règles et conditions du service</p>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                <p className="font-medium text-gray-900 dark:text-gray-100">Centre d'aide</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">FAQ et support technique</p>
              </button>
              <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors">
                <p className="font-medium text-gray-900 dark:text-gray-100">Mentions légales</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Informations légales</p>
              </button>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">© 2025 Taka Taka. Tous droits réservés.</p>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">Conforme aux spécifications</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals de confirmation */}
      <ConfirmModal
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={handleSave}
        title="Sauvegarder les modifications"
        message="Voulez-vous sauvegarder tous les changements apportés à vos paramètres ?"
        type="info"
        confirmText="Sauvegarder"
        cancelText="Annuler"
      />

      <ConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
        title="Annuler les modifications"
        message="Tous les changements non sauvegardés seront perdus. Continuer ?"
        type="warning"
        confirmText="Oui, annuler"
        cancelText="Non, garder"
      />

      <ConfirmModal
        isOpen={showDeleteAccount}
        onClose={() => setShowDeleteAccount(false)}
        onConfirm={handleDeleteAccount}
        title="Supprimer le compte"
        message="Êtes-vous sûr de vouloir supprimer définitivement votre compte ? Cette action est irréversible."
        type="delete"
        confirmText="Supprimer définitivement"
        cancelText="Annuler"
        destructive={true}
        showComment={true}
        commentLabel="Raison de la suppression (optionnel)"
        commentPlaceholder="Pourquoi souhaitez-vous supprimer votre compte ?"
      />
    </div>
  );
};

export default Settings;