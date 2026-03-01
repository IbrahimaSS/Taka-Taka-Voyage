import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Camera, Calendar, Phone, Mail, MapPin, Shield, Award, Crown, CheckCircle, Clock, Star, CreditCard, Users, Lock, LogOut, Radar, Eye, EyeOff, X, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePassenger } from '../../context/PassengerContext';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import toast from 'react-hot-toast';

// Composants réutilisables
import Button from '../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Progress from '../admin/ui/Progress';
import Modal from '../admin/ui/Modal';
import Badge from '../admin/ui/Badge';
import Switch from '../admin/ui/Switch';

const Profile = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { passenger, isLoadingProfile, updatePassenger: updateContextPassenger } = usePassenger();
  const { user, updateUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [realStats, setRealStats] = useState({
    trips: 0,
    spending: 0,
    averageRating: 5.0,
    totalTime: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    { id: 1, name: t('profile.badges.gold_member'), icon: Crown, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', earned: true },
    { id: 2, name: t('profile.badges.trips_10'), icon: Award, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', earned: true },
    { id: 3, name: t('profile.badges.rating_5'), icon: Star, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', earned: true },
    { id: 4, name: t('profile.badges.fast'), icon: Clock, color: 'text-red-600', bgColor: 'bg-green-100 dark:bg-green-900/30', earned: true },
    { id: 5, name: t('profile.badges.loyal'), icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', earned: false },
    { id: 6, name: t('profile.badges.vip'), icon: Award, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30', earned: false },
  ];

  // Formater le temps (minutes -> h min)
  const formatTime = (minutes) => {
    if (!minutes) return "0min";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}min`;
    return `${hours}h ${mins > 0 ? `${mins}min` : ''}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Janvier 2025';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US', {
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return 'Janvier 2025';
    }
  };

  const stats = [
    {
      label: t('profile.stats.trips'),
      value: realStats.trips,
      icon: Radar,
      color: 'green',
      progress: Math.min(100, (realStats.trips / 50) * 100) // Objectif 50 trajets
    },
    {
      label: t('profile.stats.spending'),
      value: `${(realStats.spending || 0).toLocaleString()} GNF`,
      icon: CreditCard,
      color: 'blue',
      progress: Math.min(100, (realStats.spending / 1000000) * 100) // Objectif 1M GNF
    },
    {
      label: t('profile.stats.average_rating'),
      value: realStats.averageRating?.toFixed(1) || '5.0',
      icon: Star,
      color: 'yellow',
      progress: (realStats.averageRating || 5) * 20
    },
    {
      label: t('profile.stats.total_time'),
      value: formatTime(realStats.totalTime),
      icon: Clock,
      color: 'purple',
      progress: Math.min(100, (realStats.totalTime / 3000) * 100) // Objectif 50h
    },
  ];

  // Gestion de l'upload de photo
  const [avatarFile, setAvatarFile] = useState(null);

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

  // Gestion du changement de mot de passe
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

    if (currentPassword === newPassword) {
      toast.error('Le nouveau mot de passe doit être différent de l\'ancien');
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await profileService.passager.changePassword({
        motDePasseActuel: currentPassword,
        nouveauMotDePasse: newPassword,
        confirmationMotDePasse: confirmPassword
      });

      if (response.data?.succes) {
        toast.success(t('profile.messages.password_success'));
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
        setShowPasswordModal(false);

        if (response.data.forceLogout && logout) {
          toast.loading(t('profile.password.logout_msg'));
          setTimeout(async () => {
            await logout();
            navigate('/connexion');
          }, 2000);
        }
      } else {
        toast.error(response.data?.message || 'Erreur lors de la modification du mot de passe');
      }
    } catch (error) {
      console.error('Erreur changement mot de passe:', error);
      toast.error(error.response?.data?.message || 'Erreur lors de la modification du mot de passe');
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

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse">{t('profile.messages.loading')}</p>
      </div>
    );
  }

  if (!passenger) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-gray-500">{t('profile.messages.error_loading')}</p>
        <button onClick={() => window.location.reload()} className="text-green-600 font-bold underline">{t('profile.messages.retry')}</button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        {/* Informations principales */}
        <div className="lg:col-span-2 passenger-glass dark:bg-gray-800/80 rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('profile.title')}</h2>
            <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800" size="sm">
              <Crown className="w-4 h-4 mr-1" />
              {t('profile.membership.premium')}
            </Badge>
          </div>

          {/* Photo et info basique */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-blue-200 dark:from-green-900/40 dark:to-blue-900/40 flex items-center justify-center shadow-lg overflow-hidden">
                {profileData.avatar ? (
                  <img src={getImageUrl(profileData.avatar)} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-blue-700 dark:text-blue-300" />
                )}
              </div>
              {isEditing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-green-700 transition-colors"
                    title={t('common.change_logo')}
                  >
                    < Camera className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            <div>
              <div className="flex items-center space-x-4 mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="text-3xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-green-500 focus:outline-none"
                  />
                ) : (
                  <h3 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{profileData.name}</h3>
                )}
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" size="xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('profile.verification.email')}
                  </Badge>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" size="xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {t('profile.verification.phone')}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-green-600" />
                  {t('profile.info.since', { date: formatDate(user?.createdAt || passenger?.membreDepuis) })}
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Star className="w-4 h-4 mr-2 text-amber-600" />
                  {t('profile.info.rating', { rating: profileData.rating })}
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire d'édition */}
          <div className="space-y-8">
            {/* Informations personnelles */}
            <Card hoverable={false} className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle size="lg">{t('profile.personal_info.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.firstname')}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.prenom}
                        onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium">
                        {profileData.prenom}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.lastname')}</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.nom}
                        onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium">
                        {profileData.nom}
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.phone')}</label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pl-12"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium pl-12">
                          {profileData.phone}
                        </div>
                      )}
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.email')}</label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pl-12"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium pl-12">
                          {profileData.email}
                        </div>
                      )}
                      <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">{t('profile.personal_info.location')}</label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.localisation || ''}
                          onChange={(e) => setProfileData({ ...profileData, localisation: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pl-12"
                          placeholder={t('profile.personal_info.location_placeholder')}
                        />
                      ) : (
                        <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium pl-12">
                          {profileData.localisation || t('profile.personal_info.no_location')}
                        </div>
                      )}
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Préférences */}
            <Card hoverable={false} className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle size="lg">{t('profile.preferences.title')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 transition-colors cursor-pointer">
                  <Switch
                    checked={profileData.preferences?.silentRide || false}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      preferences: { ...profileData.preferences, silentRide: e.target.checked }
                    })}
                  />
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('profile.preferences.silent_ride')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.preferences.silent_ride_desc')}</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 transition-colors cursor-pointer">
                  <Switch
                    checked={profileData.preferences?.luggageHelp || true}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      preferences: { ...profileData.preferences, luggageHelp: e.target.checked }
                    })}
                  />
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('profile.preferences.luggage_help')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.preferences.luggage_help_desc')}</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-green-500 transition-colors cursor-pointer">
                  <Switch
                    checked={profileData.preferences?.experiencedDriver || false}
                    onChange={(e) => setProfileData({
                      ...profileData,
                      preferences: { ...profileData.preferences, experiencedDriver: e.target.checked }
                    })}
                  />
                  <div className="ml-4">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{t('profile.preferences.experienced_driver')}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.preferences.experienced_driver_desc')}</p>
                  </div>
                </label>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex flex-wrap justify-between items-center gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                icon={Key}
                onClick={() => setShowPasswordModal(true)}
                className="border-blue-300 text-blue-700 dark:text-blue-400 dark:border-blue-600"
              >
                {t('profile.password.change_btn')}
              </Button>

              <div className="flex space-x-4">
                {isEditing ? (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setProfileData({ ...passenger });
                        setIsEditing(false);
                      }}
                    >
                      {t('profile.actions.cancel')}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                      loading={isSaving}
                    >
                      {t('profile.actions.save')}
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                  >
                    {t('profile.actions.edit')}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar - Statistiques et badges */}
        <div className="space-y-8">
          {/* Statistiques */}
          <Card>
            <CardHeader>
              <CardTitle>{t('profile.stats.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-700 dark:text-gray-300">{stat.label}</p>
                          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                        </div>
                        <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/40`}>
                          <Icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
                        </div>
                      </div>
                      <Progress
                        value={stat.progress}
                        className={`progress-fill dark:bg-gray-700`}
                        showLabel={false}
                        animated={true}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center w-full">
                <CardTitle>{t('profile.badges.title')}</CardTitle>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" size="sm">
                  {t('profile.badges.obtained', { count: 4, total: 10 })}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {badges.map((badge) => {
                  const Icon = badge.icon;
                  return (
                    <div
                      key={badge.id}
                      className={`text-center p-3 ${!badge.earned && 'opacity-50'}`}
                    >
                      <div className={`w-16 h-16 rounded-full ${badge.bgColor} dark:bg-opacity-20 flex items-center justify-center mx-auto mb-2 shadow-sm`}>
                        <Icon className={`w-8 h-8 ${badge.color}`} />
                      </div>
                      <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{badge.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{badge.earned ? t('profile.badges.status_obtained') : t('profile.badges.status_to_earn')}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" fullWidth>
                {t('profile.badges.view_all')}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Modal de changement de mot de passe */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} size="md">
        <div className="flex items-center mb-6">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 flex items-center justify-center mr-4">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{t('profile.password.title')}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('profile.password.subtitle')}</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.password.current')}
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pr-12"
                placeholder={t('profile.password.current_placeholder')}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.password.new')}
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pr-12"
                placeholder={t('profile.password.new_placeholder')}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordData.newPassword && passwordData.newPassword.length < 8 && (
              <p className="text-xs text-red-500 mt-1">{t('profile.password.error_length')}</p>
            )}
          </div>

          {/* Confirmer le mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.password.confirm')}
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pr-12"
                placeholder={t('profile.password.confirm_placeholder')}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {passwordData.confirmPassword && passwordData.newPassword !== passwordData.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{t('profile.password.error_mismatch')}</p>
            )}
          </div>
        </div>

        <div className="flex space-x-4 mt-8">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => {
              setShowPasswordModal(false);
              setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            }}
          >
            {t('profile.actions.cancel')}
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handlePasswordChange}
            loading={isChangingPassword}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            {t('common.confirm')}
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Profile;