import { motion } from 'framer-motion';
import { Calendar, Download, History } from 'lucide-react';

import Card, { CardContent } from '../../admin/ui/Card';
import Table, { TableRow, TableCell } from '../../admin/ui/Table';
import Badge from '../../admin/ui/Badge';
import Button from '../../admin/ui/Bttn';
import Modal from '../../admin/ui/Modal';

const RecentTripsCard = ({ t, recentTrips, showTripHistory, onShowHistory, onCloseHistory }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-10"
      >
        <Card hoverable>
          <CardContent padding="p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('booking.recent_trips.title')}</h2>
                <p className="text-gray-500">{t('booking.recent_trips.subtitle')}</p>
              </div>
              <Button
                variant="primary"
                onClick={onShowHistory}
                icon={History}
                fullWidth
                className="sm:w-auto"
              >
                {t('booking.recent_trips.view_all')}
              </Button>
            </div>

            {/* Vue mobile : cartes */}
            <div className="space-y-3 sm:hidden">
              {recentTrips.length > 0 ? (
                recentTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{trip.date}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{trip.time}</p>
                        </div>
                      </div>
                      <Badge variant={trip.status === 'completed' ? 'success' : 'danger'} size="sm">
                        {trip.status === 'completed' ? t('history.status.completed') : t('history.status.cancelled')}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 truncate">{trip.departure}</span>
                      </div>
                      <div className="flex items-center text-sm">
                        <div className="w-2 h-2 bg-rose-500 rounded-full mr-3 shrink-0"></div>
                        <span className="text-gray-700 dark:text-gray-300 truncate">{trip.destination}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{trip.price}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">{t('booking.recent_trips.no_recent')}</div>
              )}
            </div>

            {/* Vue desktop/tablette : tableau */}
            <div className="hidden sm:block">
              <Table
                headers={[
                  t('history.table.date'),
                  t('history.table.pickup'),
                  t('history.table.destination'),
                  t('history.table.price'),
                  t('history.table.status')
                ]}
                striped
                hoverable
              >
                {recentTrips.length > 0 ? (
                  recentTrips.map((trip) => (
                    <TableRow key={trip.id} hoverable>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{trip.date}</p>
                            <p className="text-sm text-gray-500">{trip.time}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                          <span>{trip.departure}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-rose-500 rounded-full mr-3"></div>
                          <span>{trip.destination}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-700">{trip.price}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={trip.status === 'completed' ? 'success' : 'danger'} size="sm">
                          {trip.status === 'completed' ? t('history.status.completed') : t('history.status.cancelled')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <div className="text-center py-4 text-gray-500">{t('booking.recent_trips.no_recent')}</div>
                    </TableCell>
                  </TableRow>
                )}
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Modal d'historique complet */}
      <Modal
        isOpen={showTripHistory}
        onClose={onCloseHistory}
        title={t('booking.full_history_modal.title')}
        size="xl"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            {t('booking.full_history_modal.desc')}
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <Button variant="secondary" icon={Download} fullWidth className="sm:w-auto">
              {t('booking.full_history_modal.export_pdf')}
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost">{t('booking.full_history_modal.filter_all')}</Button>
              <Button variant="primary" size="small">{t('booking.full_history_modal.filter_month')}</Button>
              <Button variant="ghost" size="small">{t('booking.full_history_modal.filter_year')}</Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RecentTripsCard;
