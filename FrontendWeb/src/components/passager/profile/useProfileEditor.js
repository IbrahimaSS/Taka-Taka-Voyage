import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { usePassenger } from '../../../context/PassengerContext';
import { useAuth } from '../../../context/AuthContext';
import { profileService } from '../../../services/profileService';
import { getFullAssetURL } from '../../../utils/urlHelper';

export const useProfileEditor = (t) => {
  const { passenger, isLoadingProfile, updatePassenger: updateContextPassenger } = usePassenger();
  const { user, updateUser } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const [profileData, setProfileData] = useState({
    name: user?.prenom && user?.nom ? `${user.prenom} ${user.nom}` : (user?.nom || passenger?.name || 'Passager'),
    prenom: user?.prenom || passenger?.prenom || '',
    nom: user?.nom || passenger?.nom || '',
    phone: user?.telephone || passenger?.phone || '',
    email: user?.email || passenger?.email || '',
    avatar: user?.photoUrl || user?.avatar || passenger?.avatar || null,
    localisation: user?.localisation || passenger?.localisation || '',
    address: user?.adresse || passenger?.address || '',
    rating: user?.noteMoyenne || passenger?.noteMoyenne || 5.0,
  });

  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.prenom && user.nom ? `${user.prenom} ${user.nom}` : (user.nom || 'Passager'),
        prenom: user.prenom || '',
        nom: user.nom || '',
        email: user.email || '',
        phone: user.telephone || '',
        avatar: user.photoUrl || user.avatar || null,
        localisation: user.localisation || '',
        address: user.adresse || '',
        rating: user.noteMoyenne || 5.0,
      }));
    } else if (passenger) {
      setProfileData(prev => ({
        ...prev,
        ...passenger,
        name: passenger.name || `${passenger.prenom || ''} ${passenger.nom || ''}`.trim() || 'Passager',
        rating: passenger.noteMoyenne || 5.0,
      }));
    }
  }, [user, passenger]);

  // Charger les statistiques réelles
  const [realStats, setRealStats] = useState({
    trips: 0,
    spending: 0,
    averageRating: 5.0,
    totalTime: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoadingStats(true);
        const response = await profileService.passager.getStats();
        if (response.data?.succes) {
          setRealStats(response.data.stats);
        }
      } catch (error) {
        console.error("Erreur chargement stats passager:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('profile.messages.image_type_error'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('profile.messages.image_size_error'));
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, avatar: reader.result }));
      setAvatarFile(file);
      toast.success(t('profile.messages.image_ready'));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let response;
      const nom = profileData.nom || '';
      const prenom = profileData.prenom || '';

      if (avatarFile) {
        const formData = new FormData();
        formData.append('photoUrl', avatarFile);
        formData.append('nom', nom);
        formData.append('prenom', prenom);
        formData.append('email', profileData.email);
        formData.append('telephone', profileData.phone);
        formData.append('localisation', profileData.localisation);
        formData.append('adresse', profileData.address);

        response = await profileService.passager.updateProfileWithPhoto(formData);
      } else {
        const updateData = {
          nom,
          prenom,
          email: profileData.email,
          telephone: profileData.phone,
          localisation: profileData.localisation,
          adresse: profileData.address,
        };
        response = await profileService.passager.updateProfile(updateData);
      }

      if (response.data?.succes) {
        const updatedUser = response.data.utilisateur;

        if (updateUser) {
          updateUser(updatedUser);
        }

        if (updateContextPassenger) {
          updateContextPassenger(updatedUser);
        }

        setAvatarFile(null);
        toast.success(t('profile.messages.update_success'));
        setIsEditing(false);
      } else {
        toast.error(response.data?.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Erreur mise à jour profil passager:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setIsSaving(false);
    }
  };

  const getImageUrl = (avatar) => getFullAssetURL(avatar);

  return {
    passenger, isLoadingProfile, user,
    profileData, setProfileData,
    isEditing, setIsEditing,
    isSaving, handleSave,
    avatarFile, handleImageUpload,
    realStats, isLoadingStats,
    getImageUrl,
  };
};
