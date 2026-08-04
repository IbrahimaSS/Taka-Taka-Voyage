import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Button from '../../ui/Bttn';

const SecurityAlertsCard = ({ settings, updateNestedSetting, onTestSecurity }) => {
  const { t } = useTranslation();

  return (
    <Card className="border-2 border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="text-red-800 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {t('security.security_alerts_title') || 'Alertes de sécurité'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {!settings.security?.authentication?.twoFactorEnabled && (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-red-300">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.alert_2fa_disabled') || 'Authentification à deux facteurs désactivée'}</p>
                  <p className="text-sm text-red-600">{t('security.alert_2fa_desc') || 'Activez la 2FA pour les comptes administrateurs'}</p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => updateNestedSetting('security', 'authentication', 'twoFactorEnabled', true)}
              >
                {t('common.activate') || 'Activer'}
              </Button>
            </div>
          )}

          {!settings.security?.rateLimiting?.enabled && (
            <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-red-300">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.alert_rate_limit_disabled') || 'Limitation de requêtes désactivée'}</p>
                  <p className="text-sm text-red-600">{t('security.alert_rate_limit_desc') || 'Votre API est vulnérable aux attaques par force brute'}</p>
                </div>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => updateNestedSetting('security', 'rateLimiting', 'enabled', true)}
              >
                {t('common.activate') || 'Activer'}
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border border-yellow-300">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.alert_old_audit') || 'Dernier audit de sécurité : il y a 30 jours'}</p>
                <p className="text-sm text-yellow-600">{t('security.alert_audit_rec') || 'Effectuez un audit complet chaque semaine'}</p>
              </div>
            </div>
            <Button
              variant="warning"
              size="sm"
              onClick={() => onTestSecurity('audit complet')}
            >
              {t('security.launch_audit_btn') || 'Lancer un audit'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecurityAlertsCard;
