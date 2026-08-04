import { useTranslation } from 'react-i18next';
import { Database, Server, CheckCircle, XCircle, RefreshCw, Shield, Cpu, AlertTriangle } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Switch from '../../ui/Switch';
import Button from '../../ui/Bttn';

const MonitoringTab = ({ settings, updateNestedSetting, showToast, onTestSecurity, onGenerateReport }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-800 flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Journalisation (Logging)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('security.logging_level') || 'Niveau de journalisation'}
            </label>
            <select
              value={settings.security?.logging?.level || 'info'}
              onChange={(e) => updateNestedSetting('security', 'logging', 'level', e.target.value)}
              className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="error">{t('security.log_error') || 'Erreurs seulement'}</option>
              <option value="warn">{t('security.log_warn') || 'Avertissements et erreurs'}</option>
              <option value="info">{t('security.log_info') || 'Informations (recommandé)'}</option>
              <option value="debug">{t('security.log_debug') || 'Débogage (détaillé)'}</option>
              <option value="trace">{t('security.log_trace') || 'Trace (très détaillé)'}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              {t('security.log_retention') || 'Conservation des logs'}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('security.app_logs') || "Logs d'application"}</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.security?.logging?.retentionDays || 30}
                    onChange={(e) => updateNestedSetting('security', 'logging', 'retentionDays',
                      parseInt(e.target.value) || 30
                    )}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">jours</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('security.audit_logs') || "Logs d'audit"}</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="30"
                    max="1095"
                    value={settings.security?.logging?.auditRetentionDays || 365}
                    onChange={(e) => updateNestedSetting('security', 'logging', 'auditRetentionDays',
                      parseInt(e.target.value) || 365
                    )}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">jours</span>
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-600 dark:text-gray-300 mb-1">{t('security.security_logs') || 'Logs de sécurité'}</label>
                <div className="flex items-center">
                  <input
                    type="number"
                    min="90"
                    max="1825"
                    value={settings.security?.logging?.securityRetentionDays || 730}
                    onChange={(e) => updateNestedSetting('security', 'logging', 'securityRetentionDays',
                      parseInt(e.target.value) || 730
                    )}
                    className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 outline-none focus:border-blue-500"
                  />
                  <span className="ml-2 text-gray-600 dark:text-gray-300">jours</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.log_login_attempts') || 'Journaliser les tentatives de connexion'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.log_login_attempts_desc') || "Suivre toutes les tentatives (réussies et échouées)"}</p>
              </div>
              <Switch
                checked={settings.security?.logging?.logLoginAttempts || true}
                onChange={() => updateNestedSetting('security', 'logging', 'logLoginAttempts',
                  !settings.security?.logging?.logLoginAttempts
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.log_sensitive_changes') || 'Journaliser les modifications sensibles'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.log_sensitive_changes_desc') || 'Changements de paramètres, permissions, etc.'}</p>
              </div>
              <Switch
                checked={settings.security?.logging?.logSensitiveChanges || true}
                onChange={() => updateNestedSetting('security', 'logging', 'logSensitiveChanges',
                  !settings.security?.logging?.logSensitiveChanges
                )}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100">{t('security.real_time_alerts') || 'Alertes en temps réel'}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{t('security.real_time_alerts_desc') || 'Notifications pour événements de sécurité'}</p>
              </div>
              <Switch
                checked={settings.security?.monitoring?.realTimeAlerts || false}
                onChange={() => updateNestedSetting('security', 'monitoring', 'realTimeAlerts',
                  !settings.security?.monitoring?.realTimeAlerts
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 border-green-100">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center">
            <Server className="w-5 h-5 mr-2" />
            Monitoring de sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{t('security.auto_checks') || 'Vérifications automatiques'}</h4>
              <div className="space-y-3">
                {[
                  { id: 'ssl', label: 'Certificat SSL', enabled: true },
                  { id: 'headers', label: 'En-têtes de sécurité', enabled: true },
                  { id: 'dependencies', label: 'Dépendances vulnérables', enabled: true },
                  { id: 'backups', label: 'Sauvegardes récentes', enabled: false },
                  { id: 'firewall', label: 'État du firewall', enabled: false },
                  { id: 'intrusion', label: 'Détection d\'intrusion', enabled: false }
                ].map(check => (
                  <div key={check.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 dark:text-gray-200">{t(`security.check_${check.id}`) || check.label}</span>
                    <div className="flex items-center space-x-2">
                      {check.enabled ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-xs text-green-600">{t('common.active') || 'Activé'}</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="text-xs text-gray-500 dark:text-gray-400">{t('common.inactive') || 'Désactivé'}</span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-4">{t('security.monitoring_actions') || 'Actions de monitoring'}</h4>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={RefreshCw}
                  onClick={() => onTestSecurity('SSL/TLS')}
                >
                  Vérifier le certificat SSL
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={Shield}
                  onClick={() => onTestSecurity('en-têtes de sécurité')}
                >
                  Analyser les en-têtes HTTP
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  icon={Cpu}
                  onClick={() => onGenerateReport()}
                >
                  Générer un rapport de sécurité
                </Button>

                <Button
                  variant="danger"
                  className="w-full justify-start"
                  icon={AlertTriangle}
                  onClick={() => showToast('Alerte', 'Scan de vulnérabilités lancé', 'warning')}
                >
                  Scanner les vulnérabilités
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-teal-50 rounded-xl border border-green-200">
            <div className="flex items-center">
              <Shield className="w-5 h-5 text-green-600 mr-3 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-700">{t('security.recommendations_title') || 'Recommandations de sécurité'}</p>
                <ul className="text-sm text-green-600 mt-2 space-y-1">
                  <li>• {t('security.rec_weekly_scans') || 'Effectuez des scans de sécurité hebdomadaires'}</li>
                  <li>• {t('security.rec_update_deps') || 'Maintenez les dépendances à jour'}</li>
                  <li>• {t('security.rec_monitor_login') || 'Surveillez les tentatives de connexion suspectes'}</li>
                  <li>• {t('security.rec_critical_alerts') || 'Configurez des alertes pour les événements critiques'}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonitoringTab;
