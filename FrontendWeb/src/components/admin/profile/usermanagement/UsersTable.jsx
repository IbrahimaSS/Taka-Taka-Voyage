import { useState, useEffect } from 'react';
import { Edit2, ShieldOff, ShieldCheck, Trash2, Phone, Calendar, Users, Plus, Loader2 } from 'lucide-react';
import Card, { CardContent } from '../../ui/Card';
import Button from '../../ui/Bttn';
import Table, { TableRow, TableCell } from '../../ui/Table';
import { getRoleBadge, getStatusBadge } from './userBadges';

const UsersTable = ({ users, loading, indexOfFirstItem, hasActiveFilters, onEditUser, onBlockUser, onDeleteUser, onAddUser }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return (
      <Card className="border-2 border-gray-100 dark:border-gray-900">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">Chargement des personnels...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (users.length === 0) {
    return (
      <Card className="border-2 border-gray-100 dark:border-gray-900">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center space-y-4 py-12">
            <Users className="w-16 h-16 text-gray-300" />
            <p className="text-gray-500 dark:text-gray-400">
              {hasActiveFilters ? 'Aucun personnel trouvé avec ces critères' : 'Aucun personnel enregistré'}
            </p>
            {!hasActiveFilters && (
              <Button variant="outline" icon={Plus} onClick={onAddUser}>
                Ajouter un premier personnel
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isMobile) {
    return (
      <Card className="border-2 border-gray-100 dark:border-gray-900">
        <CardContent className="p-0 divide-y divide-gray-100 dark:divide-gray-800">
          {users.map((user) => (
            <div key={user.id} className={`p-4 space-y-3 ${user.status === 'inactive' ? 'opacity-60' : ''}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.status === 'active' ? 'from-blue-600 to-teal-600' : 'from-gray-400 to-gray-500'} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                  {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{user.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  {user.phone && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />{user.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {getRoleBadge(user.role)}
                {getStatusBadge(user.status)}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 ml-auto">
                  <Calendar className="w-3.5 h-3.5" />
                  {user.joinDate}
                </div>
              </div>

              <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => onEditUser(user)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onBlockUser(user)}
                  className={`w-11 h-11 flex items-center justify-center rounded-lg transition-colors ${user.status === 'active'
                    ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                    : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                    }`}
                  title={user.status === 'active' ? 'Bloquer' : 'Débloquer'}
                >
                  {user.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => onDeleteUser(user)}
                  className="w-11 h-11 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-gray-100 dark:border-gray-900">
      <CardContent className="p-0">
        <Table
          headers={['N°', 'Personnel', 'Rôle', 'Statut', "Date d'ajout", 'Actions']}
          className="min-w-full"
        >
          {users.map((user, index) => (
            <TableRow
              key={user.id}
              className={`hover:bg-blue-50/50 dark:hover:bg-gray-700/30 transition-colors border-b border-gray-100 dark:border-gray-800 last:border-0 ${user.status === 'inactive' ? 'opacity-60' : ''}`}
            >
              <TableCell>
                <span className="font-semibold text-gray-500 dark:text-gray-400">
                  {indexOfFirstItem + index + 1}
                </span>
              </TableCell>

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

              <TableCell>
                {getRoleBadge(user.role)}
              </TableCell>

              <TableCell>
                {getStatusBadge(user.status)}
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5 text-sm text-gray-700 dark:text-gray-200">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  {user.joinDate}
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditUser(user)}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                    title="Modifier"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onBlockUser(user)}
                    className={`w-11 h-11 inline-flex items-center justify-center rounded-lg transition-colors ${user.status === 'active'
                      ? 'text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                      : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                      }`}
                    title={user.status === 'active' ? 'Bloquer' : 'Débloquer'}
                  >
                    {user.status === 'active' ? <ShieldOff className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => onDeleteUser(user)}
                    className="w-11 h-11 inline-flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </CardContent>
    </Card>
  );
};

export default UsersTable;
