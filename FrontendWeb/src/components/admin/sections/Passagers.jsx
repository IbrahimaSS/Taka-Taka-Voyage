// src/components/sections/Passagers.jsx - VERSION MODERNE
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, Ban, Star, MoreVertical,
  UserCheck, Mail, Calendar, Activity, ChevronDown, Printer, Share2,
  Filter, UserPlus, Download, CalendarDays
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Button from '../ui/Bttn';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import ExportDropdown from '../ui/ExportDropdown';
import { adminService } from '../../../services/adminService';

import { useTranslation } from 'react-i18next';

const Users = ({ showToast }) => {
  const { t, i18n } = useTranslation();
  // États principaux
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // États pour les modals
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // États pour les confirmations
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null,
    confirmText: t('common.confirm') || 'Confirmer',
    destructive: false,
  });
  const [confirmLoading, setConfirmLoading] = useState(false);

  // États pour les filtres
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    dateRange: 'all'
  });

  // États pour les menus déroulants
  const [openMenuId, setOpenMenuId] = useState(null);

  // Stats
  const [statsData, setStatsData] = useState(null);

  // Réf pour fermer les menus au clic externe
  const menuRefs = useRef({});

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Data
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, pageSize, debouncedSearchTerm, selectedFilters]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: pageSize,
        search: debouncedSearchTerm,
        statut: selectedFilters.status !== 'all' ? selectedFilters.status : undefined,
        dateRange: selectedFilters.dateRange !== 'all' ? selectedFilters.dateRange : undefined,
      };

      const response = await adminService.getPassengers(params);
      if (response.data.succes) {
        setUsers(response.data.utilisateurs.map(u => ({
          ...u,
          // S'assurer que les champs sont bien mappés si le backend change
          photoUrl: u.photoUrl,
          status: u.statut
        })));
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Erreur chargement passagers:', error);
      showToast(t('common.error') || 'Erreur', t('passengers.error_loading') || 'Impossible de charger les passagers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminService.getPassengerStats();
      if (response.data.succes) {
        setStatsData(response.data.stats);
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  const exportColumns = useMemo(() => [
    { header: t('common.name') || 'Nom', accessor: (u) => `${u.prenom} ${u.nom}` },
    { header: 'Email', accessor: 'email' },
    { header: t('common.phone') || 'Téléphone', accessor: 'telephone' },
    { header: t('common.city') || 'Ville', accessor: (u) => u.localisation?.adresse || 'N/A' },
    { header: t('common.status') || 'Statut', accessor: 'statut' },
    { header: t('nav.trajets') || 'Trajets', accessor: (u) => u.nombreTrajets || 0 },
    { header: t('common.note') || 'Note', accessor: (u) => u.noteMoyenne || '-' },
    { header: t('common.registration') || 'Inscription', accessor: (u) => new Date(u.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US') },
  ], [t, i18n.language]);

  // Statistiques
  const stats = [
    {
      title: t('passengers.active_users') || 'Utilisateurs actifs',
      value: statsData?.utilisateursActifs?.toLocaleString() || '0',
      icon: UserCheck,
      color: 'green',
    },
    {
      title: t('passengers.new_this_month') || 'Nouveaux ce mois',
      value: statsData?.nouveauxCeMois?.toLocaleString() || '0',
      icon: Activity,
      color: 'blue',
    },
    {
      title: t('passengers.average_rating') || 'Note moyenne',
      value: statsData?.noteMoyenneGlobale ? `${statsData.noteMoyenneGlobale}/5` : '0',
      icon: Star,
      color: 'purple',
    }
  ];

  // Gestion du menu déroulant
  const toggleMenu = (userId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === userId ? null : userId);
  };


  // Actions utilisateur
  const handleViewDetails = async (user) => {
    try {
      const response = await adminService.getPassengerDetails(user._id);
      if (response.data.succes) {
        setSelectedUser(response.data.utilisateur);
        setIsDetailModalOpen(true);
        setOpenMenuId(null);
      }
    } catch (error) {
      showToast(t('common.error') || 'Erreur', t('common.error_loading_details') || 'Impossible de charger les détails', 'error');
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    setIsDetailModalOpen(false);
    setConfirmModal({
      isOpen: true,
      title: user.statut === 'ACTIF' ? (t('passengers.deactivate_user') || "Désactiver l'utilisateur") : (t('passengers.activate_user') || "Activer l'utilisateur"),
      message: t('passengers.confirm_status_change', { action: user.statut === 'ACTIF' ? (t('common.deactivate') || 'désactiver') : (t('common.activate') || 'activer'), name: `${user.prenom} ${user.nom}` }) || `Êtes-vous sûr de vouloir ${user.statut === 'ACTIF' ? 'désactiver' : 'activer'} ${user.prenom} ${user.nom} ?`,
      type: user.statut === 'ACTIF' ? 'warning' : 'validate',
      confirmText: user.statut === 'ACTIF' ? (t('common.deactivate') || 'Désactiver') : (t('common.activate') || 'Activer'),
      destructive: user.statut === 'ACTIF',
      onConfirm: async () => {
        try {
          setConfirmLoading(true);
          await adminService.updatePassengerStatus(user._id, newStatus);
          showToast(t('common.success') || 'Succès', t('passengers.status_updated', { status: newStatus === 'ACTIF' ? (t('common.activated') || 'activé') : (t('common.deactivated') || 'désactivé') }) || `Utilisateur ${newStatus === 'ACTIF' ? 'activé' : 'désactivé'}`, 'success');
          fetchUsers(); // Rafraichir la liste
          if (selectedUser && selectedUser._id === user._id) {
            setSelectedUser(prev => ({ ...prev, statut: newStatus }));
          }
        } catch (error) {
          showToast(t('common.error') || 'Erreur', t('common.error_update_status') || 'Impossible de modifier le statut', 'error');
        } finally {
          setConfirmLoading(false);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          setOpenMenuId(null);
        }
      }
    });
  };

  const handleSendEmail = (user) => {
    const subject = encodeURIComponent('Contact Taka Taka');
    const body = encodeURIComponent(`Bonjour ${user.prenom},\n\n`);
    const mailto = `mailto:${user.email}?subject=${subject}&body=${body}`;
    window.location.href = mailto;
    setOpenMenuId(null);
  };

  const handlePrint = () => {
    window.print();
    showToast(t('common.print') || 'Impression', t('common.preparing_print') || "Préparation de l'impression...", 'info');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Liste des utilisateurs Taka Taka',
        text: `Liste de ${users.length} utilisateurs`,
        url: window.location.href
      });
    } else {
      showToast(t('common.share') || 'Partage', t('common.url_copied') || 'URL copiée dans le presse-papier', 'info');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Fonctions utilitaires
  const getStatusBadge = (status) => {
    const config = {
      'ACTIF': { label: t('common.active') || 'Actif', bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' },
      'INACTIF': { label: t('common.inactive') || 'Inactif', bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-500 dark:text-red-400', dot: 'bg-red-400' },
      'SUSPENDU': { label: t('common.suspended') || 'Suspendu', bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' }
    };
    const { label, bg, text, dot } = config[status] || config.INACTIF;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg} ${text}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dot}`}></span>
        {label}
      </span>
    );
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return t('common.never') || 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return t('common.today') || "Aujourd'hui";
    if (diffDays === 1) return t('common.yesterday') || 'Hier';
    if (diffDays < 7) return t('common.days_ago', { count: diffDays }) || `Il y a ${diffDays} jours`;
    if (diffDays < 30) return t('common.weeks_ago', { count: Math.floor(diffDays / 7) }) || `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return t('common.months_ago', { count: Math.floor(diffDays / 30) }) || `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">{t('passengers.title') || 'Gestion des passagers'}</h1>
          <p className="text-gray-500 dark:text-gray-400">{t('passengers.subtitle') || 'Gérez les utilisateurs de la plateforme Taka Taka'}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={Printer}
            onClick={handlePrint}
            size="small"
          >
            {t('common.print') || 'Imprimer'}
          </Button>
          <Button
            variant="secondary"
            icon={Share2}
            onClick={handleShare}
            size="small"
          >
            {t('common.share') || 'Partager'}
          </Button>
        </div>
      </motion.div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <StatCard key={index} {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Recherche */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400  w-5 h-5 " />
                <input
                  type="text"
                  placeholder={`${t('common.search') || 'Rechercher'}...`}
                  className="form-input pl-10 dark:bg-gray-800"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Filtre Statut */}
            <div className="relative">
              <select
                className="form-input appearance-none pr-10 dark:bg-gray-800"
                value={selectedFilters.status}
                onChange={(e) => {
                  setSelectedFilters(prev => ({ ...prev, status: e.target.value }));
                  setCurrentPage(1);
                }}
              >
                <option value="all">{t('common.status') || 'Statuts'}</option>
                <option value="ACTIF">{t('common.active') || 'Actif'}</option>
                <option value="INACTIF">{t('common.inactive') || 'Inactif'}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
            </div>

            {/* Filtre Dates */}
            <div className="relative">
              <CalendarDays className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              <select
                className="form-input appearance-none pl-10 pr-10 dark:bg-gray-800"
                value={selectedFilters.dateRange}
                onChange={(e) => {
                  setSelectedFilters(prev => ({ ...prev, dateRange: e.target.value }));
                  setCurrentPage(1);
                }}
              >
                <option value="all">{t('common.dates') || 'Dates'}</option>
                <option value="today">{t('common.today') || "Aujourd'hui"}</option>
                <option value="7days">{t('common.last_7_days') || '7 derniers jours'}</option>
                <option value="30days">{t('common.last_30_days') || '30 derniers jours'}</option>
                <option value="3months">{t('common.last_3_months') || '3 derniers mois'}</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
            </div>

            {/* Export */}
            <ExportDropdown
              data={users}
              columns={exportColumns}
              fileName="utilisateurs_taka_taka"
              title={t('passengers.export_title') || 'Liste des utilisateurs - Taka Taka'}
              showToast={showToast}
              onPrint={handlePrint}
              onShare={handleShare}
              className=''
            />
          </div>
        </CardContent>
      </Card>

      {/* Tableau des utilisateurs */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>{t('passengers.list_title') || 'Liste des utilisateurs'}</CardTitle>
              <CardDescription>
                {t('passengers.found_count', { count: totalItems }) || `${totalItems} utilisateur${totalItems > 1 ? 's' : ''} trouvé${totalItems > 1 ? 's' : ''}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">{t('common.display') || 'Affichage'}:</span>
              <select
                className="form-input text-sm py-1 dark:bg-gray-800"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>{t('common.per_page', { count: 5 }) || '5 par page'}</option>
                <option value={10}>{t('common.per_page', { count: 10 }) || '10 par page'}</option>
                <option value={25}>{t('common.per_page', { count: 25 }) || '25 par page'}</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tableau */}
          <Table headers={[t('common.user') || 'Utilisateur', t('nav.trajets') || 'Trajets', t('common.registration') || 'Inscription', t('common.status') || 'Statut', 'Actions']}>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center mr-3 overflow-hidden shadow-sm border border-white dark:border-gray-700">
                      {user.photoUrl && user.photoUrl !== '' ? (
                        <img
                          src={user.photoUrl.startsWith('http') ? user.photoUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.photoUrl.startsWith('/') ? '' : '/'}${user.photoUrl}`}
                          alt={`${user.prenom} ${user.nom}`}
                          className="w-full h-full object-cover z-10"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            // On montre le span de secours si l'image échoue
                            const span = e.target.parentElement.querySelector('.avatar-initials');
                            if (span) span.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <span
                        className="avatar-initials text-white font-bold text-xs uppercase"
                        style={{ display: user.photoUrl && user.photoUrl !== '' ? 'none' : 'flex' }}
                      >
                        {user.prenom?.[0]}{user.nom?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{user.prenom} {user.nom}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-gray-800 dark:text-gray-100">{user.nombreTrajets || 0}</div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-800 dark:text-gray-100">{new Date(user.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getTimeAgo(user.createdAt)}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(user.statut)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end dark:bg-gray-800 dark:border-gray-900 hover">
                    <div className="relative" ref={el => menuRefs.current[user._id] = el}>
                      <Button
                        variant="ghost"
                        size="small"
                        icon={MoreVertical}
                        onClick={(e) => toggleMenu(user._id, e)}
                      />
                      <AnimatePresence>
                        {openMenuId === user._id && (
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-900 z-40"
                          >
                            <div className="py-1">
                              <button
                                onClick={() => handleViewDetails(user)}
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
                              >
                                <Eye className="w-4 h-4 mr-3 text-blue-500" />
                                {t('common.view_details') || 'Voir les détails'}
                              </button>
                              <button
                                onClick={() => handleToggleStatus(user)}
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
                              >
                                {user.statut === 'ACTIF' ? (
                                  <Ban className="w-4 h-4 mr-3 text-amber-500" />
                                ) : (
                                  <UserCheck className="w-4 h-4 mr-3 text-emerald-500" />
                                )}
                                {user.statut === 'ACTIF' ? (t('common.deactivate') || 'Désactiver') : (t('common.activate') || 'Activer')}
                              </button>
                              <button
                                onClick={() => handleSendEmail(user)}
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
                              >
                                <Mail className="w-4 h-4 mr-3 text-purple-500" />
                                {t('common.send_email') || 'Envoyer un email'}
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>

          {/* Pagination */}
          {users.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(totalItems / pageSize)}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                totalItems={totalItems}
              />
            </div>
          )}

          {/* Aucun résultat */}
          {users.length === 0 && !loading && (
            <div className="text-center py-12">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">{t('common.no_user_found') || 'Aucun utilisateur trouvé'}</h3>
              <p className="text-gray-500 dark:text-gray-400">{t('common.no_user_match') || 'Aucun utilisateur ne correspond à vos critères de recherche.'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détail utilisateur */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedUser ? (t('passengers.details_title', { name: `${selectedUser.prenom} ${selectedUser.nom}` }) || `Détails de ${selectedUser.prenom} ${selectedUser.nom}`) : ''}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center overflow-hidden`}>
                {selectedUser.photoUrl ? (
                  <img src={selectedUser.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-white text-3xl font-bold">{selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}</span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedUser.prenom} {selectedUser.nom}</h3>
                  {getStatusBadge(selectedUser.statut)}
                </div>
                <p className="text-gray-600 dark:text-gray-300">{selectedUser.email}</p>
                <p className="text-gray-600 dark:text-gray-300">{selectedUser.telephone}</p>
              </div>
              <Button
                variant="ghost"
                icon={Mail}
                onClick={() => handleSendEmail(selectedUser)}
              >
                {t('common.contact') || 'Contacter'}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedUser.nombreTrajets || 0}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('nav.trajets') || 'Trajets effectués'}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400 fill-current mr-1" />
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedUser.noteMoyenne || '-'}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('passengers.average_rating') || 'Note moyenne'}</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {selectedUser.totalDepense ? `${selectedUser.totalDepense.toLocaleString()} ${t('common.currency_symbol') || 'GNF'}` : '-'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('passengers.total_spent') || 'Total dépensé'}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">{t('common.personal_info') || 'Informations personnelles'}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('common.registration_date') || "Date d'inscription"}:</span>
                    <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{t('common.last_activity') || 'Dernière activité'}:</span>
                    <span className="font-medium">{getTimeAgo(selectedUser.updatedAt)}</span>
                  </div>

                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-900">
              <Button
                variant={selectedUser.statut === 'ACTIF' ? 'warning' : 'success'}
                icon={selectedUser.statut === 'ACTIF' ? Ban : UserCheck}
                onClick={() => handleToggleStatus(selectedUser)}
              >
                {selectedUser.statut === 'ACTIF' ? (t('common.deactivate') || 'Désactiver') : (t('common.activate') || 'Activer')}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de confirmation */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText={confirmModal.confirmText}
        cancelText={t('common.cancel') || 'Annuler'}
        destructive={confirmModal.destructive}
        loading={confirmLoading}
      />
    </div>
  );
};

export default Users;
