import { AnimatePresence } from 'framer-motion';
import { Search, Filter, Calendar } from 'lucide-react';
import Card, { CardContent, CardFooter } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';
import Pagination from '../../admin/ui/Pagination';
import TripListItem from './TripListItem';

const PlanningTripsList = ({
  loading, scheduledTrips, stats, selectedDate, onTripClick, onResetFilters,
  currentPage, itemsPerPage, onPageChange, onItemsPerPageChange,
}) => {
  return (
    <div className="lg:col-span-8">
      <Card hoverable>
        <CardContent padding="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {selectedDate ? (
                <span className="flex items-center text-blue-600 dark:text-blue-400">
                  <Calendar className="w-4 h-4 mr-2 shrink-0" />
                  Trajets du {new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                </span>
              ) : 'Tous les trajets programmés'}
            </h3>
            <span className="text-sm font-semibold px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg self-start sm:self-auto">
              {stats.totalTrajets} Trajets trouvés
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-gray-500">Chargement de votre planning...</div>
          ) : scheduledTrips.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Aucun trajet trouvé</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">Aucun trajet ne correspond à vos critères. Essayez de modifier vos filtres.</p>
              <Button variant="primary" onClick={onResetFilters} icon={Filter}>Réinitialiser les filtres</Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto max-h-[80vh] custom-scrollbar-v5 pr-1 pb-4">
                <AnimatePresence mode="popLayout">
                  {scheduledTrips.map(trip => (
                    <TripListItem key={trip.id} trip={trip} onClick={onTripClick} />
                  ))}
                </AnimatePresence>
              </div>

              <CardFooter align="between" className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-4 flex-col sm:flex-row gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Page <span className="font-bold">{currentPage}</span> sur <span className="font-bold">{Math.ceil(stats.totalTrajets / itemsPerPage) || 1}</span>
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(stats.totalTrajets / itemsPerPage)}
                  onPageChange={onPageChange}
                  pageSize={itemsPerPage}
                  totalItems={stats.totalTrajets}
                  showInfo={false}
                />

                <select
                  value={itemsPerPage}
                  onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                  className="border-2 border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value={6}>6 par page</option>
                  <option value={12}>12 par page</option>
                  <option value={20}>20 par page</option>
                </select>
              </CardFooter>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanningTripsList;
