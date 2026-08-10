import { useState, useRef, useEffect, useCallback } from 'react';
import { useUserStore } from '../../../data/userStore';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../../../services/profileService';
import toast from 'react-hot-toast';
import { getFullAssetURL } from '../../../utils/urlHelper';

export const useChauffeurProfile = () => {
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
    const [avatarFile, setAvatarFile] = useState(null);

    // Ancien "Annuler" ne restaurait rien (il ré-appliquait le même state
    // édité sur lui-même) : les modifications non sauvegardées restaient
    // affichées malgré le clic sur Annuler. On capture un instantané avant
    // édition pour pouvoir réellement revenir en arrière.
    const profileSnapshotRef = useRef(null);

    const startEditing = useCallback(() => {
        profileSnapshotRef.current = profileData;
        setIsEditing(true);
    }, [profileData]);

    const cancelEditing = useCallback(() => {
        if (profileSnapshotRef.current) {
            setProfileData(profileSnapshotRef.current);
        }
        setAvatarFile(null);
        setIsEditing(false);
    }, []);

    // États pour le changement de mot de passe
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChangingPassword, setIsChangingPassword] = useState(false);

    const [realStats, setRealStats] = useState({
        trajetsCompletes: 0,
        revenusTotaux: 0,
        noteMoyenne: 5,
        heuresEnLigne: 0
    });

    // Charger les statistiques réelles au montage
    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await profileService.chauffeur.getProfile();
                if (response.data?.succes && response.data.profil?.stats) {
                    setRealStats(response.data.profil.stats);
                }
            } catch (error) {
                console.error("Erreur lors de la récupération des statistiques:", error);
            }
        };
        fetchStats();
    }, []);

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

    // getFullAssetURL ne gere pas les data: URI (previsualisation locale avant
    // sauvegarde) - sans ce garde, l'apercu de la nouvelle photo choisie casse
    const getImageUrl = (avatar) => {
        if (!avatar) return null;
        if (avatar.startsWith('data:') || avatar.startsWith('blob:') || avatar.startsWith('http')) return avatar;
        return getFullAssetURL(avatar);
    };

    return {
        profileData,
        setProfileData,
        isEditing,
        startEditing,
        cancelEditing,
        isSaving,
        fileInputRef,
        showPasswordModal,
        setShowPasswordModal,
        passwordData,
        setPasswordData,
        isChangingPassword,
        realStats,
        handleImageUpload,
        handleSave,
        handlePasswordChange,
        getImageUrl,
    };
};
