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

const Users = ({ showToast }) => {
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
    confirmText: 'Confirmer',
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
        setUsers(response.data.utilisateurs);
        setTotalItems(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Erreur chargement passagers:', error);
      showToast('Erreur', 'Impossible de charger les passagers', 'error');
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
    { header: 'Nom', accessor: (u) => `${u.prenom} ${u.nom}` },
    { header: 'Email', accessor: 'email' },
    { header: 'Téléphone', accessor: 'telephone' },
    { header: 'Ville', accessor: (u) => u.localisation?.adresse || 'N/A' },
    { header: 'Statut', accessor: 'statut' },
    { header: 'Trajets', accessor: (u) => u.nombreTrajets || 0 },
    { header: 'Note', accessor: (u) => u.noteMoyenne || '-' },
    { header: 'Inscription', accessor: (u) => new Date(u.createdAt).toLocaleDateString() },
  ], []);

  // Statistiques
  const stats = [
    {
      title: 'Utilisateurs actifs',
      value: statsData?.utilisateursActifs?.toLocaleString() || '0',
      icon: UserCheck,
      color: 'green',

    },
    {
      title: 'Nouveaux ce mois',
      value: statsData?.nouveauxCeMois?.toLocaleString() || '0',
      icon: Activity,
      color: 'blue',

    },
    {
      title: 'Note moyenne',
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
      showToast('Erreur', 'Impossible de charger les détails', 'error');
    }
  };

  const handleToggleStatus = (user) => {
    const newStatus = user.statut === 'ACTIF' ? 'INACTIF' : 'ACTIF';
    setIsDetailModalOpen(false);
    setConfirmModal({
      isOpen: true,
      title: user.statut === 'ACTIF' ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir ${user.statut === 'ACTIF' ? 'désactiver' : 'activer'} ${user.prenom} ${user.nom} ?`,
      type: user.statut === 'ACTIF' ? 'warning' : 'validate',
      confirmText: user.statut === 'ACTIF' ? 'Désactiver' : 'Activer',
      destructive: user.statut === 'ACTIF',
      onConfirm: async () => {
        try {
          setConfirmLoading(true);
          await adminService.updatePassengerStatus(user._id, newStatus);
          showToast('Succès', `Utilisateur ${newStatus === 'ACTIF' ? 'activé' : 'désactivé'}`, 'success');
          fetchUsers(); // Rafraichir la liste
          if (selectedUser && selectedUser._id === user._id) {
            setSelectedUser(prev => ({ ...prev, statut: newStatus }));
          }
        } catch (error) {
          showToast('Erreur', 'Impossible de modifier le statut', 'error');
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
    showToast('Impression', 'Préparation de l\'impression...', 'info');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Liste des utilisateurs Taka Taka',
        text: `Liste de ${users.length} utilisateurs`,
        url: window.location.href
      });
    } else {
      showToast('Partage', 'URL copiée dans le presse-papier', 'info');
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // Fonctions utilitaires
  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIF':
        return (
          <span className="status-badge-success">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            Actif
          </span>
        );
      case 'INACTIF':
      case 'SUSPENDU':
        return (
          <span className="status-badge-warning">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Inactif
          </span>
        );
      default:
        return (
          <span className="status-badge-gray">
            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
            {status}
          </span>
        );
    }
  };

  const getTimeAgo = (dateString) => {
    if (!dateString) return 'Jamais';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-gray-100">Gestion des passagers</h1>
          <p className="text-gray-500 dark:text-gray-400">Gérez les utilisateurs de la plateforme Taka Taka</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={Printer}
            onClick={handlePrint}
            size="small"
          >
            Imprimer
          </Button>
          <Button
            variant="secondary"
            icon={Share2}
            onClick={handleShare}
            size="small"
          >
            Partager
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
                  placeholder="Rechercher..."
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
                <option value="all">Statuts</option>
                <option value="ACTIF">Actif</option>
                <option value="INACTIF">Inactif</option>
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
                <option value="all">Dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="7days">7 derniers jours</option>
                <option value="30days">30 derniers jours</option>
                <option value="3months">3 derniers mois</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
            </div>

            {/* Export */}
            <ExportDropdown
              data={users}
              columns={exportColumns}
              fileName="utilisateurs_taka_taka"
              title="Liste des utilisateurs - Taka Taka"
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
              <CardTitle>Liste des utilisateurs</CardTitle>
              <CardDescription>
                {totalItems} utilisateur{totalItems > 1 ? 's' : ''} trouvé{totalItems > 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">Affichage:</span>
              <select
                className="form-input text-sm py-1 dark:bg-gray-800"
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value={5}>5 par page</option>
                <option value={10}>10 par page</option>
                <option value={25}>25 par page</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tableau */}
          <Table headers={['Utilisateur', 'Trajets', 'Inscription', 'Statut', 'Actions']}>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center mr-3 overflow-hidden`}>
                      {user.photoUrl ? (
                        <img src={user.photoUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-white font-bold text-sm">{user.prenom?.[0]}{user.nom?.[0]}</span>
                      )}
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
                  <div className="text-gray-800 dark:text-gray-100">{new Date(user.createdAt).toLocaleDateString()}</div>
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
                                Voir les détails
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
                                {user.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
                              </button>
                              <button
                                onClick={() => handleSendEmail(user)}
                                className="flex items-center w-full px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800"
                              >
                                <Mail className="w-4 h-4 mr-3 text-purple-500" />
                                Envoyer un email
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
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Aucun utilisateur trouvé</h3>
              <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur ne correspond à vos critères de recherche.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de détail utilisateur */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={selectedUser ? `Détails de ${selectedUser.prenom} ${selectedUser.nom}` : ''}
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
                Contacter
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedUser.nombreTrajets || 0}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Trajets effectués</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400 fill-current mr-1" />
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedUser.noteMoyenne || '-'}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Note moyenne</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  {selectedUser.totalDepense ? `${selectedUser.totalDepense.toLocaleString()} GNF` : '-'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total dépensé</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">Informations personnelles</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date d'inscription:</span>
                    <span className="font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Dernière activité:</span>
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
                {selectedUser.statut === 'ACTIF' ? 'Désactiver' : 'Activer'}
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
        cancelText="Annuler"
        destructive={confirmModal.destructive}
        loading={confirmLoading}
      />
    </div>
  );
};

export default Users;
