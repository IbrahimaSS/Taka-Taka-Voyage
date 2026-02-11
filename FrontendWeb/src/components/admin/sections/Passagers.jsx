// src/components/sections/Users.jsx - VERSION MODERNE
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Eye, Ban, Star, MoreVertical,
  UserCheck, Mail, Calendar, Activity, ChevronDown, Printer, Share2,
  Filter, UserPlus, Download
} from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Table, { TableRow, TableCell } from '../ui/Table';
import Button from '../ui/Bttn';
import Modal from '../ui/Modal';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import ExportDropdown from '../ui/ExportDropdown';
import useUsers from '../../../hooks/usePassager';

const Users = ({ showToast }) => {
  // États principaux
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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

  // États pour les filtres
  const [selectedFilters, setSelectedFilters] = useState({
    status: 'all',
    dateRange: 'all'
  });

  // États pour les menus déroulants
  const [openMenuId, setOpenMenuId] = useState(null);

  // Réf pour fermer les menus au clic externe
  const menuRefs = useRef({});

  // Données des utilisateurs
  // TODO API (admin/passagers):
  // Remplacer ces donnees simulees par un fetch via passengerService/adminService
  // Exemple: GET API_ROUTES.passengers.list
  const usersData = [
    {
      id: 1,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.com',
      phone: '+33 6 12 34 56 78',
      role: 'passenger',
      city: 'Paris',
      rating: 4.8,
      joinDate: '15/03/2024',
      lastActive: '2024-05-15',
      trips: 42,
      status: 'active',
      initials: 'JD',
      color: 'from-green-500 to-blue-700',
      address: '12 Rue de la Paix, Paris',
      subscription: 'Premium',
      totalSpent: 1245.50,
      documents: ['ID_Card.pdf', 'Selfie.jpg']
    },
    {
      id: 2,
      name: 'Marie Koné',
      email: 'marie.kone@email.com',
      phone: '+33 6 23 45 67 89',
      role: 'driver',
      city: 'Lyon',
      rating: 4.5,
      joinDate: '22/04/2024',
      lastActive: '2024-05-10',
      trips: 18,
      status: 'inactive',
      initials: 'MK',
      color: 'from-green-500 to-blue-700',
      address: '45 Rue Bellecour, Lyon',
      subscription: 'Standard',
      totalSpent: 856.30,
      documents: ['License.pdf', 'Insurance.pdf']
    },
    {
      id: 3,
      name: 'Alice Traoré',
      email: 'alice.traore@email.com',
      phone: '+33 6 34 56 78 90',
      role: 'passenger',
      city: 'Marseille',
      rating: 4.9,
      joinDate: '28/02/2024',
      lastActive: '2024-05-18',
      trips: 63,
      status: 'active',
      initials: 'AT',
      color: 'from-green-500 to-blue-700',
      address: '78 Rue Canebière, Marseille',
      subscription: 'Premium',
      totalSpent: 2345.75,
      documents: ['ID_Card.pdf']
    },
    {
      id: 4,
      name: 'Pierre Martin',
      email: 'pierre.martin@email.com',
      phone: '+33 6 45 67 89 01',
      role: 'driver',
      city: 'Paris',
      rating: 4.2,
      joinDate: '10/01/2024',
      lastActive: '2024-05-20',
      trips: 25,
      status: 'active',
      initials: 'PM',
      color: 'from-green-500 to-blue-700',
      address: '3 Avenue des Champs-Élysées, Paris',
      subscription: 'Pro',
      totalSpent: 1890.20,
      documents: ['License.pdf', 'Registration.pdf', 'Insurance.pdf']
    },
    {
      id: 5,
      name: 'Sophie Bernard',
      email: 'sophie.bernard@email.com',
      phone: '+33 6 56 78 90 12',
      role: 'passenger',
      city: 'Toulouse',
      rating: 4.7,
      joinDate: '05/05/2024',
      lastActive: '2024-05-19',
      trips: 8,
      status: 'active',
      initials: 'SB',
      color: 'from-green-500 to-blue-700',
      address: '22 Place du Capitole, Toulouse',
      subscription: 'Standard',
      totalSpent: 345.90,
      documents: []
    },
    {
      id: 6,
      name: 'Thomas Dubois',
      email: 'thomas.dubois@email.com',
      phone: '+33 6 67 89 01 23',
      role: 'driver',
      city: 'Bordeaux',
      rating: 4.6,
      joinDate: '18/04/2024',
      lastActive: '2024-05-16',
      trips: 32,
      status: 'active',
      initials: 'TD',
      color: 'from-green-500 to-blue-700',
      address: '15 Cours de l\'Intendance, Bordeaux',
      subscription: 'Pro',
      totalSpent: 1678.40,
      documents: ['License.pdf', 'Insurance.pdf']
    },
    {
      id: 7,
      name: 'Camille Petit',
      email: 'camille.petit@email.com',
      phone: '+33 6 78 90 12 34',
      role: 'passenger',
      city: 'Lille',
      rating: 4.4,
      joinDate: '30/03/2024',
      lastActive: '2024-05-14',
      trips: 15,
      status: 'inactive',
      initials: 'CP',
      color: 'from-green-500 to-blue-700',
      address: '8 Rue de la Monnaie, Lille',
      subscription: 'Premium',
      totalSpent: 567.30,
      documents: ['ID_Card.pdf']
    },
    {
      id: 8,
      name: 'Mohamed Ali',
      email: 'mohamed.ali@email.com',
      phone: '+33 6 89 01 23 45',
      role: 'driver',
      city: 'Nice',
      rating: 4.9,
      joinDate: '12/02/2024',
      lastActive: '2024-05-21',
      trips: 47,
      status: 'active',
      initials: 'MA',
      color: 'from-green-500 to-blue-700',
      address: '5 Promenade des Anglais, Nice',
      subscription: 'Premium',
      totalSpent: 2456.80,
      documents: ['License.pdf', 'Registration.pdf', 'Insurance.pdf', 'Technical.pdf']
    }
  ];

  const { users, toggleStatus } = useUsers(usersData);

  const exportColumns = useMemo(() => [
    { header: 'Nom', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Téléphone', accessor: 'phone' },
    {
      header: 'Rôle',
      accessor: 'role',
      formatter: (v) => v === 'driver' ? 'Conducteur' : 'Passager',
    },
    { header: 'Ville', accessor: 'city' },
    { header: 'Statut', accessor: 'status' },
    { header: 'Trajets', accessor: (u) => u.trips ?? 0 },
    { header: 'Note', accessor: (u) => u.rating ?? '-' },
    { header: 'Inscription', accessor: 'joinDate' },
  ], []);

  // Statistiques
  const stats = [
    {
      title: 'Utilisateurs actifs',
      value: '1,842',
      icon: UserCheck,
      color: 'green',
      trend: 'up',
      percentage: 12,
      progress: 75,
      description: '+12% ce mois'
    },
    {
      title: 'Nouveaux ce mois',
      value: '127',
      icon: Activity,
      color: 'blue',
      trend: 'up',
      percentage: 8,
      progress: 65,
      description: '+8% vs dernier mois'
    },
    {
      title: 'Note moyenne',
      value: '4.7/5',
      icon: Star,
      color: 'purple',
      trend: 'stable',
      percentage: 0,
      progress: 94,
      description: 'Basé sur 12.4k avis'
    }
  ];

  useEffect(() => {
    let result = [...users];

    // Recherche textuelle
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user =>
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term) ||
        user.phone.toLowerCase().includes(term) ||
        user.city.toLowerCase().includes(term)
      );
    }

    // Filtre par statut
    if (selectedFilters.status && selectedFilters.status !== 'all') {
      result = result.filter(user => user.status === selectedFilters.status);
    }

    setFilteredUsers(result);
    setCurrentPage(1);
  }, [searchTerm, selectedFilters, users]);

  // Gestion du menu déroulant
  const toggleMenu = (userId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === userId ? null : userId);
  };

  // Actions utilisateur
  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
    setOpenMenuId(null);
  };

  const handleToggleStatus = (user) => {
    // TODO API (admin/passagers):
    // Remplacer la maj locale par un appel backend (ex: PATCH /passengers/:id/status)
    setConfirmModal({
      isOpen: true,
      title: user.status === 'active' ? 'Désactiver l\'utilisateur' : 'Activer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir ${user.status === 'active' ? 'désactiver' : 'activer'} ${user.name} ?`,
      type: user.status === 'active' ? 'warning' : 'validate',
      confirmText: user.status === 'active' ? 'Désactiver' : 'Activer',
      destructive: user.status === 'active',
      onConfirm: () => {
        const updated = toggleStatus(user.id);
        setSelectedUser(prev => (prev && prev.id === user.id ? updated : prev));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
    setOpenMenuId(null);
  };

  const handleSendEmail = (user) => {
    const subject = encodeURIComponent('Contact Taka Taka');
    const body = encodeURIComponent(`Bonjour ${user.name},\n\n`);
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
        text: `Liste de ${filteredUsers.length} utilisateurs`,
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
      case 'active':
        return (
          <span className="status-badge-success">
            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
            Actif
          </span>
        );
      case 'inactive':
        return (
          <span className="status-badge-warning">
            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
            Inactif
          </span>
        );
      default:
        return null;
    }
  };

  const getTimeAgo = (dateString) => {
    const [day, month, year] = dateString.split('/');
    const date = new Date(year, month - 1, day);
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
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">Statuts</option>
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
            </div>

            {/* Filtre Date */}
            <div className="relative">
              <select
                className="form-input appearance-none pl-10 dark:bg-gray-800 "
                value={selectedFilters.dateRange}
                onChange={(e) => setSelectedFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              >
                <option value="all">Dates</option>
                <option value="today">Aujourd'hui</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5 pointer-events-none" />
            </div>

            {/* Export */}
            <ExportDropdown
              data={filteredUsers}
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
                {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''} trouvé{filteredUsers.length > 1 ? 's' : ''}
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
            {filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.color} flex items-center justify-center mr-3`}>
                      <span className="text-white font-bold text-sm">{user.initials}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-100">{user.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-gray-800 dark:text-gray-100">{user.trips}</div>
                </TableCell>
                <TableCell>
                  <div className="text-gray-800 dark:text-gray-100">{user.joinDate}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getTimeAgo(user.joinDate)}
                  </div>
                </TableCell>
                <TableCell>
                  {getStatusBadge(user.status)}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end dark:bg-gray-800 dark:border-gray-900 hover">
                    <div className="relative" ref={el => menuRefs.current[user.id] = el}>
                      <Button
                        variant="ghost"
                        size="small"
                        icon={MoreVertical}
                        onClick={(e) => toggleMenu(user.id, e)}
                      />
                      <AnimatePresence>
                        {openMenuId === user.id && (
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
                                {user.status === 'active' ? (
                                  <Ban className="w-4 h-4 mr-3 text-amber-500" />
                                ) : (
                                  <UserCheck className="w-4 h-4 mr-3 text-emerald-500" />
                                )}
                                {user.status === 'active' ? 'Désactiver' : 'Activer'}
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
          {filteredUsers.length > 0 && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(filteredUsers.length / pageSize)}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                totalItems={filteredUsers.length}
              />
            </div>
          )}

          {/* Aucun résultat */}
          {filteredUsers.length === 0 && (
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
        title={selectedUser ? `Détails de ${selectedUser.name}` : ''}
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-6">
              <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${selectedUser.color} flex items-center justify-center`}>
                <span className="text-white text-3xl font-bold">{selectedUser.initials}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{selectedUser.name}</h3>
                  {getStatusBadge(selectedUser.status)}
                </div>
                <p className="text-gray-600 dark:text-gray-300">{selectedUser.email}</p>
                <p className="text-gray-600 dark:text-gray-300">{selectedUser.phone}</p>
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
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-900">{selectedUser.trips}</div>
                <div className="text-sm text-gray-500 dark:text-gray-900">Trajets effectués</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:bg-gray-900 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center">
                  <Star className="w-5 h-5 text-amber-400 fill-current mr-1" />
                  <span className="text-2xl font-bold text-gray-800 dark:text-gray-900">{selectedUser.rating}</span>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-900">Note moyenne</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
                <div className="text-2xl font-bold text-gray-800 dark:text-gray-900">
                  {selectedUser.totalSpent ? `${selectedUser.totalSpent.toLocaleString()} GNF` : '0 GNF'}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-900">Total dépensé</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-700 dark:text-gray-200 mb-3">Informations personnelles</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Date d'inscription:</span>
                    <span className="font-medium">{selectedUser.joinDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Dernière activité:</span>
                    <span className="font-medium">{getTimeAgo(selectedUser.lastActive)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Ville:</span>
                    <span className="font-medium">{selectedUser.city}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-900">
              <Button
                variant={selectedUser.status === 'active' ? 'warning' : 'success'}
                icon={selectedUser.status === 'active' ? Ban : UserCheck}
                onClick={() => handleToggleStatus(selectedUser)}
              >
                {selectedUser.status === 'active' ? 'Désactiver' : 'Activer'}
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
      />
    </div>
  );
};

export default Users;
