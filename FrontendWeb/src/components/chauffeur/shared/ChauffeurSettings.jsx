import React, { useState } from 'react';
import {
    Bell, Shield, Car, Globe, CreditCard, Phone,
    Moon, Sun, Lock, Smartphone, Volume2, VolumeX,
    Eye, EyeOff, Map, Zap, Clock, ShieldCheck
} from 'lucide-react';

// Composants réutilisables
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';
import Switch from '../../admin/ui/Switch';
import Badge from '../../admin/ui/Badge';
import ConfirmModal from '../../admin/ui/ConfirmModal';

const ChauffeurSettings = () => {
    const [settings, setSettings] = useState({
        notifications: {
            newTrips: true,
            priceUpdates: true,
            sms: true,
            promotions: false,
        },
        privacy: {
            locationOnOffline: true,
            showRatingToUsers: true,
            anonymousAnalytics: true,
        },
        preferences: {
            maxDistance: '15',
            language: 'fr',
            autoAccept: false,
            optimizedRoutes: true,
        },
        theme: 'light',
        sound: true,
    });

    const [showSaveConfirm, setShowSaveConfirm] = useState(false);
    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const toggleSetting = (category, key) => {
        setSettings(prev => ({
            ...prev,
            [category]: { ...prev[category], [key]: !prev[category][key] }
        }));
    };

    const updatePreference = (key, value) => {
        setSettings(prev => ({
            ...prev,
            preferences: { ...prev.preferences, [key]: value }
        }));
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configuration Chauffeur</h2>
                    <Badge variant="info" size="sm">V 1.2.0</Badge>
                </div>

                <div className="space-y-6">
                    {/* Notifications Chauffeur */}
                    <Card className="surface">
                        <CardHeader>
                            <div className="flex items-center">
                                <Bell className="w-6 h-6 text-primary-600 mr-3" />
                                <CardTitle>Canaux d'alerte</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">Nouvelles courses</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Alertes sonores pour les opportunités proches</p>
                                </div>
                                <Switch checked={settings.notifications.newTrips} onChange={() => toggleSetting('notifications', 'newTrips')} />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-700/50">
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-gray-100">Mises à jour des tarifs</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Notification en cas de majoration (Surge pricing)</p>
                                </div>
                                <Switch checked={settings.notifications.priceUpdates} onChange={() => toggleSetting('notifications', 'priceUpdates')} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Préférences de Service */}
                    <Card className="surface">
                        <CardHeader>
                            <div className="flex items-center">
                                <Zap className="w-6 h-6 text-primary-600 mr-3" />
                                <CardTitle>Préférences de service</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 dark:text-gray-300 font-bold mb-2 text-sm">Distance max. de recherche (km)</label>
                                <select
                                    value={settings.preferences.maxDistance}
                                    onChange={(e) => updatePreference('maxDistance', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                                >
                                    <option value="5">5 km</option>
                                    <option value="10">10 km</option>
                                    <option value="15">15 km</option>
                                    <option value="25">25 km (Illimité)</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800/20">
                                <div>
                                    <p className="font-bold text-primary-900 dark:text-primary-100">Acceptation auto</p>
                                    <p className="text-xs text-primary-700/70 dark:text-primary-300/70">Accepter directement les courses</p>
                                </div>
                                <Switch checked={settings.preferences.autoAccept} onChange={() => updatePreference('autoAccept', !settings.preferences.autoAccept)} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="surface">
                        <CardFooter align="between">
                            <Button variant="danger" ghost>Réinitialiser</Button>
                            <div className="flex space-x-3">
                                <Button variant="secondary" onClick={() => setShowCancelConfirm(true)}>Annuler</Button>
                                <Button variant="primary" onClick={() => setShowSaveConfirm(true)}>Appliquer</Button>
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>

            <div className="space-y-6">
                <Card className="surface">
                    <CardHeader><CardTitle>Statut de sécurité</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800/30">
                            <div className="flex items-center text-green-700 dark:text-green-400 font-bold mb-1">
                                <ShieldCheck className="w-4 h-4 mr-2" />
                                Compte Sécurisé
                            </div>
                            <p className="text-xs text-green-600/80 dark:text-green-500/80">Tous vos documents sont à jour et vérifiés.</p>
                        </div>
                        <button className="w-full text-left p-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                            <p className="font-bold text-gray-900 dark:text-gray-100 text-sm">Vérification en deux étapes</p>
                            <p className="text-xs text-gray-500">Activé (SMS)</p>
                        </button>
                    </CardContent>
                </Card>

                <Card className="surface">
                    <CardHeader><CardTitle>Application</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Mode Sombre</p>
                            <Switch checked={settings.theme === 'dark'} />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">Sons & Vibrations</p>
                            <Switch checked={settings.sound} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <ConfirmModal
                isOpen={showSaveConfirm}
                onClose={() => setShowSaveConfirm(false)}
                onConfirm={() => setShowSaveConfirm(false)}
                title="Appliquer les changements"
                message="Voulez-vous enregistrer ces nouvelles préférences de conduite ?"
                confirmText="Enregistrer"
                type="info"
            />
        </div>
    );
};

export default ChauffeurSettings;
