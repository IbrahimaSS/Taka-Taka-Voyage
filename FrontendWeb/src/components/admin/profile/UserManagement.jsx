// src/components/profile/components/UserManagement.jsx
import React, { useState } from 'react';
import ConfirmModal from '../ui/ConfirmModal';
import Pagination from '../ui/Pagination';
import UserManagementFilterBar from './usermanagement/UserManagementFilterBar';
import UsersTable from './usermanagement/UsersTable';

const UserManagement = ({
  users = [],
  loading = false,
  onAddUser,
  onEditUser,
  onToggleStatus,
  onDeleteUser,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [userToBlock, setUserToBlock] = useState(null);
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
        <UserManagementFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          onRefresh={onRefresh}
          loading={loading}
          onAddUser={onAddUser}
        />

        <UsersTable
          users={currentUsers}
          loading={loading}
          indexOfFirstItem={indexOfFirstItem}
          hasActiveFilters={!!searchTerm || statusFilter !== 'all' || roleFilter !== 'all'}
          onEditUser={onEditUser}
          onBlockUser={setUserToBlock}
          onDeleteUser={setUserToDelete}
          onAddUser={onAddUser}
        />

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
