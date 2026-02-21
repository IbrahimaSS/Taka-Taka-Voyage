// src/components/profile/components/UserManagement.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Edit2, Eye, EyeOff, Trash2, MoreVertical, Phone, Calendar, Users, Check, Star, Filter, ShieldOff, ShieldCheck, RefreshCw, Loader2 } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Pagination from '../ui/Pagination';
import Table, { TableRow, TableCell } from '../ui/Table';
import ConfirmModal from '../ui/ConfirmModal';

const UserManagement = ({
  users = [],
  loading = false,
  onAddUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  onRefresh,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [userToBlock, setUserToBlock] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [itemsPerPage] = useState(5);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  // Filtrage des utilisateurs
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const getRoleBadge = (role) => {
    const config = {
      'Administrateur': { variant: 'admin', icon: '👑' },
      'Superviseur': { variant: 'supervisor', icon: '⭐' },
      'Agent': { variant: 'agent', icon: '👤' },
      'Analyste': { variant: 'info', icon: '📊' }
    };

    const roleConfig = config[role] || { variant: 'default', icon: '👤' };

    return (
      <Badge variant={roleConfig.variant} size="sm">
        {roleConfig.icon} {role}
      </Badge>
    );
  };

  const getStatusBadge = (status) => {
    const config = {
      'active': { variant: 'success', label: 'Actif', icon: ShieldCheck },
      'inactive': { variant: 'danger', label: 'Bloqué', icon: ShieldOff },
      'pending': { variant: 'warning', label: 'En attente', icon: null }
    };

    const statusConfig = config[status] || { variant: 'default', label: status, icon: null };
    const StatusIcon = statusConfig.icon;

    return (
      <Badge variant={statusConfig.variant} size="sm" className="flex items-center gap-1">
        {StatusIcon && <StatusIcon className="w-3 h-3" />}
        {statusConfig.label}
      </Badge>
    );
  };

  const handleConfirmBlock = () => {
    if (userToBlock) {
      onToggleStatus(userToBlock.id);
      setUserToBlock(null);
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete && onDeleteUser) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* En-tête avec filtres */}
        <Card hoverable className="border-2 border-gray-100 dark:border-gray-900 hover:border-blue-100 transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestion des personnels</h2>
                <p className="text-gray-600 dark:text-gray-300">Gérez les accès et permissions des membres de l'équipe</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {onRefresh && (
                  <Button
                    variant="outline"
                    icon={RefreshCw}
                    onClick={onRefresh}
                    disabled={loading}
                  >
                    Actualiser
                  </Button>
                )}
                <Button
                  variant="perso"
                  icon={Plus}
                  onClick={onAddUser}
                >
                  Ajouter un personnel
                </Button>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un personnel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="text-gray-400 dark:text-gray-500 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actif</option>
                  <option value="inactive">Bloqué</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <Users className="text-gray-400 dark:text-gray-500 w-5 h-5" />
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="flex-1 border-2 border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                >
                  <option value="all">Tous les rôles</option>
                  <option value="Administrateur">Administrateur</option>
                  <option value="Superviseur">Superviseur</option>
                  <option value="Agent">Agent</option>
                  <option value="Analyste">Analyste</option>
                </select>
              </div>


            </div>
          </CardContent>
        </Card>

        {/* Tableau des utilisateurs */}
        <Card className="border-2 border-gray-100 dark:border-gray-900">
          <CardContent className="p-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-4">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-gray-500 dark:text-gray-400">Chargement des personnels...</p>
              </div>
            ) : (
              <Table
                headers={['N°', 'Personnel', 'Rôle', 'Statut', 'Date d\'ajout', 'Actions']}
                className="min-w-full"
              >
                {currentUsers.length > 0 ? (
                  currentUsers.map((user, index) => (
                    <TableRow
                      key={user.id}
                      className={`hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${user.status === 'inactive' ? 'opacity-60' : ''}`}
                    >
                      {/* N° */}
                      <TableCell>
                        <span className="font-semibold text-gray-500 dark:text-gray-400">
                          {indexOfFirstItem + index + 1}
                        </span>
                      </TableCell>

                      {/* Personnel */}
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.status === 'active' ? 'from-blue-600 to-teal-600' : 'from-gray-400 to-gray-500'} flex items-center justify-center text-white font-bold text-sm`}>
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                            {user.phone && (
                              <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                                <Phone className="w-3 h-3" />{user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Rôle */}
                      <TableCell>
                        {getRoleBadge(user.role)}
                      </TableCell>

                      {/* Statut */}
                      <TableCell>
                        {getStatusBadge(user.status)}
                      </TableCell>

                      {/* Date d'ajout */}
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {user.joinDate}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {/* Modifier */}
                          <button
                            onClick={() => onEditUser(user)}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Bloquer / Débloquer */}
                          <button
                            onClick={() => setUserToBlock(user)}
                            className={`p-2 rounded-lg transition-colors ${user.status === 'active'
                                ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              }`}
                            title={user.status === 'active' ? 'Bloquer' : 'Débloquer'}
                          >
                            {user.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                          </button>

                          {/* Supprimer */}
                          <button
                            onClick={() => setUserToDelete(user)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-12">
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <Users className="w-16 h-16 text-gray-300" />
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm || statusFilter !== 'all' || roleFilter !== 'all'
                            ? 'Aucun personnel trouvé avec ces critères'
                            : 'Aucun personnel enregistré'
                          }
                        </p>
                        {!searchTerm && statusFilter === 'all' && roleFilter === 'all' && (
                          <Button
                            variant="outline"
                            icon={Plus}
                            onClick={onAddUser}
                          >
                            Ajouter un premier personnel
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Pagination et stats */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredUsers.length)} sur {filteredUsers.length} personnel{filteredUsers.length > 1 ? 's' : ''}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredUsers.length}
              pageSize={itemsPerPage}
            />
          </div>
        )}
      </div>

      {/* Modal de confirmation de blocage */}
      <ConfirmModal
        isOpen={!!userToBlock}
        onClose={() => setUserToBlock(null)}
        onConfirm={handleConfirmBlock}
        title={userToBlock?.status === 'active' ? '🔒 Bloquer ce personnel ?' : '🔓 Débloquer ce personnel ?'}
        message={
          userToBlock?.status === 'active'
            ? `Êtes-vous sûr de vouloir bloquer "${userToBlock?.name}" ? Ce personnel ne pourra plus accéder au système tant qu'il sera bloqué.`
            : `Êtes-vous sûr de vouloir débloquer "${userToBlock?.name}" ? Ce personnel pourra de nouveau accéder au système.`
        }
        confirmText={userToBlock?.status === 'active' ? 'Bloquer' : 'Débloquer'}
        confirmVariant={userToBlock?.status === 'active' ? 'danger' : 'primary'}
      />

      {/* Modal de confirmation de suppression */}
      <ConfirmModal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="🗑️ Supprimer ce personnel ?"
        message={`Êtes-vous sûr de vouloir supprimer définitivement "${userToDelete?.name}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        confirmVariant="danger"
      />
    </>
  );
};

export default UserManagement;