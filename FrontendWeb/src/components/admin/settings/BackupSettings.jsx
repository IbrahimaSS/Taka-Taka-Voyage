import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, Download, RefreshCw, Database, History, Trash2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Modal from '../ui/Modal';
import { adminService } from '../../../services/adminService';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BackupSettings = ({ onExport, onImport, onReset, showToast }) => {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);

    // États pour les données
    const [backups, setBackups] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isRestoring, setIsRestoring] = useState(false);

    // États pour les modals personnalisés
    const [isNameModalOpen, setIsNameModalOpen] = useState(false);
    const [backupName, setBackupName] = useState("");
    const [confirmAction, setConfirmAction] = useState({ open: false, type: '', id: '', nom: '' });

    const fetchBackups = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await adminService.getBackups();
            if (response.data.succes) {
                setBackups(response.data.backups);
            }
        } catch (error) {
            console.error('Erreur chargement backups:', error);
            showToast('Erreur', 'Impossible de récupérer l\'historique des sauvegardes', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchBackups();
    }, [fetchBackups]);

    const handleOpenNameModal = () => {
        setBackupName(`Sauvegarde_${new Date().toISOString().split('T')[0]}_${new Date().getHours()}h${new Date().getMinutes()}`);
        setIsNameModalOpen(true);
    };

    const handleCreateBackup = async () => {
        setIsNameModalOpen(false);
        setIsCreating(true);
        try {
            const response = await adminService.createBackup(backupName || "Sauvegarde manuelle");
            if (response.data.succes) {
                showToast('Succès', 'Point de restauration créé avec succès sur le serveur', 'success');
                fetchBackups();
                // On garde l'export local optionnel
                if (onExport) onExport();
            }
        } catch (error) {
            showToast('Erreur', 'Échec de la sauvegarde serveur', 'error');
        } finally {
            setIsCreating(false);
        }
    };

    const triggerRestore = (id, nom) => {
        setConfirmAction({
            open: true,
            type: 'restore',
            id,
            nom
        });
    };

    const triggerDelete = (id, nom) => {
        setConfirmAction({
            open: true,
            type: 'delete',
            id,
            nom
        });
    };

    const handleConfirmAction = async () => {
        const { type, id } = confirmAction;
        setConfirmAction({ ...confirmAction, open: false });

        if (type === 'restore') {
            setIsRestoring(true);
            try {
                const response = await adminService.restoreBackup(id);
                if (response.data.succes) {
                    showToast('Restauré ✅', 'Les paramètres système ont été restaurés', 'success');
                    setTimeout(() => window.location.reload(), 1500);
                }
            } catch (error) {
                showToast('Erreur', 'Impossible de restaurer cette sauvegarde', 'error');
                setIsRestoring(false);
            }
        } else if (type === 'delete') {
            try {
                const response = await adminService.deleteBackup(id);
                if (response.data.succes) {
                    showToast('Supprimé', 'Sauvegarde effacée définitivement', 'info');
                    setBackups(prev => prev.filter(b => b._id !== id));
                }
            } catch (error) {
                showToast('Erreur', 'Suppression impossible', 'error');
            }
        }
    };

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

            {/* Historique des sauvegardes */}
            <Card className="border-2 border-gray-100 dark:border-gray-800 shadow-lg overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-gray-800 dark:text-gray-100 flex items-center">
                            <History className="w-5 h-5 mr-3" />
                            Historique des sauvegardes serveurs
                        </CardTitle>
                        <Button
                            variant="ghost"
                            size="sm"
                            icon={isLoading ? Loader2 : RefreshCw}
                            iconClassName={isLoading ? "animate-spin" : ""}
                            onClick={fetchBackups}
                        >
                            Actualiser
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                            <p className="text-gray-500 dark:text-gray-400 animate-pulse">Chargement de l'historique...</p>
                        </div>
                    ) : backups.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 dark:bg-slate-900/50 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4">Nom de la sauvegarde</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4 text-center">Type</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {backups.map((backup) => (
                                        <tr key={backup._id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
                                                        <Database className="w-4 h-4 text-blue-500" />
                                                    </div>
                                                    <span className="font-semibold text-gray-800 dark:text-gray-200">{backup.nom}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                {format(new Date(backup.createdAt), 'dd MMMM yyyy HH:mm', { locale: fr })}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${backup.type === 'AUTOMATIQUE'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                    }`}>
                                                    {backup.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => triggerRestore(backup._id, backup.nom)}
                                                        className="p-2.5 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl transition-all hover:scale-110"
                                                        title="Restaurer"
                                                        disabled={isRestoring}
                                                    >
                                                        <RefreshCw className={`w-4 h-4 ${isRestoring && confirmAction.id === backup._id ? 'animate-spin' : ''}`} />
                                                    </button>
                                                    <button
                                                        onClick={() => triggerDelete(backup._id, backup.nom)}
                                                        className="p-2.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl transition-all hover:scale-110"
                                                        title="Supprimer"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-24 px-6">
                            <div className="w-20 h-20 bg-gray-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                                <Database className="w-10 h-10 text-gray-300 dark:text-gray-700" />
                            </div>
                            <h5 className="font-bold text-gray-800 dark:text-gray-100 text-lg mb-2">Aucune sauvegarde locale</h5>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm">
                                Commencez par créer votre première sauvegarde manuelle pour sécuriser vos configurations système.
                            </p>
                            <Button
                                variant="outline"
                                className="mt-8 border-dashed border-2 hover:border-blue-500 hover:text-blue-600 transition-all"
                                icon={History}
                                onClick={handleOpenNameModal}
                            >
                                Créer un point de restauration
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

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
                            onClick={() => {
                                setConfirmAction({
                                    open: true,
                                    type: 'reset',
                                    id: 'all',
                                    nom: 'TOUTE LA CONFIGURATION'
                                });
                            }}
                        >
                            Réinitialiser tout
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de Nom de Sauvegarde */}
            <Modal
                isOpen={isNameModalOpen}
                onClose={() => setIsNameModalOpen(false)}
                title="Nouvelle sauvegarde"
            >
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nom du point de restauration :
                        </label>
                        <input
                            type="text"
                            value={backupName}
                            onChange={(e) => setBackupName(e.target.value)}
                            className="w-full border-2 border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-white outline-none transition-all"
                            placeholder="Ex: Avant mise à jour tarifs"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 h-12" onClick={() => setIsNameModalOpen(false)}>Annuler</Button>
                        <Button
                            variant="primary"
                            className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 h-12"
                            onClick={handleCreateBackup}
                        >
                            Sauvegarder
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Modal de Confirmation */}
            <Modal
                isOpen={confirmAction.open}
                onClose={() => setConfirmAction({ ...confirmAction, open: false })}
                title="Confirmation requise"
            >
                <div className="text-center py-4">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${confirmAction.type === 'delete' || confirmAction.type === 'reset' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                        }`}>
                        {confirmAction.type === 'delete' ? <Trash2 className="w-8 h-8" /> : <RefreshCw className="w-8 h-8" />}
                    </div>
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 uppercase">
                        {confirmAction.type === 'restore' ? 'Restaurer le système ?' :
                            confirmAction.type === 'delete' ? 'Supprimer cette sauvegarde ?' :
                                'RESET TOTAL ?'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 px-4">
                        {confirmAction.type === 'restore' ? `Les réglages actuels seront remplacés par "${confirmAction.nom}".` :
                            confirmAction.type === 'delete' ? `Voulez-vous supprimer définitivement "${confirmAction.nom}" ? Cette action est irréversible.` :
                                `Êtes-vous ABSOLUMENT SÛR de vouloir réinitialiser toute la configuration aux valeurs par défaut ?`}
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" className="flex-1 h-12" onClick={() => setConfirmAction({ ...confirmAction, open: false })}>Annuler</Button>
                        <Button
                            variant={confirmAction.type === 'delete' || confirmAction.type === 'reset' ? 'danger' : 'primary'}
                            className="flex-1 h-12"
                            onClick={confirmAction.type === 'reset' ? () => { onReset(); setConfirmAction({ ...confirmAction, open: false }); } : handleConfirmAction}
                        >
                            Confirmer
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default BackupSettings;
