import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Loader2, Eye, CheckCircle } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../ui/Table';
import Button from '../../ui/Bttn';
import DriverAvatar from './DriverAvatar';
import PaymentActions from './PaymentActions';
import { renderStatus, renderService, renderPaymentMethod } from './commissionBadges';
import { formatGNF } from './commissionHelpers';

// Fonction pour rendre le tableau responsive
const ResponsiveCommissionsTable = ({ payments, isMobile, loadingList, onViewDetails, onProcess, onEdit }) => {
  const { t } = useTranslation();

  if (loadingList) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
        <span className="ml-2 text-gray-500">{t('common.loading')}...</span>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {payments.map((payment) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-900 p-4 space-y-2"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <DriverAvatar photo={payment.photo} nom={payment.nom} size="sm" />
                <div>
                  <div className="font-bold text-gray-800 dark:text-gray-100">{payment.nom}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{payment.telephone}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {renderStatus(payment.statut, t)}
                {renderService(payment.service, t)}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('commissions.gross_amount')}</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">{formatGNF(payment.montantBrut)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('payments.platform_commission')}</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">{formatGNF(payment.commission)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('commissions.to_pay')}</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">{formatGNF(payment.montantNet)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('payments.method')}</p>
                <p className="font-medium text-gray-800 dark:text-gray-100">{renderPaymentMethod(payment.methode, t)}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-900">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : ''}
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="small"
                  icon={Eye}
                  onClick={() => onViewDetails(payment)}
                  className="p-1"
                />
                {payment.statut === 'A_PAYER' && (
                  <Button
                    variant="success"
                    size="small"
                    icon={CheckCircle}
                    onClick={() => onProcess(payment)}
                    className="p-1"
                  />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table className="min-w-[760px]"
        headers={[
          t('trips.driver'),
          t('commissions.service'),
          t('commissions.revenue'),
          t('payments.platform_commission'),
          t('commissions.to_pay'),
          t('common.status'),
          { label: t('trips.actions'), className: 'text-right' }
        ]}
      >
        {payments.map((payment) => (
          <TableRow key={payment.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <DriverAvatar photo={payment.photo} nom={payment.nom} size="sm" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-100">{payment.nom}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString('fr-FR') : ''}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {renderService(payment.service, t)}
            </TableCell>
            <TableCell>
              <div className="font-semibold text-gray-800 dark:text-gray-100">{formatGNF(payment.montantBrut)}</div>
            </TableCell>
            <TableCell>
              <div className="font-semibold text-gray-800 dark:text-gray-100">{formatGNF(payment.commission)}</div>
            </TableCell>
            <TableCell>
              <div className="font-semibold text-green-600 dark:text-green-400">{formatGNF(payment.montantNet)}</div>
            </TableCell>
            <TableCell>
              {renderStatus(payment.statut, t)}
            </TableCell>

            <TableCell className="w-24 text-right">
              <PaymentActions
                payment={payment}
                onView={onViewDetails}
                onProcess={onProcess}
                onEdit={onEdit}
              />
            </TableCell>
          </TableRow>
        ))}
      </Table>
    </div>
  );
};

export default ResponsiveCommissionsTable;
