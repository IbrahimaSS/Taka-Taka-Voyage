import { Search, Filter, Users, Plus, RefreshCw } from 'lucide-react';
import Card, { CardContent } from '../../ui/Card';
import Button from '../../ui/Bttn';

const UserManagementFilterBar = ({
  searchTerm, onSearchChange, statusFilter, onStatusFilterChange, roleFilter, onRoleFilterChange,
  onRefresh, loading, onAddUser,
}) => {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 dark:border-gray-900 dark:bg-gray-800 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 dark:text-gray-500 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
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
              onChange={(e) => onRoleFilterChange(e.target.value)}
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
  );
};

export default UserManagementFilterBar;
