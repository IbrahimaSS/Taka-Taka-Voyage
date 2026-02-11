// src/components/profile/components/SecuritySettings.jsx
import React, { useState } from 'react';
import { Shield, Bell, Smartphone, Key, Eye, EyeOff } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import Switch from '../ui/Switch';
import Button from '../ui/Bttn';

const SecuritySettings = ({ onPasswordChange, isSaving }) => {
  const [security, setSecurity] = useState({
    twoFactorAuth: true,
    loginAlerts: true,
    deviceManagement: true
  });

  const [passwords, setPasswords] = useState({
    motDePasseActuel: '',
    nouveauMotDePasse: '',
    confirmationMotDePasse: ''
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleSecurityChange = (key) => {
    setSecurity(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onPasswordChange) {
      onPasswordChange(passwords);
      // Reset fields on submit (optional, but good for security)
      setPasswords({
        motDePasseActuel: '',
        nouveauMotDePasse: '',
        confirmationMotDePasse: ''
      });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card hoverable className="border-2 border-gray-100 dark:border-gray-900 hover:border-red-100 transition-all duration-300">
        <CardHeader>
          <CardTitle>Sécurité du compte</CardTitle>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Protégez votre compte avec ces fonctionnalités</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            {
              key: 'twoFactorAuth',
              label: 'Authentification à deux facteurs',
              description: 'Ajoutez une couche de sécurité supplémentaire à votre compte',
              icon: Shield,
              recommended: true
            },
            {
              key: 'loginAlerts',
              label: 'Alertes de connexion',
              description: 'Recevez des notifications pour les nouvelles connexions',
              icon: Bell,
              recommended: true
            },

          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 border-2 border-gray-100 dark:border-gray-900 rounded-xl hover:border-gray-200 dark:border-gray-900 transition-all">
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl ${item.recommended ? 'bg-red-100' : 'bg-gray-100 dark:bg-gray-800'} flex items-center justify-center`}>
                  <item.icon className={`${item.recommended ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'} w-6 h-6`} />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-gray-800 dark:text-gray-100">{item.label}</p>
                    {item.recommended && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                        Recommandé
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                </div>
              </div>
              <Switch
                checked={security[item.key]}
                onChange={() => handleSecurityChange(item.key)}
                size="lg"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card hoverable className="border-2 border-gray-100 dark:border-gray-900 hover:border-blue-100 transition-all duration-300">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Changer votre mot de passe</CardTitle>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Mettez à jour votre mot de passe régulièrement</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Mot de passe actuel
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="motDePasseActuel"
                    value={passwords.motDePasseActuel}
                    onChange={handlePasswordInputChange}
                    className="w-full border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-900 rounded-xl pl-10 pr-10 py-3 outline-none focus:border-blue-400 transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3.5 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Nouveau mot de passe
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="nouveauMotDePasse"
                    value={passwords.nouveauMotDePasse}
                    onChange={handlePasswordInputChange}
                    className="w-full border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-900 rounded-xl pl-10 pr-10 py-3 outline-none focus:border-blue-400 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Minimum 8 caractères avec majuscules, minuscules et chiffres</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 text-gray-400 dark:text-gray-500 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmationMotDePasse"
                    value={passwords.confirmationMotDePasse}
                    onChange={handlePasswordInputChange}
                    className="w-full border-2 border-gray-200 dark:bg-gray-800 dark:border-gray-900 rounded-xl pl-10 pr-10 py-3 outline-none focus:border-blue-400 transition-all"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              variant="perso"
              icon={Key}
              fullWidth
              loading={isSaving}
              disabled={isSaving}
            >
              Mettre à jour le mot de passe
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default SecuritySettings;