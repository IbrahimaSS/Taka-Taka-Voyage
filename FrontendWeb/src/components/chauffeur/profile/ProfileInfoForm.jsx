import { Phone, Mail, MapPin, Key } from 'lucide-react';
import Button from '../../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const ProfileInfoForm = ({
    profileData,
    setProfileData,
    isEditing,
    onStartEditing,
    onCancelEditing,
    isSaving,
    onSave,
    onOpenPasswordModal,
}) => (
    <div className="space-y-8">
        <Card className="bg-transparent border-none shadow-none p-0">
            <CardHeader className="px-0">
                <CardTitle size="lg">Informations professionnelles</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">Prénom</label>
                        <input
                            disabled={!isEditing}
                            type="text"
                            value={profileData.prenom}
                            onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition disabled:opacity-75"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">Nom</label>
                        <input
                            disabled={!isEditing}
                            type="text"
                            value={profileData.nom}
                            onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition disabled:opacity-75"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">Téléphone</label>
                        <div className="relative">
                            <input
                                disabled={!isEditing}
                                type="text"
                                inputMode="tel"
                                value={profileData.phone}
                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition disabled:opacity-75 pl-12"
                            />
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">Email professionnel</label>
                        <div className="relative">
                            <input
                                disabled={!isEditing}
                                type="email"
                                inputMode="email"
                                value={profileData.email}
                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition disabled:opacity-75 pl-12"
                            />
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2 text-sm">Zone d'activité principale</label>
                        <div className="relative">
                            <input
                                disabled={!isEditing}
                                type="text"
                                value={profileData.location}
                                onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 outline-none transition disabled:opacity-75 pl-12"
                            />
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-stretch sm:items-center gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" icon={Key} onClick={onOpenPasswordModal}>
                Sécurité du compte
            </Button>
            <div className="flex gap-3">
                {isEditing ? (
                    <>
                        <Button className="flex-1 sm:flex-none" variant="secondary" onClick={onCancelEditing}>Annuler</Button>
                        <Button className="flex-1 sm:flex-none" variant="primary" onClick={onSave} loading={isSaving}>Sauvegarder</Button>
                    </>
                ) : (
                    <Button className="flex-1 sm:flex-none" variant="primary" onClick={onStartEditing}>Éditer le profil</Button>
                )}
            </div>
        </div>
    </div>
);

export default ProfileInfoForm;
