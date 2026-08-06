import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';
import Table, { TableRow, TableCell } from '../../ui/Table';
import Pagination from '../../ui/Pagination';
import UserActionsMenu from './UserActionsMenu';
import { getStatusBadge } from './passengerBadges';
import { getAvatarUrl, getTimeAgo } from './passengerHelpers';

const UserAvatar = ({ user }) => (
  <div className="relative w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center mr-3 overflow-hidden shadow-sm border border-white dark:border-gray-700 shrink-0">
    {user.photoUrl && user.photoUrl !== '' ? (
      <img
        src={getAvatarUrl(user.photoUrl)}
        alt={`${user.prenom} ${user.nom}`}
        className="w-full h-full object-cover z-10"
        onError={(e) => {
          e.target.style.display = 'none';
          const span = e.target.parentElement.querySelector('.avatar-initials');
          if (span) span.style.display = 'flex';
        }}
      />
    ) : null}
    <span
      className="avatar-initials text-white font-bold text-xs uppercase"
      style={{ display: user.photoUrl && user.photoUrl !== '' ? 'none' : 'flex' }}
    >
      {user.prenom?.[0]}{user.nom?.[0]}
    </span>
  </div>
);

const PassengersTable = ({
  users,
  loading,
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  openMenuId,
  onToggleMenu,
  onViewDetails,
  onToggleStatus,
  onSendEmail,
  menuRefs
}) => {
  const { t, i18n } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <>
      {isMobile ? (
        <div className="space-y-3">
          {users.map((user) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-900 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center min-w-0">
                  <UserAvatar user={user} />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{user.prenom} {user.nom}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
                <UserActionsMenu
                  user={user}
                  isOpen={openMenuId === user._id}
                  onToggle={onToggleMenu}
                  onViewDetails={onViewDetails}
                  onToggleStatus={onToggleStatus}
                  onSendEmail={onSendEmail}
                  menuRef={el => menuRefs.current[user._id] = el}
                  t={t}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-gray-100 dark:border-gray-900">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">{t('nav.trajets') || 'Trajets'}</span>
                  <span className="font-bold text-gray-800 dark:text-gray-100">{user.nombreTrajets || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">{t('common.status') || 'Statut'}</span>
                  {getStatusBadge(user.statut, t)}
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">{t('common.registration') || 'Inscription'}</span>
                  <span className="text-gray-800 dark:text-gray-100">{new Date(user.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400"> · {getTimeAgo(user.createdAt, t)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <Table headers={[t('common.user') || 'Utilisateur', t('nav.trajets') || 'Trajets', t('common.registration') || 'Inscription', t('common.status') || 'Statut', 'Actions']}>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <div className="flex items-center">
                  <UserAvatar user={user} />
                  <div>
                    <p className="font-medium text-gray-800 dark:text-gray-100">{user.prenom} {user.nom}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="font-bold text-gray-800 dark:text-gray-100">{user.nombreTrajets || 0}</div>
              </TableCell>
              <TableCell>
                <div className="text-gray-800 dark:text-gray-100">{new Date(user.createdAt).toLocaleDateString(i18n.language === 'fr' ? 'fr-FR' : 'en-US')}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {getTimeAgo(user.createdAt, t)}
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(user.statut, t)}
              </TableCell>
              <TableCell>
                <div className="flex justify-end dark:bg-gray-800 dark:border-gray-900 hover">
                  <UserActionsMenu
                    user={user}
                    isOpen={openMenuId === user._id}
                    onToggle={onToggleMenu}
                    onViewDetails={onViewDetails}
                    onToggleStatus={onToggleStatus}
                    onSendEmail={onSendEmail}
                    menuRef={el => menuRefs.current[user._id] = el}
                    t={t}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}

      {/* Pagination */}
      {users.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(totalItems / pageSize)}
            onPageChange={onPageChange}
            pageSize={pageSize}
            totalItems={totalItems}
          />
        </div>
      )}

      {/* Aucun résultat */}
      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">{t('common.no_user_found') || 'Aucun utilisateur trouvé'}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t('common.no_user_match') || 'Aucun utilisateur ne correspond à vos critères de recherche.'}</p>
        </div>
      )}
    </>
  );
};

export default PassengersTable;
