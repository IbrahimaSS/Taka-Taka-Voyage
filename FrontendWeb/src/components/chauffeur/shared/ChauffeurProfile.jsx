import React, { useState, useRef, useEffect } from 'react';
import { motion, visualElementStore } from 'framer-motion';
import {
    User, Camera, Calendar, Phone, Mail, MapPin, Shield,
    Award, Crown, CheckCircle, Clock, Star, CreditCard,
    Users, Lock, LogOut, Radar, Eye, EyeOff, X, Key,
    Car, Briefcase, TrendingUp
} from 'lucide-react';
import { useUserStore } from '../../../data/userStore';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../../../services/profileService';
import toast from 'react-hot-toast';


const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';


// Composants réutilisables
import Button from '../../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../../admin/ui/Card';
import Progress from '../../admin/ui/Progress';
import Modal from '../../admin/ui/Modal';
import Badge from '../../admin/ui/Badge';
import Switch from '../../admin/ui/Switch';

const ChauffeurProfile = () => {
    const { profile: staticProfile, updateProfile: updateStaticProfile } = useUserStore();
    const { user, updateUser, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Initialiser avec les données de l'auth ou du store statique
    const [profileData, setProfileData] = useState({
        name: user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : (user?.nom || staticProfile?.name || 'Chauffeur'),
        prenom: user?.prenom || '',
        nom: user?.nom || '',
        phone: user?.telephone || staticProfile?.phone || '',
        email: user?.email || staticProfile?.email || '',
        avatar: user?.photoUrl || user?.avatar || staticProfile?.avatar || null,
        location: user?.localisation || staticProfile?.location || '',
        joinDate: user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : (staticProfile?.joinDate || 'Janvier 2024')
    });

    // Mettre à jour profileData quand user change
    useEffect(() => {
        if (user) {
            setProfileData(prev => ({
                ...prev,
                name: user.prenom && user.nom ? `${user.prenom} ${user.nom}` : (user.nom || 'Chauffeur'),
                prenom: user.prenom || '',
                nom: user.nom || '',
                email: user.email || '',
                phone: user.telephone || '',
                avatar: user.photoUrl || user.avatar || null,
                location: user.localisation || '',
            }));
        }
    }, [user]);

    const fileInputRef = useRef(null);

    // États pour le changement de mot de passe
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const badges = [
        { id: 1, name: 'Chauffeur Élite', icon: Crown, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', earned: true },
        { id: 2, name: '500 trajets', icon: Award, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', earned: true },
        { id: 3, name: 'Top Note 5★', icon: Star, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', earned: true },
        { id: 4, name: 'Ponctualité 100%', icon: Clock, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', earned: true },
        { id: 5, name: 'Expert Local', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', earned: true },
        { id: 6, name: 'Formateur', icon: Users, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30', earned: false },
    ];

    const stats = [
        { label: 'Trajets complétés', value: '1,248', icon: Radar, color: 'green', progress: 95 },
        { label: 'Revenus totaux', value: '4,850,000 GNF', icon: TrendingUp, color: 'blue', progress: 85 },
        { label: 'Note Chauffeur', value: '4.9', icon: Star, color: 'yellow', progress: 98 },
        { label: 'Heures en ligne', value: '2,450h', icon: Clock, color: 'purple', progress: 70 },
    ];

    const [avatarFile, setAvatarFile] = useState(null);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Veuillez sélectionner une image');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('L\'image ne doit pas dépasser 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setProfileData(prev => ({ ...prev, avatar: reader.result }));
            setAvatarFile(file);
        };
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let response;
            const prenom = profileData.prenom || '';
            const nom = profileData.nom || '';

            if (avatarFile) {
                const formData = new FormData();
                formData.append('photoUrl', avatarFile);
                formData.append('nom', nom);
                formData.append('prenom', prenom);
                formData.append('email', profileData.email);
                formData.append('telephone', profileData.phone);
                formData.append('localisation', profileData.location);

                response = await profileService.chauffeur.updateProfileWithPhoto(formData);
            } else {
                const updateData = {
                    nom,
                    prenom,
                    email: profileData.email,
                    telephone: profileData.phone,
                    localisation: profileData.location,
                };
                response = await profileService.chauffeur.updateProfile(updateData);
            }

            if (response.data?.succes) {
                const updatedUser = response.data.utilisateur;

                const newAvatar = updatedUser.photoUrl || updatedUser.avatar;

                setProfileData(prev => ({
                    ...prev,
                    avatar: newAvatar
                }));

                updateStaticProfile({
                    ...profileData,
                    prenom,
                    nom,
                    avatar: newAvatar
                });

                if (updateUser) {
                    updateUser(updatedUser);
                }
                setAvatarFile(null);
                toast.success('Profil professionnel mis à jour avec succès !');
                setIsEditing(false);
            } else {
                toast.error(response.data?.message || 'Erreur lors de la mise à jour');
            }
        } catch (error) {
            console.error('Erreur mise à jour profil chauffeur:', error);
            toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        const { currentPassword, newPassword, confirmPassword } = passwordData;

        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error('Veuillez remplir tous les champs');
            return;
        }

        if (newPassword.length < 8) {
            toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères');
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas');
            return;
        }

        setIsChangingPassword(true);
        try {
            const response = await profileService.changePassword(user?.role || 'CHAUFFEUR', {
                motDePasseActuel: passwordData.currentPassword,
                nouveauMotDePasse: passwordData.newPassword,
                confirmation: passwordData.confirmPassword
            });

            if (response.data?.succes) {
                toast.success(response.data.message || 'Mot de passe modifié avec succès !');
                setShowPasswordModal(false);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });

                if (response.data.forceLogout) {
                    setTimeout(async () => {
                        await logout();
                        window.location.href = '/connexion';
                    }, 1500);
                }
            } else {
                toast.error(response.data?.message || 'Erreur lors du changement');
            }
        } catch (error) {
            console.error('Erreur changement mot de passe chauffeur:', error);
            toast.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
        } finally {
            setIsChangingPassword(false);
        }
    };

    const getImageUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith("data:") || avatar.startsWith("http")) return avatar;

        const baseUrl = API_URL.replace(/\/api$/, '');
        const cleanPath = avatar.startsWith('/') ? avatar : `/${avatar}`;
        return `${baseUrl}${cleanPath}`;
    };


    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-1">
                <div className="lg:col-span-2 surface dark:bg-gray-800/80 rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Profil Chauffeur</h2>
                        <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-none" size="sm">
                            <Shield className="w-4 h-4 mr-1" />
                            Chauffeur Vérifié
                        </Badge>
                    </div>

                    <div className="flex items-center space-x-6 mb-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-lg overflow-hidden border-4 border-white dark:border-gray-700 relative">
                                <img
                                    src={getImageUrl(profileData.avatar)}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
                                    {profileData.prenom && profileData.nom ? (
                                        `${profileData.prenom[0]}${profileData.nom[0]}`
                                    ) : (
                                        <User className="w-16 h-16" />
                                    )}
                                </div>
                            </div>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            {isEditing && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-2 right-2 w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors border-2 border-white dark:border-gray-800 animate-in zoom-in duration-200 z-20"
                                >
                                    <Camera className="w-5 h-5 z-10" />
                                </button>
                            )}
                        </div>

                        <div>
                            <div className="flex items-center space-x-4 mb-2">
                                {isEditing ? (
                                    <div className="flex space-x-2">
                                        <input
                                            type="text"
                                            placeholder="Prénom"
                                            value={profileData.prenom}
                                            onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                                            className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-primary-500 focus:outline-none w-40"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Nom"
                                            value={profileData.nom}
                                            onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                                            className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-primary-500 focus:outline-none w-40"
                                        />
                                    </div>
                                ) : (
                                    <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                        {profileData.prenom} {profileData.nom}
                                    </h3>
                                )}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <Badge variant="success" size="xs"><CheckCircle className="w-3 h-3 mr-1" />Permis Valide</Badge>
                                <Badge variant="info" size="xs"><Car className="w-3 h-3 mr-1" />Véhicule OK</Badge>
                                <Badge variant="warning" size="xs"><Award className="w-3 h-3 mr-1" />Ambassadeur</Badge>
                            </div>
                            <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                                <p className="flex items-center"><Briefcase className="w-4 h-4 mr-2 text-primary-500" />Chauffeur Professionnel</p>
                                <p className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-primary-500" />Inscrit en {profileData.joinDate || 'Janvier 2024'}</p>
                            </div>
                        </div>
                    </div>

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

                        <div className="flex flex-wrap justify-between items-center gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                            <Button variant="outline" icon={Key} onClick={() => setShowPasswordModal(true)}>
                                Sécurité du compte
                            </Button>
                            <div className="flex space-x-3">
                                {isEditing ? (
                                    <>
                                        <Button variant="secondary" onClick={() => { setProfileData({ ...profileData }); setIsEditing(false); }}>Annuler</Button>
                                        <Button variant="primary" onClick={handleSave} loading={isSaving}>Sauvegarder</Button>
                                    </>
                                ) : (
                                    <Button variant="primary" onClick={() => setIsEditing(true)}>Éditer le profil</Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="surface border-none shadow-lg">
                        <CardHeader><CardTitle>Indicateurs Clés</CardTitle></CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {stats.map((stat, index) => (
                                    <div key={index} className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</p>
                                                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                                            </div>
                                            <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10`}>
                                                <stat.icon className={`w-5 h-5 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                                            </div>
                                        </div>
                                        <Progress value={stat.progress} className="h-1.5" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="surface border-none shadow-lg">
                        <CardHeader><CardTitle>Distinctions</CardTitle></CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-3 gap-2">
                                {badges.map((badge) => (
                                    <div key={badge.id} className={`text-center p-2 rounded-xl transition-all ${badge.earned ? 'bg-gray-50 dark:bg-gray-800/50' : 'opacity-30 grayscale'}`}>
                                        <div className={`w-12 h-12 rounded-full ${badge.earned ? badge.bgColor : 'bg-gray-200'} flex items-center justify-center mx-auto mb-2`}>
                                            <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : 'text-gray-400'}`} />
                                        </div>
                                        <p className="text-[10px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter truncate">{badge.name}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} size="md">
                <div className="p-2">
                    <div className="flex items-center mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center mr-4 shadow-lg">
                            <Lock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">Mot de passe</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Renforcez la sécurité de votre compte</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Mot de passe actuel</label>
                            <input
                                type="password"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nouveau mot de passe</label>
                            <input
                                type="password"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Confirmer le nouveau mot de passe</label>
                            <input
                                type="password"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800 outline-none focus:ring-2 focus:ring-primary-500/20"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <div className="flex gap-3 mt-8">
                        <Button variant="secondary" fullWidth onClick={() => setShowPasswordModal(false)}>Annuler</Button>
                        <Button variant="primary" fullWidth onClick={handlePasswordChange} loading={isChangingPassword}>Confirmer</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default ChauffeurProfile;
