import React, { useRef } from 'react';
import { Upload, Download, RefreshCw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import { useBackupActions } from './backupsettings/useBackupActions';
import BackupHistoryTable from './backupsettings/BackupHistoryTable';
import BackupModals from './backupsettings/BackupModals';

const BackupSettings = ({ onExport, onImport, onReset, showToast }) => {
    const fileInputRef = useRef(null);

    const {
        backups, isLoading, isCreating, isRestoring,
        isNameModalOpen, setIsNameModalOpen, backupName, setBackupName,
        confirmAction, closeConfirmAction,
        fetchBackups, handleOpenNameModal, handleCreateBackup,
        triggerRestore, triggerDelete, triggerReset, handleConfirm,
    } = useBackupActions({ onExport, onReset, showToast });

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
        <div className="space-y-8 animate-fade-in">
            {/* Export des paramètres */}
            <Card hoverable className="border-2 border-blue-100 dark:border-blue-900/50 hover:border-blue-200 transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-blue-50/50 to-transparent dark:from-blue-900/20">
                    <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center">
                        <Download className="w-5 h-5 mr-3" />
                        Sauvegarde & Export
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border-2 border-blue-100 dark:border-blue-900/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Exporter tous les paramètres</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                                    Générez un point de restauration complet du système Taka Taka incluant les configurations de services, les clés API et les paramètres de sécurité.
                                </p>
                            </div>
                            <Button
                                variant="primary"
                                className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-500/20 h-12 px-8 min-w-[200px]"
                                icon={isCreating ? Loader2 : Download}
                                iconClassName={isCreating ? "animate-spin" : ""}
                                onClick={handleOpenNameModal}
                                disabled={isCreating}
                            >
                                {isCreating ? 'En cours...' : 'Sauvegarder maintenant'}
                            </Button>
                        </div>

                        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Configs', active: true },
                                { label: 'Services', active: true },
                                { label: 'Clés API', active: true },
                                { label: 'Sécurité', active: true }
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-slate-900 px-3 py-2 rounded-lg border border-gray-100 dark:border-gray-800">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Import des paramètres */}
            <Card hoverable className="border-2 border-green-100 dark:border-green-900/50 hover:border-green-200 transition-all duration-300 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-green-50/50 to-transparent dark:from-green-900/20">
                    <CardTitle className="text-green-800 dark:text-green-200 flex items-center">
                        <Upload className="w-5 h-5 mr-3" />
                        Importation (Restauration externe)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="p-6 bg-gradient-to-r from-blue-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border-2 border-green-100 dark:border-green-900/30">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-800 dark:text-gray-100 text-lg">Importer un fichier .JSON</h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    Chargez une sauvegarde précédemment exportée pour écraser les paramètres actuels.
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
                                    className="border-green-500 text-green-700 dark:text-green-400 h-12"
                                >
                                    Choisir un fichier
                                </Button>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl flex gap-3">
                            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                            <div className="text-xs text-amber-800 dark:text-amber-200 space-y-1">
                                <p className="font-bold uppercase tracking-wider mb-1">Attention</p>
                                <p>• L'importation remplacera tous les paramètres actuels.</p>
                                <p>• Assurez-vous que le fichier JSON est valide et provient de cette plateforme.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <BackupHistoryTable
                backups={backups}
                isLoading={isLoading}
                isRestoring={isRestoring}
                confirmAction={confirmAction}
                onRefresh={fetchBackups}
                onCreateClick={handleOpenNameModal}
                onTriggerRestore={triggerRestore}
                onTriggerDelete={triggerDelete}
            />

            {/* Réinitialisation */}
            <Card hoverable className="border-2 border-red-50 dark:border-red-900/20 hover:border-red-100 transition-all duration-300">
                <CardHeader>
                    <CardTitle className="text-red-700 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-3" />
                        Danger Zone
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h4 className="font-bold text-red-800 dark:text-red-400 text-lg">Réinitialiser aux valeurs par défaut</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Cette action supprimera toutes vos configurations personnalisées.
                                <span className="font-bold text-red-600 dark:text-red-500 italic ml-1 underline">Action irréversible.</span>
                            </p>
                        </div>
                        <Button
                            variant="danger"
                            className="bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 h-12"
                            icon={RefreshCw}
                            onClick={triggerReset}
                        >
                            Réinitialiser tout
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <BackupModals
                isNameModalOpen={isNameModalOpen}
                onCloseNameModal={() => setIsNameModalOpen(false)}
                backupName={backupName}
                onBackupNameChange={setBackupName}
                onCreateBackup={handleCreateBackup}
                confirmAction={confirmAction}
                onCloseConfirm={closeConfirmAction}
                onConfirm={handleConfirm}
            />
        </div>
    );
};

export default BackupSettings;
