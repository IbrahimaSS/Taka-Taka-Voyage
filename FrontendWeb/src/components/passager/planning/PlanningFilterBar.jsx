import { useTranslation } from 'react-i18next';
import { Search, BarChart3, CheckCircle, Clock, AlertCircle, Grid, Car as CarIcon, Motorbike, Smartphone } from 'lucide-react';
import Card, { CardContent } from '../../admin/ui/Card';
import FilterChip from './FilterChip';

const PlanningFilterBar = ({
  searchTerm, onSearchChange,
  activeFilter, onFilterChange,
  activeVehicleFilter, onVehicleFilterChange,
}) => {
  const { t } = useTranslation();

  const filters = [
    { id: 'all', label: t('planning.all'), icon: BarChart3 },
    { id: 'ACCEPTEE', label: t('planning.confirmed'), icon: CheckCircle },
    { id: 'EN_ATTENTE', label: t('planning.pending'), icon: Clock },
    { id: 'ANNULEE', label: t('planning.cancelled'), icon: AlertCircle },
  ];

  const vehicleFilters = [
    { id: 'all', label: t('planning.all_vehicles'), icon: Grid },
    { id: 'Taxi', label: 'Taxi', icon: CarIcon },
    { id: 'Moto-taxi', label: 'Moto', icon: Motorbike },
    { id: 'Voiture privée', label: t('planning.personal_car'), icon: Smartphone },
  ];

  return (
    <Card hoverable className="mb-8 dark:bg-gray-800 dark:border-gray-700">
      <CardContent padding="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              placeholder="Rechercher par lieu ou destination..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Statut:</span>
              {filters.map((f) => (
                <FilterChip key={f.id} active={activeFilter === f.id} onClick={() => onFilterChange(f.id)} icon={f.icon} label={f.label} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 mr-2">Véhicule:</span>
              {vehicleFilters.map((vf) => (
                <FilterChip key={vf.id} active={activeVehicleFilter === vf.id} onClick={() => onVehicleFilterChange(vf.id)} icon={vf.icon} label={vf.label} />
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanningFilterBar;
