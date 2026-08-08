import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Calendar, Tag, Eye, Share2, Car } from 'lucide-react';
import Card, { CardContent, CardFooter } from '../../admin/ui/Card';
import Table, { TableRow, TableCell, TableHeader } from '../../admin/ui/Table';
import Button from '../../admin/ui/Bttn';
import Pagination from '../../admin/ui/Pagination';
import { getFullAssetURL } from '../../../utils/urlHelper';
import TripStatusBadge from './TripStatusBadge';

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.split(' ');
  const first = parts[0]?.charAt(0) || '';
  const last = parts[1]?.charAt(0) || '';
  return (first + last).toUpperCase() || '?';
};

const DriverAvatar = ({ driver }) => (
  <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-emerald-200 to-blue-200 dark:from-emerald-900/30 dark:to-blue-900/30 flex items-center justify-center overflow-hidden ring-2 ring-white dark:ring-gray-700 shadow-sm shrink-0">
    <span className="z-0 font-bold text-xs">{getInitials(driver?.name)}</span>
    {driver?.photo && (
      <img
        src={getFullAssetURL(driver.photo)}
        alt={driver.name}
        className="absolute inset-0 w-full h-full object-cover z-10 rounded-full"
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    )}
  </div>
);

const TripsTable = ({
  currentTrips, sortConfig, onRequestSort, onViewDetails, onShareTrip,
  startIndex, endIndex, totalItems,
  currentPage, totalPages, onPageChange,
  itemsPerPage, onItemsPerPageChange,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="trips-table"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card hoverable>
        <CardContent padding="p-0">
          {/* Vue mobile : cartes */}
          <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
            {currentTrips.map((trip) => (
              <div key={trip.id} className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div onClick={() => onViewDetails(trip)} className="cursor-pointer">
                    <p className="font-bold text-gray-900 dark:text-gray-100">{trip.date?.split(',')[0]}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{trip.date?.split(',')[1]}</p>
                  </div>
                  <TripStatusBadge status={trip.status} />
                </div>

                <div className="flex items-center space-x-3">
                  <DriverAvatar driver={trip.driver} />
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-gray-900 dark:text-gray-100 truncate">{trip.driver?.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <Car className="w-3 h-3 mr-1 opacity-70 shrink-0" />
                      <span className="truncate">{trip.driver?.vehicle}</span>
                    </p>
                  </div>
                </div>

                <div onClick={() => onViewDetails(trip)} className="cursor-pointer space-y-1.5">
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-3 shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium truncate">{trip.departure}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-3 shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300 text-sm font-medium truncate">{trip.destination}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="font-black text-emerald-700 dark:text-emerald-400 text-lg">{trip.price}</span>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="small"
                      icon={Eye}
                      onClick={() => onViewDetails(trip)}
                      tooltip="Voir les détails"
                    />
                    <Button
                      variant="ghost"
                      size="small"
                      icon={Share2}
                      onClick={() => onShareTrip(trip)}
                      tooltip="Partager"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Vue desktop/tablette : tableau */}
          <div className="hidden sm:block overflow-x-auto mx-auto font-medium">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr>
                  <TableHeader>
                    <button onClick={() => onRequestSort('date')} className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t('history.table.date')}
                      {sortConfig.key === 'date' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                    </button>
                  </TableHeader>
                  <TableHeader>{t('history.table.driver')}</TableHeader>
                  <TableHeader>{t('history.table.pickup')}</TableHeader>
                  <TableHeader>{t('history.table.destination')}</TableHeader>
                  <TableHeader>
                    <button onClick={() => onRequestSort('price')} className="flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
                      {t('history.table.price')}
                      {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                    </button>
                  </TableHeader>
                  <TableHeader>{t('history.table.status')}</TableHeader>
                  <TableHeader>{t('history.table.actions')}</TableHeader>
                </tr>
              </thead>
              <tbody>
                {currentTrips.map((trip) => (
                  <TableRow key={trip.id} hoverable>
                    <TableCell>
                      <div onClick={() => onViewDetails(trip)} className="cursor-pointer group">
                        <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors">{trip.date?.split(',')[0]}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{trip.date?.split(',')[1]}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <DriverAvatar driver={trip.driver} />
                        <div>
                          <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{trip.driver?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                            <Car className="w-3 h-3 mr-1 opacity-70" />
                            {trip.driver?.vehicle}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div onClick={() => onViewDetails(trip)} className="cursor-pointer">
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-3 shadow-lg shadow-emerald-500/20"></div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium line-clamp-1">{trip.departure}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div onClick={() => onViewDetails(trip)} className="cursor-pointer">
                        <div className="flex items-center">
                          <div className="w-2.5 h-2.5 bg-rose-500 rounded-full mr-3 shadow-lg shadow-rose-500/20"></div>
                          <span className="text-gray-700 dark:text-gray-300 text-sm font-medium line-clamp-1">{trip.destination}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-emerald-700 dark:text-emerald-400 text-lg">{trip.price}</span>
                    </TableCell>
                    <TableCell>
                      <TripStatusBadge status={trip.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="small"
                          icon={Eye}
                          onClick={() => onViewDetails(trip)}
                          tooltip="Voir les détails"
                        />
                        <Button
                          variant="ghost"
                          size="small"
                          icon={Share2}
                          onClick={() => onShareTrip(trip)}
                          tooltip="Partager"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter align="between" className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-col sm:flex-row gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
            {t('history.pagination.showing')} <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> {t('history.pagination.to')}{' '}
            <span className="font-bold text-gray-900 dark:text-white">{Math.min(endIndex, totalItems)}</span> {t('history.pagination.of')}{' '}
            <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> {t('history.pagination.results')}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            pageSize={itemsPerPage}
            totalItems={totalItems}
            showInfo={false}
          />

          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:border-primary-500 outline-none transition-all"
          >
            <option value={8}>8 {t('history.pagination.per_page')}</option>
            <option value={16}>16 {t('history.pagination.per_page')}</option>
            <option value={24}>24 {t('history.pagination.per_page')}</option>
            <option value={50}>50 {t('history.pagination.per_page')}</option>
          </select>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TripsTable;
