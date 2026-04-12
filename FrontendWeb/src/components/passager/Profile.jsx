import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { User, Camera, Calendar, Phone, Mail, MapPin, Shield, Award, Crown, CheckCircle, Clock, Star, CreditCard, Users, Lock, LogOut, Radar, Eye, EyeOff, X, Key, Search, ChevronRight, Download, QrCode, Car, Smartphone, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePassenger } from '../../context/PassengerContext';
import { useAuth } from '../../context/AuthContext';
import { profileService } from '../../services/profileService';
import toast from 'react-hot-toast';
import { getFullAssetURL } from '../../utils/urlHelper';
import { ticketService } from '../../services/ticketService';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

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
  const { passenger, isLoadingProfile, updatePassenger: updateContextPassenger, pendingTicket, setPendingTicket } = usePassenger();
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

  const [activeTab, setActiveTab] = useState('info');
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Charger les tickets
  const fetchTickets = async () => {
    try {
      setIsLoadingTickets(true);
      const response = await ticketService.getMesTickets();
      if (response.data?.succes) {
        setTickets(response.data.data);
      }
    } catch (error) {
      console.error("Erreur chargement tickets:", error);
    } finally {
      setIsLoadingTickets(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }

    const handleTicketReady = () => {
      console.log("🎫 [PROFILE] Nouveau ticket prêt, rafraîchissement...");
      fetchTickets();
    };
    
    const handleOpenTicket = (e) => {
      console.log("🎫 [PROFILE] Event taka:open_ticket reçu", e.detail);
      setActiveTab('tickets');
      setSelectedTicket(e.detail);
    };

    window.addEventListener('taka:ticket_ready', handleTicketReady);
    window.addEventListener('taka:open_ticket', handleOpenTicket);
    window.addEventListener('taka:open_ticket_delay', handleOpenTicket);
    return () => {
      window.removeEventListener('taka:ticket_ready', handleTicketReady);
      window.removeEventListener('taka:open_ticket', handleOpenTicket);
      window.removeEventListener('taka:open_ticket_delay', handleOpenTicket);
    };
  }, [activeTab]);

  // ✅ [OUVERTURE AUTOMATIQUE TICKET] 
  useEffect(() => {
    if (pendingTicket) {
      console.log("🎫 [PROFILE] Ouverture automatique du ticket en attente:", pendingTicket.codeUnique);
      setActiveTab('tickets');
      setSelectedTicket(pendingTicket);
      setPendingTicket(null); // Consommé
    }
  }, [pendingTicket, setPendingTicket]);


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

   const handleDownloadTicket = () => {
    if (!selectedTicket) return;
    
    try {
      const doc = new jsPDF();
      
      // En-tête du PDF
      doc.setFillColor(0, 168, 142); // Vert Taka
      doc.rect(0, 0, 210, 40, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("TAKA TAKA - REÇU DE VOYAGE", 105, 25, { align: "center" });
      
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Code Ticket: ${selectedTicket.codeUnique || selectedTicket.id || 'N/A'}`, 20, 50);
      doc.text(`Date: ${selectedTicket.createdAt ? new Date(selectedTicket.createdAt).toLocaleString() : 'N/A'}`, 20, 60);
      
      // Extraction sécurisée des données
      const chauffeurName = selectedTicket.chauffeur 
        ? `${selectedTicket.chauffeur.prenom || ''} ${selectedTicket.chauffeur.nom || ''}`.trim() 
        : (selectedTicket.chauffeurName || 'Non assigné');
        
      const distance = selectedTicket.distanceKm || selectedTicket.distance || 0;
      const duree = selectedTicket.dureeMin || selectedTicket.duree || 0;
      
      // Tableau des détails
      const tableData = [
        ["Passager", profileData.name || "Passager"],
        ["Chauffeur", chauffeurName || "Non spécifié"],
        ["Trajet", `${selectedTicket.depart || '—'} -> ${selectedTicket.destination || '—'}`],
        ["Distance", `${distance} KM`],
        ["Durée", `${duree} MIN`],
        ["Montant Total", `${(selectedTicket.prix || 0).toLocaleString()} GNF`],
        ["Statut", "PAYÉ"]
      ];
      
      autoTable(doc, {
        startY: 70,
        head: [['Champ', 'Détail']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 92, 151], textColor: [255, 255, 255] }
      });
      
      const finalY = doc.lastAutoTable?.finalY || 150;
      doc.text("Merci d'avoir choisi Taka Taka !", 105, finalY + 20, { align: "center" });
      
      doc.save(`TakaTaka_Recu_${selectedTicket.codeUnique || 'ticket'}.pdf`);
      toast.success("Recu téléchargé avec succès");
    } catch (error) {
      console.error("Erreur PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  const getImageUrl = (avatar) => getFullAssetURL(avatar);

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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('profile.title')}</h2>
            
            <div className="flex bg-gray-100 dark:bg-gray-700/50 p-1 rounded-xl w-full md:w-auto">
              <button 
                onClick={() => setActiveTab('info')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'info' ? 'bg-white dark:bg-gray-800 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Informations personnelles
              </button>
              <button 
                onClick={() => setActiveTab('tickets')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tickets' ? 'bg-white dark:bg-gray-800 shadow-sm text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                Mes Tickets
              </button>
            </div>

            <Badge className="hidden md:flex bg-gradient-to-r from-yellow-100 to-amber-100 text-amber-800" size="sm">
              <Crown className="w-4 h-4 mr-1" />
              {t('profile.membership.premium')}
            </Badge>
          </div>

          {activeTab === 'info' ? (
            <>
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
          </>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900/50 border rounded-xl outline-none"
                  />
                </div>
                <p className="text-xs text-gray-500">{tickets.length} ticket(s) trouvé(s)</p>
              </div>

              {isLoadingTickets ? (
                <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div></div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 dark:bg-gray-900/10 rounded-2xl border-2 border-dashed">
                  <p className="text-gray-400">Aucun ticket trouvé</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {tickets.filter(t => (t.depart?.toLowerCase() || '').includes(searchTerm.toLowerCase()) || (t.destination?.toLowerCase() || '').includes(searchTerm.toLowerCase())).map(ticket => (
                    <div key={ticket._id} onClick={() => setSelectedTicket(ticket)} className="flex items-center justify-between p-4 bg-white dark:bg-gray-700/30 border rounded-2xl cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center text-green-600"><QrCode className="w-6 h-6" /></div>
                        <div>
                          <h4 className="font-bold">{ticket.destination || 'Trajet'}</h4>
                          <p className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleDateString()} • {(ticket.prix || 0).toLocaleString()} GNF</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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

      {/* MODAL DU TICKET PREMIUM */}
      <Modal isOpen={!!selectedTicket} onClose={() => setSelectedTicket(null)} size="xl">
        <div className="relative bg-white dark:bg-[#0B1120] rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 max-w-md mx-auto">
          {/* En-tête avec dégradé Taka-Taka */}
          <div className="bg-gradient-to-br from-[#00A88E] to-[#005C97] p-8 pb-12 relative overflow-hidden">
             {/* Cercles de décoration */}
             <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>
             
             <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center space-x-3">
                   <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                      <img src="/logo-mini.png" alt="T" className="w-6 h-6 brightness-0 invert" 
                        onError={(e) => e.target.style.display='none'} 
                      />
                      <QrCode className="w-5 h-5 text-white" />
                   </div>
                   <div>
                      <h2 className="text-white font-black tracking-tighter text-xl leading-none">TAKA TAKA</h2>
                      <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1">Votre transport, notre confort</p>
                   </div>
                </div>
                <button onClick={() => setSelectedTicket(null)} className="w-8 h-8 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors">
                   <X className="w-5 h-5" />
                </button>
             </div>

             <div className="mt-8 flex flex-col items-center">
                <div className="relative">
                   <div className="w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden ring-4 ring-white/10">
                      <img 
                        src={profileData.photo ? getImageUrl(profileData.photo) : profileData.avatar ? getImageUrl(profileData.avatar) : `https://ui-avatars.com/api/?name=${profileData.name}&background=00A88E&color=fff&size=200`} 
                        alt="Passager" 
                        className="w-full h-full object-cover" 
                      />
                   </div>
                   <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#00FFD1] text-[#005C97] rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                     <CheckCircle className="w-5 h-5" />
                   </div>
                </div>
                <h3 className="text-white text-xl font-black mt-4 uppercase tracking-tight">{profileData.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                   <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest">
                      <Users className="w-3 h-3 mr-1" /> Passager Vérifié
                   </Badge>
                </div>
             </div>
          </div>

          {/* Corps du Ticket (Effet papier coupé) */}
          <div className="bg-white dark:bg-[#0B1120] px-8 pt-8 pb-6 relative -mt-6 rounded-t-[3rem] z-20">
             {/* Trajet */}
             <div className="flex justify-between items-center mb-10 relative">
                <div className="flex-1 text-left">
                   <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Départ</p>
                   <h4 className="text-[13px] font-black text-[#005C97] dark:text-blue-400 leading-tight uppercase line-clamp-2 max-w-[120px]">{selectedTicket?.depart || "Point A"}</h4>
                </div>
                
                <div className="flex flex-col items-center px-2">
                   <div className="relative w-20 h-8 flex items-center justify-center">
                      <div className="absolute w-full h-[1.5px] bg-dashed border-t-2 border-dashed border-green-500/30 rounded-full"></div>
                      <div className="relative z-10 w-7 h-7 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-sm border border-green-100 dark:border-green-800">
                         <Car className="w-3 h-3 text-green-600" />
                      </div>
                   </div>
                   <p className="text-[9px] font-black text-green-600 uppercase mt-1">{selectedTicket?.distanceKm || 0} KM</p>
                </div>

                <div className="flex-1 text-right">
                   <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Destination</p>
                   <h4 className="text-[13px] font-black text-[#00A88E] dark:text-emerald-400 leading-tight uppercase line-clamp-2 max-w-[120px] ml-auto">{selectedTicket?.destination || "Point B"}</h4>
                </div>
             </div>

             {/* Infos Chauffeur Premium */}
             <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800/50 mb-8">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-gray-600 ring-4 ring-blue-500/5">
                        <img 
                          src={selectedTicket?.chauffeur?.photoUrl ? getFullAssetURL(selectedTicket.chauffeur.photoUrl) : `https://ui-avatars.com/api/?name=${selectedTicket?.chauffeur?.prenom || 'D'}+${selectedTicket?.chauffeur?.nom || ''}&background=005C97&color=fff`} 
                          alt="Chauffeur" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Votre Chauffeur</p>
                         <h5 className="text-base font-black text-gray-900 dark:text-white uppercase leading-none mt-1">
                            {selectedTicket?.chauffeur?.prenom} {selectedTicket?.chauffeur?.nom}
                         </h5>
                         <div className="flex items-center mt-1 text-yellow-500">
                            <Star className="w-3 h-3 fill-current" />
                            <span className="text-[11px] font-black ml-1">4.9 EXCELLENT</span>
                         </div>
                      </div>
                   </div>
                   <a href={`tel:${selectedTicket?.chauffeur?.telephone || ''}`} className="w-12 h-12 bg-[#00A88E] hover:bg-[#008f79] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all active:scale-95">
                      <Phone className="w-5 h-5" />
                   </a>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                   <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600"><Smartphone className="w-4 h-4" /></div>
                      <div>
                         <p className="text-[9px] font-bold text-gray-400 uppercase">Véhicule</p>
                         <p className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase truncate">{selectedTicket?.vehicule?.marque} {selectedTicket?.vehicule?.modele}</p>
                      </div>
                   </div>
                   <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600"><Award className="w-4 h-4" /></div>
                      <div>
                         <p className="text-[9px] font-bold text-gray-400 uppercase">Plaque</p>
                         <p className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase">{selectedTicket?.vehicule?.immatriculation}</p>
                      </div>
                   </div>
                </div>
             </div>

             {/* QR CODE FINAL */}
             <div className="flex flex-col items-center">
                <div className="p-5 bg-white dark:bg-white rounded-[2rem] shadow-xl border-4 border-gray-50 dark:border-gray-800 scale-105">
                   <img src={selectedTicket?.qrCodeBase64} alt="QR Code" className="w-40 h-40" />
                </div>
                <div className="mt-4 text-center">
                   <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Code de validation</p>
                   <p className="text-xl font-black text-[#005C97] dark:text-blue-400 tracking-tighter mt-1">{selectedTicket?.codeUnique?.split('-')[1] || "XXXX"}</p>
                </div>
             </div>

             <div className="mt-8 flex justify-between items-center py-4 border-t-2 border-dashed border-gray-100 dark:border-gray-800">
                <div className="flex items-center space-x-2">
                   <Clock className="w-5 h-5 text-gray-400" />
                   <div>
                      <p className="text-[9px] font-bold text-gray-400 uppercase">Durée estimée</p>
                      <p className="text-sm font-black text-gray-900 dark:text-white">{selectedTicket?.dureeMin || 0} MIN</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Prix Total</p>
                   <p className="text-2xl font-black text-[#00A88E] leading-none">{(selectedTicket?.prix || 0).toLocaleString()} <span className="text-sm">GNF</span></p>
                </div>
             </div>

             {/* Message de sécurité important */}
             <div className="mt-6 flex items-start space-x-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
                <p className="text-[9px] font-bold text-red-800 dark:text-red-400 leading-relaxed uppercase tracking-wide">
                   Pour votre sécurité, vérifiez toujours que la plaque d'immatriculation correspond à celle affichée sur ce ticket avant de monter à bord.
                </p>
             </div>

             <Button variant="primary" fullWidth onClick={handleDownloadTicket} className="mt-8 h-14 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-emerald-500/20" icon={Download}>
                Télécharger le reçu
             </Button>
          </div>
          
          {/* Footer "Cut" effect */}
          <div className="h-6 bg-white dark:bg-[#0B1120] relative">
             <div className="absolute top-0 left-0 w-full h-full flex justify-between px-2 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                   <div key={i} className="w-4 h-4 bg-gray-50 dark:bg-gray-950 rounded-full -mt-2"></div>
                ))}
             </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Profile;