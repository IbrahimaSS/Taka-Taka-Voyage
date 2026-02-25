// src/components/settings/components/BackupSettings.jsx
// pour l'export/import et la réinitialisation.
import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Download, RefreshCw, Database, History } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';

const BackupSettings = ({ onExport, onImport, onReset, showToast }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onImport(file);
        }
    };

    return (
        <div className="space-y-8">
            {/* Export des paramètres */}
            <Card hoverable className="border-2 border-blue-100 hover:border-blue-200 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-blue-800 flex items-center">
                        <Download className="w-5 h-5 mr-2" />
                        {t('settings.export_settings')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-blue-900 dark:to-teal-900 rounded-xl border-2 border-blue-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('settings.export_all')}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {t('settings.export_desc')}
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                className="bg-gradient-to-r from-blue-700 to-teal-700"
                                icon={Download}
                                onClick={onExport}
                            >
                                {t('common.export_now')}
                            </Button>
                        </div>

                        <div className="mt-6 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                            <h5 className="font-medium text-gray-800 dark:text-gray-100 mb-2">{t('settings.included_info')}</h5>
                            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                <li>• {t('settings.inc_general')}</li>
                                <li>• {t('settings.inc_services')}</li>
                                <li>• {t('settings.inc_notifications')}</li>
                                <li>• {t('settings.inc_api')}</li>
                                <li>• {t('settings.inc_security')}</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Import des paramètres */}
            <Card hoverable className="border-2 border-green-100 hover:border-green-200 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-green-800 flex items-center">
                        <Upload className="w-5 h-5 mr-2" />
                        {t('settings.import_settings')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900 dark:to-teal-900 rounded-xl border-2 border-green-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('settings.import_now')}</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                                    {t('settings.import_desc')}
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".json"
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    icon={Upload}
                                    onClick={handleImportClick}
                                >
                                    {t('common.choose_file')}
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h5 className="font-medium text-yellow-800 mb-2">⚠️ {t('common.warning')}</h5>
                            <ul className="text-sm text-yellow-700 space-y-1">
                                <li>• {t('settings.import_warn_replace')}</li>
                                <li>• {t('settings.import_warn_backup')}</li>
                                <li>• {t('settings.import_warn_format')}</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Réinitialisation */}
            <Card hoverable className="border-2 border-red-100 hover:border-red-200 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-red-800 flex items-center">
                        <RefreshCw className="w-5 h-5 mr-2" />
                        {t('common.reset')}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-500/40 dark:to-orange-500/40 rounded-xl border-2 border-red-200">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h4 className="font-bold text-gray-800 dark:text-gray-100">{t('settings.reset_default')}</h4>
                                <p className="text-sm text-red-600 mt-1">
                                    {t('settings.reset_warn_irreversible')}
                                </p>
                            </div>
                            <Button
                                varaint="danger"
                                icon={RefreshCw}
                                onClick={() => {
                                    if (window.confirm(t('settings.reset_confirm_msg'))) {
                                        onReset();
                                    }
                                }}
                            >
                                {t('common.reset_btn')}
                            </Button>
                        </div>

                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <h6 className="font-medium text-gray-800 dark:text-gray-100 mb-2">{t('settings.kept_info')}</h6>
                                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    <li>• {t('settings.kept_users')}</li>
                                    <li>• {t('settings.kept_history')}</li>
                                    <li>• {t('settings.kept_finances')}</li>
                                </ul>
                            </div>
                            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                                <h6 className="font-medium text-gray-800 dark:text-gray-100 mb-2">{t('settings.reset_info')}</h6>
                                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    <li>• {t('settings.reset_config')}</li>
                                    <li>• {t('settings.reset_api')}</li>
                                    <li>• {t('settings.reset_notifications')}</li>
                                    <li>• {t('settings.reset_security')}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Historique des sauvegardes */}
            <Card className="border-2 border-gray-100 dark:border-gray-800">
                <CardHeader>
                    <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center">
                        <History className="w-5 h-5 mr-2" />
                        {t('settings.backup_history')}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-12">
                        <Database className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">{t('settings.no_backup')}</p>
                        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                            {t('settings.auto_backup_soon')}
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default BackupSettings;