import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Eye, Check, X, User, Car, Calendar } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../ui/Table';
import Button from '../../ui/Bttn';
import TableActions from './TableActions';
import { renderStatus, renderPriority, renderType } from './disputeBadges';

const ResponsiveDisputesTable = ({
  disputes,
  isMobile,
  currentPage,
  pageSize,
  onViewDetails,
  onQuickResolve,
  onQuickReject,
  onQuickDelete
}) => {
  const { t } = useTranslation();

  if (isMobile) {
    return (
      <div className="space-y-4">
        {disputes.map((dispute) => (

          <motion.div
            key={dispute.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-900 p-4 space-y-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-gray-800 dark:text-gray-100">{dispute.id}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {dispute.date.split(',')[0]}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {renderStatus(dispute.status, t)}
                {renderPriority(dispute.priority)}
              </div>
            </div>

            <div>
              <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">{dispute.title}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{dispute.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <User className="text-green-500 text-xs" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200">{dispute.users.passenger}</span>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <Car className="text-blue-500 text-xs" />
                </div>
                <span className="text-sm text-gray-700 dark:text-gray-200">{dispute.users.driver}</span>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800">
              <div className="font-medium text-gray-800 dark:text-gray-100">
                {dispute.amount.toLocaleString('fr-FR')} GNF
              </div>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="small"
                  icon={Eye}
                  onClick={() => onViewDetails(dispute)}
                  className="p-1"
                />
                <Button
                  variant="success"
                  size="small"
                  icon={Check}
                  onClick={() => onQuickResolve(dispute)}
                  disabled={dispute.status === 'resolved'}
                  className="p-1"
                />
                <Button
                  variant="danger"
                  size="small"
                  icon={X}
                  onClick={() => onQuickReject(dispute)}
                  disabled={dispute.status === 'rejected'}
                  className="p-1"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <Table
      headers={[
        t('disputes.id', 'N° / Date'),
        t('nav.utilisateurs', 'Utilisateurs'),
        t('transactions.details.type', 'Type'),
        t('common.status', 'Statut'),
        t('common.actions', 'Actions')
      ]}
    >
      {disputes.map((dispute, index) => (
        <TableRow key={dispute.id}>
          <TableCell>
            <div className="font-bold text-gray-800 dark:text-gray-200">{(currentPage - 1) * pageSize + index + 1}</div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 flex items-center whitespace-nowrap">
              <Calendar className="w-2.5 h-2.5 mr-1" />
              {dispute.date.split(' ')[0]}
            </div>
          </TableCell>

          <TableCell>
            <div className="space-y-1">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <User className="text-green-500 text-xs" />
                </div>
                <div>
                  <p className="text-sm font-medium">{dispute.users.passenger}</p>

                </div>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <Car className="text-blue-500 text-xs" />
                </div>
                <div>
                  <p className="text-sm font-medium">{dispute.users.driver}</p>

                </div>
              </div>
            </div>
          </TableCell>
          <TableCell>
            {renderType(dispute.type, t)}
          </TableCell>

          <TableCell>
            {renderStatus(dispute.status, t)}
          </TableCell>
          <TableCell>
            <TableActions
              dispute={dispute}
              onView={onViewDetails}
              onResolve={onQuickResolve}
              onReject={onQuickReject}
              onDelete={onQuickDelete}
            />
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
};

export default ResponsiveDisputesTable;
