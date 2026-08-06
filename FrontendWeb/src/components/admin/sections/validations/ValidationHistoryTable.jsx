import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, CheckCircle, XCircle, Eye, FileCheck } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../ui/Table';
import Button from '../../ui/Bttn';
import Badge from '../../ui/Badge';
import Pagination from '../../ui/Pagination';

const ValidationHistoryTable = ({ history, currentPage, pageSize, totalItems, onPageChange, onViewDetails }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (history.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <FileCheck className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Aucune action de validation</h3>
        <p className="text-gray-500 dark:text-gray-400">L'historique des validations apparaîtra ici après traitement des demandes.</p>
      </div>
    );
  }

  return (
    <>
      {isMobile ? (
        <div className="space-y-3">
          {history.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-900 p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center mr-3">
                    <UserCheck className="text-white text-sm" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">{item.chauffeur?.nom}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.chauffeur?.telephone}</div>
                  </div>
                </div>
                {item.action === 'VALIDE' ? (
                  <Badge className="text-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Validé
                  </Badge>
                ) : (
                  <Badge className="text-red-500">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejeté
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-gray-100 dark:border-gray-900">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Type</span>
                  <Badge size="sm">{item.typeVehicule || 'N/A'}</Badge>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Date</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {new Date(item.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Validateur</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100 text-xs">{item.validateur}</span>
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-900">
                <Button
                  variant="secondary"
                  size="small"
                  icon={Eye}
                  onClick={() => onViewDetails(item)}
                >
                  Voir détails
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <Table headers={['Date', 'Chauffeur', 'Type', 'Action', 'Validateur', 'Actions']}>
          {history.map((item) => (
            <TableRow key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 dark:bg-gray-800 transition">
              <TableCell>
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {new Date(item.date).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center mr-3">
                    <UserCheck className="text-white text-sm" />
                  </div>
                  <div>
                    <div className="font-medium">{item.chauffeur?.nom}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{item.chauffeur?.telephone}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge size="sm">{item.typeVehicule || 'N/A'}</Badge>
              </TableCell>
              <TableCell>
                {item.action === 'VALIDE' ? (
                  <Badge className="text-green-500">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Validé
                  </Badge>
                ) : (
                  <Badge className="text-red-500">
                    <XCircle className="w-3 h-3 mr-1" />
                    Rejeté
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="font-medium text-xs">{item.validateur}</div>
              </TableCell>
              <TableCell>
                <Button
                  variant="secondary"
                  size="small"
                  icon={Eye}
                  onClick={() => onViewDetails(item)}
                />
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(totalItems / pageSize)}
          onPageChange={onPageChange}
          pageSize={pageSize}
          totalItems={totalItems}
        />
      </div>
    </>
  );
};

export default ValidationHistoryTable;
