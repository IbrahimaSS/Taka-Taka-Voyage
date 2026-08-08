import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Calendar, CreditCard, Smartphone, CheckCircle, FileText, MoreVertical,
  Coins, ArrowUpRight, ArrowDownRight, Copy, Eye, Share2,
} from 'lucide-react';
import Card, { CardContent, CardFooter } from '../../admin/ui/Card';
import { TableRow, TableCell, TableHeader } from '../../admin/ui/Table';
import Button from '../../admin/ui/Bttn';
import Pagination from '../../admin/ui/Pagination';
import TransactionStatusBadge from './TransactionStatusBadge';
import TransactionTypeBadge from './TransactionTypeBadge';

const TransactionsTable = ({
  currentTransactions, onViewDetails, onShareReceipt, onCopyReference,
  startIndex, endIndex, totalItems,
  currentPage, totalPages, onPageChange,
  itemsPerPage, onItemsPerPageChange,
}) => {
  const { t } = useTranslation();

  return (
    <motion.div
      key="transactions-table"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Card hoverable>
        <CardContent padding="p-0">
          {/* Vue mobile : cartes */}
          <div className="sm:hidden divide-y divide-gray-100 dark:divide-gray-700">
            {currentTransactions.map((transaction) => {
              const isPositive = transaction.amount > 0;
              return (
                <div key={transaction.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div onClick={() => onViewDetails(transaction)} className="cursor-pointer">
                      <p className="font-bold text-gray-900 dark:text-gray-100">{transaction.date}</p>
                    </div>
                    <TransactionStatusBadge status={transaction.status} />
                  </div>

                  <TransactionTypeBadge type={transaction.type} amount={transaction.amount} />

                  <div className="flex items-center">
                    {isPositive ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2 shrink-0" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400 mr-2 shrink-0" />
                    )}
                    <span className={`font-black text-lg ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {isPositive ? '+' : '-'} {Math.abs(transaction.amount).toLocaleString()} GNF
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{transaction.method}</p>

                  <div className="flex items-center justify-between">
                    <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded font-mono text-gray-800 dark:text-gray-200 truncate">
                      {transaction.reference}
                    </code>
                    <div className="flex shrink-0">
                      <Button
                        variant="ghost"
                        size="small"
                        icon={Copy}
                        onClick={() => onCopyReference(transaction.reference)}
                        tooltip={t('transactions.details.copy')}
                      />
                      <Button
                        variant="ghost"
                        size="small"
                        icon={Eye}
                        onClick={() => onViewDetails(transaction)}
                        tooltip={t('transactions.details.title')}
                      />
                      <Button
                        variant="ghost"
                        size="small"
                        icon={Share2}
                        onClick={() => onShareReceipt(transaction)}
                        tooltip={t('transactions.details.share')}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Vue desktop/tablette : tableau */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr>
                  <TableHeader>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {t('transactions.table.date')}
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 mr-2" />
                      {t('transactions.table.type')}
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center">
                      <Coins className="w-4 h-4 mr-2" />
                      {t('transactions.table.amount')}
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center">
                      <Smartphone className="w-4 h-4 mr-2" />
                      {t('transactions.table.method')}
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t('transactions.table.status')}
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-2" />
                      {t('transactions.table.reference')}
                    </div>
                  </TableHeader>
                  <TableHeader>
                    <div className="flex items-center">
                      <MoreVertical className="w-4 h-4 mr-2" />
                      {t('transactions.table.actions')}
                    </div>
                  </TableHeader>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction) => {
                  const isPositive = transaction.amount > 0;

                  return (
                    <TableRow key={transaction.id} hoverable>
                      <TableCell>
                        <div onClick={() => onViewDetails(transaction)} className="cursor-pointer group">
                          <p className="font-bold text-gray-900 dark:text-gray-100 group-hover:text-primary-500 transition-colors">{transaction.date}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">14:35</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TransactionTypeBadge type={transaction.type} amount={transaction.amount} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {isPositive ? (
                            <ArrowUpRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mr-2" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-rose-600 dark:text-rose-400 mr-2" />
                          )}
                          <span className={`font-black text-lg ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isPositive ? '+' : '-'} {Math.abs(transaction.amount).toLocaleString()} GNF
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{transaction.method}</span>
                      </TableCell>
                      <TableCell>
                        <TransactionStatusBadge status={transaction.status} />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <code className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded font-mono text-gray-800 dark:text-gray-200">
                            {transaction.reference}
                          </code>
                          <Button
                            variant="ghost"
                            size="small"
                            icon={Copy}
                            onClick={() => onCopyReference(transaction.reference)}
                            className="ml-2"
                            tooltip={t('transactions.details.copy')}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="small"
                            icon={Eye}
                            onClick={() => onViewDetails(transaction)}
                            tooltip={t('transactions.details.title')}
                          />
                          <Button
                            variant="ghost"
                            size="small"
                            icon={Share2}
                            onClick={() => onShareReceipt(transaction)}
                            tooltip={t('transactions.details.share')}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>

        <CardFooter align="between" className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-col sm:flex-row gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
            {t('transactions.pagination.showing')} <span className="font-bold text-gray-900 dark:text-white">{startIndex + 1}</span> {t('transactions.pagination.to')}{' '}
            <span className="font-bold text-gray-900 dark:text-white">{Math.min(endIndex, totalItems)}</span> {t('transactions.pagination.of')}{' '}
            <span className="font-bold text-gray-900 dark:text-white">{totalItems}</span> {t('transactions.pagination.results')}
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
            <option value={10}>10 {t('transactions.pagination.per_page')}</option>
            <option value={25}>25 {t('transactions.pagination.per_page')}</option>
            <option value={50}>50 {t('transactions.pagination.per_page')}</option>
            <option value={100}>100 {t('transactions.pagination.per_page')}</option>
          </select>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default TransactionsTable;
