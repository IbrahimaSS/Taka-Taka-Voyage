// src/pages/Profile.jsx
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { User, Camera, Calendar, Phone, Mail, MapPin, Shield, Award, Crown, CheckCircle, Clock, Star, CreditCard, Users, Lock, LogOut, Radar, Eye, EyeOff, X, Key } from 'lucide-react';
import { usePassenger } from '../../context/PassengerContext';
import toast from 'react-hot-toast';

// Composants réutilisables
import Button from '../admin/ui/Bttn';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from '../admin/ui/Card';
import Progress from '../admin/ui/Progress';
import Modal from '../admin/ui/Modal';
import Badge from '../admin/ui/Badge';
import Switch from '../admin/ui/Switch';

const Profile = () => {
  const { passenger, updatePassenger, isLoadingProfile } = usePassenger();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    phone: '',
    email: '',
    avatar: '',
    rating: '5.0',
    address: '',
    ...passenger
  });

  React.useEffect(() => {
    if (passenger) {
      setProfileData({
        ...passenger,
        name: passenger.name || `${passenger.prenom || ''} ${passenger.nom || ''}`.trim() || 'Utilisateur',
      });
    }
  }, [passenger]);

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
    { id: 1, name: 'Membre Gold', icon: Crown, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', earned: true },
    { id: 2, name: '10 trajets', icon: Award, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', earned: true },
    { id: 3, name: 'Note 5★', icon: Star, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', earned: true },
    { id: 4, name: 'Rapide', icon: Clock, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', earned: true },
    { id: 5, name: 'Fidèle', icon: Users, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', earned: false },
    { id: 6, name: 'VIP', icon: Award, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30', earned: false },
  ];

  const stats = [
    { label: 'Trajets effectués', value: '24', icon: Radar, color: 'green', progress: 80 },
    { label: 'Dépenses totales', value: '245 000 GNF', icon: CreditCard, color: 'blue', progress: 60 },
    { label: 'Note moyenne', value: '4.8', icon: Star, color: 'yellow', progress: 90 },
    { label: 'Temps total', value: '18h 30min', icon: Clock, color: 'purple', progress: 75 },
  ];

  // Gestion de l'upload de photo
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('L\'image ne doit pas dépasser 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileData(prev => ({ ...prev, avatar: reader.result }));
      toast.success('Photo de profil mise à jour !');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updatePassenger(profileData);
    setIsEditing(false);
    toast.success('Profil mis à jour avec succès !');
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success('Mot de passe modifié avec succès !');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error('Erreur lors du changement de mot de passe');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-500 animate-pulse">Chargement de votre profil...</p>
      </div>
    );
  }

  if (!passenger) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-gray-500">Erreur lors du chargement du profil.</p>
        <button onClick={() => window.location.reload()} className="text-green-600 font-bold underline">Réessayer</button>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-4">
        {/* Informations principales */}
        <div className="lg:col-span-2 passenger-glass dark:bg-gray-800/80 rounded-2xl p-8 shadow-xl border border-white/20 dark:border-gray-700/50">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mon profil</h2>
            <Badge className="bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800" size="sm">
              <Crown className="w-4 h-4 mr-1" />
              Membre Premium
            </Badge>
          </div>

          {/* Photo et info basique */}
          <div className="flex items-center space-x-6 mb-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-blue-200 dark:from-green-900/40 dark:to-blue-900/40 flex items-center justify-center shadow-lg overflow-hidden">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-blue-700 dark:text-blue-300" />
                )}
              </div>
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
                title="Changer la photo de profil"
              >
                <Camera className="w-5 h-5" />
              </button>
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
                    Email vérifié
                  </Badge>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" size="xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Téléphone vérifié
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Calendar className="w-4 h-4 mr-2 text-green-600" />
                  Passager depuis Janvier 2025
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-300">
                  <Star className="w-4 h-4 mr-2 text-amber-600" />
                  Note moyenne: {profileData.rating} sur 5
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire d'édition */}
          <div className="space-y-8">
            {/* Informations personnelles */}
            <Card hoverable={false} className="bg-transparent border-none shadow-none">
              <CardHeader>
                <CardTitle size="lg">Informations personnelles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Nom</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition"
                      />
                    ) : (
                      <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium">
                        {profileData.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Téléphone</label>
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
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Email</label>
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
                    <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Adresse</label>
                    <div className="relative">
                      {isEditing ? (
                        <input
                          type="text"
                          value={profileData.address || ''}
                          onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                          className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pl-12"
                          placeholder="Votre adresse"
                        />
                      ) : (
                        <div className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100 font-medium pl-12">
                          {profileData.address || 'Non renseignée'}
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
                <CardTitle size="lg">Préférences</CardTitle>
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
                    <p className="font-medium text-gray-900 dark:text-gray-100">Trajet silencieux</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Je préfère voyager en silence</p>
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
                    <p className="font-medium text-gray-900 dark:text-gray-100">Assistance aux bagages</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">J'ai souvent des bagages</p>
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
                    <p className="font-medium text-gray-900 dark:text-gray-100">Chauffeur expérimenté</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Préférer les chauffeurs avec plus d'expérience</p>
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
                Changer le mot de passe
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
                      Annuler
                    </Button>
                    <Button
                      variant="primary"
                      onClick={handleSave}
                    >
                      Enregistrer
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Modifier le profil
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
              <CardTitle>Mes statistiques</CardTitle>
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
                <CardTitle>Mes badges</CardTitle>
                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" size="sm">
                  4/10 obtenus
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">{badge.earned ? 'Obtenu' : 'À gagner'}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" fullWidth>
                Voir tous les badges
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
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">Changer le mot de passe</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sécurisez votre compte</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Mot de passe actuel */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pr-12"
                placeholder="Entrez votre mot de passe actuel"
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
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pr-12"
                placeholder="Minimum 8 caractères"
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
              <p className="text-xs text-red-500 mt-1">Le mot de passe doit contenir au moins 8 caractères</p>
            )}
          </div>

          {/* Confirmer le mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none transition pr-12"
                placeholder="Confirmez votre nouveau mot de passe"
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
              <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas</p>
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
            Annuler
          </Button>
          <Button
            variant="primary"
            fullWidth
            onClick={handlePasswordChange}
            loading={isChangingPassword}
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
          >
            Confirmer
          </Button>
        </div>
      </Modal>
    </>
  );
};

export default Profile;