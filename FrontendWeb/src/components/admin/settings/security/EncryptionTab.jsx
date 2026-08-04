import { useTranslation } from 'react-i18next';
import { Key, Hash } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Switch from '../../ui/Switch';
import Badge from '../../ui/Badge';
import Slider from '../../ui/Slider';
import Button from '../../ui/Bttn';

const EncryptionTab = ({ settings, updateNestedSetting, showToast, showSecret, onToggleKeyVisibility }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-purple-100">
        <CardHeader>
          <CardTitle className="text-purple-800 flex items-center">
            <Key className="w-5 h-5 mr-2" />
            Chiffrement des données
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.encryption_at_rest') || 'Chiffrement au repos'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.encryption_at_rest_desc') || 'Chiffrer les données sensibles dans la base de données'}</p>
            </div>
            <Switch
              checked={settings.security?.encryption?.atRest || true}
              onChange={() => updateNestedSetting('security', 'encryption', 'atRest',
                !settings.security?.encryption?.atRest
              )}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.encryption_in_transit') || 'Chiffrement en transit'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.encryption_in_transit_desc') || 'Forcer HTTPS/TLS pour toutes les communications'}</p>
            </div>
            <Badge variant="success">{t('security.always_enabled') || 'Toujours activé'}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.encryption_algorithm') || 'Algorithme de chiffrement'}
              </label>
              <select
                value={settings.security?.encryption?.algorithm || 'aes-256-gcm'}
                onChange={(e) => updateNestedSetting('security', 'encryption', 'algorithm', e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              >
                <option value="aes-128-gcm">AES-128-GCM</option>
                <option value="aes-256-gcm">AES-256-GCM (recommandé)</option>
                <option value="chacha20-poly1305">ChaCha20-Poly1305</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.key_rotation') || 'Rotation des clés'}
              </label>
              <select
                value={settings.security?.encryption?.keyRotation || '90'}
                onChange={(e) => updateNestedSetting('security', 'encryption', 'keyRotation', e.target.value)}
                className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-purple-500"
              >
                <option value="30">30 jours</option>
                <option value="60">60 jours</option>
                <option value="90">90 jours (recommandé)</option>
                <option value="180">6 mois</option>
                <option value="365">1 an</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('security.sensitive_data_encrypt') || 'Données sensibles à chiffrer'}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { id: 'passwords', label: 'Mots de passe', default: true },
                { id: 'api_keys', label: 'Clés API', default: true },
                { id: 'payment_info', label: 'Informations de paiement', default: true },
                { id: 'personal_data', label: 'Données personnelles', default: true },
                { id: 'messages', label: 'Messages', default: false },
                { id: 'location', label: 'Localisation', default: false }
              ].map(item => (
                <label key={item.id} className="flex items-center space-x-2 p-3 border-2 border-gray-200 dark:border-gray-800 rounded-xl cursor-pointer hover:border-purple-300">
                  <input
                    type="checkbox"
                    checked={settings.security?.encryption?.sensitiveFields?.includes(item.id) || item.default}
                    onChange={(e) => {
                      const fields = settings.security?.encryption?.sensitiveFields || [];
                      if (e.target.checked) {
                        updateNestedSetting('security', 'encryption', 'sensitiveFields', [...fields, item.id]);
                      } else {
                        updateNestedSetting('security', 'encryption', 'sensitiveFields', fields.filter(f => f !== item.id));
                      }
                    }}
                    className="rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-200">{t(`security.data_${item.id}`) || item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">{t('security.master_encryption_key') || 'Clé de chiffrement principale'}</h4>
            <div className="flex items-center space-x-3">
              <div className="flex-1 bg-white dark:bg-gray-900 border-2 border-purple-200 rounded-xl px-4 py-3">
                <code className="text-gray-800 dark:text-gray-100 font-mono text-sm truncate">
                  {showSecret.masterKey ? 'enc_key_' + Array.from({ length: 32 }, () => Math.random().toString(36)[2]).join('') : '••••••••••••••••••••••••••••••••'}
                </code>
              </div>
              <button
                onClick={() => onToggleKeyVisibility('masterKey')}
                className="px-3 py-2 border-2 border-purple-300 rounded-xl text-purple-700 hover:bg-purple-50"
              >
                {showSecret.masterKey ? t('common.hide') || 'Masquer' : t('common.view') || 'Afficher'}
              </button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => showToast('Alerte', 'Regénération de la clé principale', 'warning')}
              >
                {t('common.regenerate') || 'Regénérer'}
              </Button>
            </div>
            <p className="text-sm text-purple-600 mt-2">
              ⚠️ {t('security.master_key_warn') || 'La regénération de cette clé rendra toutes les données chiffrées illisibles sans backup'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Hash className="w-5 h-5 mr-2" />
            {t('security.pwd_hashing_title') || 'Hashing des mots de passe'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('security.hashing_algorithm') || 'Algorithme de hachage'}
            </label>
            <select
              value={settings.security?.hashing?.algorithm || 'bcrypt'}
              onChange={(e) => updateNestedSetting('security', 'hashing', 'algorithm', e.target.value)}
              className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="bcrypt">BCrypt ({t('common.recommended') || 'recommandé'})</option>
              <option value="argon2">Argon2</option>
              <option value="pbkdf2">PBKDF2</option>
              <option value="scrypt">Scrypt</option>
            </select>
          </div>

          {settings.security?.hashing?.algorithm === 'bcrypt' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('security.hashing_cost') || 'Coût de hachage (rounds)'}
              </label>
              <div className="flex items-center space-x-4">
                <Slider
                  min="10"
                  max="15"
                  step="1"
                  value={settings.security.hashing.costFactor || 12}
                  onChange={(value) => updateNestedSetting('security', 'hashing', 'costFactor', value)}
                />
                <span className="w-16 text-right font-bold text-blue-700">
                  2^{settings.security.hashing.costFactor || 12}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Coût plus élevé = plus sécurisé mais plus lent (12 est recommandé)
              </p>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.unique_salt') || 'Sel unique par utilisateur'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.unique_salt_desc') || 'Générer un sel différent pour chaque mot de passe'}</p>
            </div>
            <Badge variant="success">{t('security.always_enabled') || 'Toujours activé'}</Badge>
          </div>

          <div className="p-4 bg-gradient-to-r from-blue-50 to-teal-50 rounded-xl border border-blue-200">
            <div className="flex items-center">
              <Key className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-blue-700">{t('security.hashing_best_practices') || 'Bonnes pratiques de hachage'}</p>
                <ul className="text-sm text-blue-600 mt-2 space-y-1">
                  <li>• {t('security.rec_bcrypt_12') || "Utilisez BCrypt avec un coût d'au moins 12"}</li>
                  <li>• {t('security.rec_no_plaintext') || 'Ne stockez jamais les mots de passe en clair'}</li>
                  <li>• {t('security.rec_unique_salts') || 'Utilisez des sels uniques pour chaque utilisateur'}</li>
                  <li>• {t('security.rec_update_algos') || 'Mettez à jour les algorithmes obsolètes régulièrement'}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncryptionTab;
