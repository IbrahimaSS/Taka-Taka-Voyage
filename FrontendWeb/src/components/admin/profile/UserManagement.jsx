// src/components/profile/components/UserManagement.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Edit2, Eye, EyeOff, Trash2, MoreVertical, Phone, Calendar, Users, Check, Star, Filter } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import Button from '../ui/Bttn';
import Badge from '../ui/Badge';
import Pagination from '../ui/Pagination';
import Table, { TableRow, TableCell } from '../ui/Table';
import ConfirmModal from '../ui/ConfirmModal';

const UserManagement = ({
  users = [],
  onAddUser,
  onEditUser,
  onToggleStatus,
  showToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [userToDelete, setUserToDelete] = useState(null);
  const [itemsPerPage] = useState(5);

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
      'active': { variant: 'success', label: 'Actif' },
      'inactive': { variant: 'danger', label: 'Inactif' },
      'pending': { variant: 'warning', label: 'En attente' }
    };

    const statusConfig = config[status] || { variant: 'default', label: status };

    return (
      <Badge variant={statusConfig.variant} size="sm">
        {statusConfig.label}
      </Badge>
    );
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
                <Button
                  variant="perso"
                  icon={Plus}
                  onClick={onAddUser}
                >
                  Ajouter un personnels
                </Button>
              </div>
            </div>

            {/* Filtres et recherche */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher un utilisateur..."
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
                  <option value="inactive">Inactif</option>
                  <option value="pending">En attente</option>
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
            <Table
              headers={['Utilisateur', 'Statut', 'Date d\'ajout', 'Actions']}
              className="min-w-full"
            >
              {currentUsers.length > 0 ? (
                currentUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="hover:bg-blue-50 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-teal-600 flex items-center justify-center text-white font-bold">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>



                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>

                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-700 dark:text-gray-200">{user.joinDate}</p>

                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {user.role}
                        </p>

                      </div>
                    </TableCell>



                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="small"
                          icon={Edit2}
                          onClick={() => onEditUser(user)}
                          tooltip="Modifier"
                        />
                        <Button
                          variant="ghost"
                          size="small"
                          icon={user.status === 'active' ? EyeOff : Eye}
                          onClick={() => onToggleStatus(user.id)}
                          tooltip={user.status === 'active' ? 'Désactiver' : 'Activer'}
                        />

                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Users className="w-16 h-16 text-gray-300" />
                      <p className="text-gray-500 dark:text-gray-400">Aucun utilisateur trouvé</p>
                      <Button
                        variant="outline"
                        icon={Plus}
                        onClick={onAddUser}
                      >
                        Ajouter un premier utilisateur
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Table>
          </CardContent>
        </Card>

        {/* Pagination et stats */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Affichage de {indexOfFirstItem + 1} à {Math.min(indexOfLastItem, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredUsers.length}
            pageSize={itemsPerPage}
          />
        </div>
      </div>


    </>
  );
};

export default UserManagement;