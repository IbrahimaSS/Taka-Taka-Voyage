import { useTranslation } from 'react-i18next';
import { Calendar, Mail, Phone, Shield, MessageSquare, X, Edit3, CheckCircle, Loader2 } from 'lucide-react';
import Modal from '../../ui/Modal';
import Badge from '../../ui/Badge';
import Button from '../../ui/Bttn';
import DriverAvatar from './DriverAvatar';
import { renderStatus, renderService, renderPaymentMethod } from './commissionBadges';
import { formatGNF } from './commissionHelpers';

// Fonction de rendu pour le modal de détails, en composant module-level
// (un composant defini une fois dans son propre fichier n'est jamais recree
// a chaque render du parent, contrairement a un composant defini a l'interieur
// du corps d'un autre composant - donc pas de risque de re-mount/flicker ici)
const PaymentDetailsModal = ({ payment, isOpen, loading, onClose, onEdit, onProcess }) => {
  const { t } = useTranslation();

  if (!payment) return null;

  // Données enrichies du backend (via detailsPaiementAdmin)
  const finances = payment.finances || {};
  const meta = payment.meta || {};
  const notes = payment.notes || [];
  const paiementInfo = payment.paiementInfo || {};
  const chauffeurDetails = payment.chauffeur || {};

  // Utilise les données enrichies si disponibles, sinon fallback sur les données de liste
  const montantBrut = finances.brut ?? payment.montantBrut ?? 0;
  const commission = finances.commission ?? payment.commission ?? 0;
  const aVerser = finances.aVerser ?? payment.montantNet ?? 0;

  const formatDetailDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch { return dateStr; }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('payments.details_title')}
      size="lg"
    >
      <div className="space-y-6 scroll-m-t-2 overflow-y-auto h-[70vh]">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-green-500" />
          </div>
        ) : (
          <>
            {/* En-tête avec statut et infos */}
            <div className="flex flex-wrap gap-3 mb-6">
              {renderStatus(payment.statut, t)}
              {renderService(payment.service, t)}
              {renderPaymentMethod(payment.methode, t)}
              <Badge variant="secondary">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDetailDate(meta.creeLe || payment.createdAt) || ''}
              </Badge>
            </div>

            {/* Grille d'informations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations du chauffeur */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('commissions.driver_info')}</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center mb-3">
                      <div className="mr-3">
                        <DriverAvatar photo={payment.photo} nom={chauffeurDetails.nom || payment.nom} size="md" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-800 dark:text-gray-100">{chauffeurDetails.nom || payment.nom}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{chauffeurDetails.telephone || payment.telephone}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {(chauffeurDetails.email || payment.email) && (
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                          <span className="text-sm">{chauffeurDetails.email || payment.email}</span>
                        </div>
                      )}
                      {(chauffeurDetails.telephone || payment.telephone) && (
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
                          <span className="text-sm">{chauffeurDetails.telephone || payment.telephone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Informations de paiement */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-4 mb-3">{t('payments.tab_title')}</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">{t('payments.method')} :</span>
                      <span className="font-medium">{renderPaymentMethod(payment.methode, t)}</span>
                    </div>
                    {paiementInfo.compte && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t('payments.account')} :</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{paiementInfo.compte}</span>
                      </div>
                    )}
                    {paiementInfo.banque && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">Banque :</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{paiementInfo.banque}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Détails financiers */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('payments.financial_details')}</h3>
                  <div className="bg-slate-200/30 dark:bg-gray-800 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('commissions.gross_amount')}</p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{formatGNF(montantBrut)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('payments.platform_commission')}</p>
                        <p className="text-2xl font-bold text-red-500">{formatGNF(commission)}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium text-gray-700 dark:text-gray-200">{t('commissions.to_pay')} :</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatGNF(aVerser)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métadonnées */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">{t('commissions.metadata')}</h3>
                  <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">{t('commissions.creation_date')} :</span>
                      <span className="font-medium">{formatDetailDate(meta.creeLe || payment.createdAt)}</span>
                    </div>
                    {meta.verseLe && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t('commissions.payment_date')} :</span>
                        <span className="font-medium text-green-600">{formatDetailDate(meta.verseLe)}</span>
                      </div>
                    )}
                    {meta.versePar && (
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-300">{t('commissions.processed_by')} :</span>
                        <span className="font-medium">
                          <Badge variant="secondary">
                            <Shield className="w-3 h-3 mr-1" />
                            {meta.versePar}
                          </Badge>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes admin */}
                {notes.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Notes</h3>
                    <div className="space-y-2">
                      {notes.map((note, idx) => (
                        <div
                          key={idx}
                          className={`rounded-lg p-3 text-sm ${note.type === 'admin'
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            {note.type === 'admin' ? (
                              <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                            ) : (
                              <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                            )}
                            <span>{note.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-800">
              <Button
                variant="outline"
                icon={X}
                onClick={onClose}
                className="sm:w-auto"
              >
                {t('common.close')}
              </Button>

              {payment.statut === 'A_PAYER' && (
                <>
                  <Button
                    variant="primary"
                    icon={Edit3}
                    onClick={onEdit}
                    className="sm:w-auto"
                  >
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="perso"
                    icon={CheckCircle}
                    onClick={onProcess}
                    className="sm:w-auto"
                  >
                    {t('commissions.process_payment')}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};

export default PaymentDetailsModal;
