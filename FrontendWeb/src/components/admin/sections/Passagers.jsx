// src/components/sections/Passagers.jsx - VERSION MODERNE
import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { Star, UserCheck, Activity, Printer, Share2 } from 'lucide-react';
import StatCard from '../layout/StatCard';
import Card, { CardHeader, CardTitle, CardContent, CardDescription } from '../ui/Card';
import Button from '../ui/Bttn';
import ConfirmModal from '../ui/ConfirmModal';
import { adminService } from '../../../services/adminService';
import { useTranslation } from 'react-i18next';
import PassengersFilterBar from './passagers/PassengersFilterBar';
import PassengersTable from './passagers/PassengersTable';
import UserDetailsModal from './passagers/UserDetailsModal';

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

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({ ...prev, [filterType]: value }));
    setCurrentPage(1);
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
      <PassengersFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedFilters={selectedFilters}
        onFilterChange={handleFilterChange}
        users={users}
        exportColumns={exportColumns}
        showToast={showToast}
        onPrint={handlePrint}
        onShare={handleShare}
        t={t}
      />

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
          <PassengersTable
            users={users}
            loading={loading}
            currentPage={currentPage}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            openMenuId={openMenuId}
            onToggleMenu={toggleMenu}
            onViewDetails={handleViewDetails}
            onToggleStatus={handleToggleStatus}
            onSendEmail={handleSendEmail}
            menuRefs={menuRefs}
          />
        </CardContent>
      </Card>

      {/* Modal de détail utilisateur */}
      <UserDetailsModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        user={selectedUser}
        onToggleStatus={handleToggleStatus}
        onSendEmail={handleSendEmail}
      />

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
