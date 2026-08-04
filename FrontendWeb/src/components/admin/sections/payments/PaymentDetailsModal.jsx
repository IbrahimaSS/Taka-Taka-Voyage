import { useTranslation } from 'react-i18next';
import { Download, Share2 } from 'lucide-react';
import Modal from '../../ui/Modal';
import Card, { CardHeader, CardTitle, CardContent } from '../../ui/Card';
import Badge from '../../ui/Badge';
import Button from '../../ui/Bttn';
import { getStatusBadge, getMethodBadge } from './paymentBadges';
import Avatar from './Avatar';

// Modal de détails du paiement
const PaymentDetailsModal = ({ payment, isOpen, onClose, onDownload, showToast }) => {
  const { t } = useTranslation();

  if (!payment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('payments.details_title')}
      size="lg">
      <div className="space-y-6 scroll-m-t-2 overflow-auto h-[70vh]">
        {/* En-tête */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{payment.id}</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {t('payments.reference')}: {payment.reference} • {payment.date} à {payment.time}
            </p>
            <div className="flex items-center mt-2 space-x-2">
              {getStatusBadge(payment.status, t)}
              {getMethodBadge(payment.method, t)}
              {payment.archived && <Badge variant="secondary">{t('payments.archived')}</Badge>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{payment.amount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Net: {payment.netAmount}</p>
          </div>
        </div>

        {/* Informations du trajet */}
        <Card>
          <CardHeader>
            <CardTitle>{t('trips.details_title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('trips.trip_id')}</p>
                <p className="font-medium">{payment.trip.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('trips.route')}</p>
                <p className="font-medium">{payment.trip.route}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('trips.distance')}</p>
                <p className="font-medium">{payment.trip.distance}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t('trips.duration')}</p>
                <p className="font-medium">{payment.trip.duration}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passager et chauffeur */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('trips.passenger')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar
                    name={payment.passenger.name}
                    photoUrl={payment.passenger.photo}
                    type="passenger"
                    size="w-12 h-12"
                    className="mr-0"
                  />
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{payment.passenger.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{payment.passenger.phone}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-gray-400"><span className="font-medium">{t('common.email') || 'E-mail'}:</span> {payment.passenger.email || '-'}</p>
                  <p className="text-gray-500 dark:text-gray-400"><span className="font-medium">{t('common.rating') || 'Note'}:</span> {payment.passenger.rating}/5</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t('trips.driver')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Avatar
                    name={payment.driver.name}
                    photoUrl={payment.driver.photo}
                    type="driver"
                    size="w-12 h-12"
                    className="mr-0"
                  />
                  <div>
                    <p className="font-bold text-gray-800 dark:text-gray-100">{payment.driver.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{payment.driver.phone}</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="text-gray-500 dark:text-gray-400"><span className="font-medium">{t('drivers.vehicle', 'Véhicule')}:</span> {
                    payment.trip.vehicleType === 'MOTO' || payment.trip.vehicleType === 'MOTO_TAXI' ? t('services.moto_taxi', 'Moto-taxi') :
                      payment.trip.vehicleType === 'TAXI' || payment.trip.vehicleType === 'TAXI_PARTAGE' ? t('services.taxi_partage', 'Taxi partagé') :
                        payment.trip.vehicleType === 'PARTICULIER' || payment.trip.vehicleType === 'VOITURE_PRIVEE' ? t('services.voiture_privee', 'Voiture privée') :
                          payment.trip.vehicleType
                  }</p>
                  <p className="text-gray-500 dark:text-gray-400"><span className="font-medium">{t('common.rating', 'Note')}:</span> {payment.driver.rating !== '-' ? `${payment.driver.rating}/5` : t('common.not_rated', 'Non noté')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Détails financiers */}
        <Card>
          <CardHeader>
            <CardTitle>{t('payments.financial_details')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('payments.total_amount')}:</span>
                <span className="font-medium">{payment.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('common.commission')}: ({payment.commissionRate || '20%'}):</span>
                <span className="font-medium text-red-600">-{payment.commission}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">{t('payments.platform_fees')}:</span>
                <span className="font-medium">-{payment.fees?.platform || '0 GNF'}</span>
              </div>
              {payment.fees?.processing && payment.fees.processing !== '0 GNF' && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('payments.processing_fees')}:</span>
                  <span className="font-medium">-{payment.fees.processing}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-800 pt-3 mt-3">
                <div className="flex justify-between font-bold">
                  <span>{t('payments.net_driver_amount')}:</span>
                  <span className="text-green-600">{payment.netAmount}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informations techniques */}
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('payments.technical_info')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('payments.txn_id')}:</span>
                  <span className="font-medium">{payment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('payments.reference')}:</span>
                  <span className="font-medium">{payment.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">{t('payments.processed_at')}:</span>
                  <span className="font-medium">{payment.processedAt || t('payments.not_processed')}</span>
                </div>
                {/* <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Passerelle:</span>
                  <span className="font-medium">{payment.paymentGateway}</span>
                </div> */}
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={onClose}>
            {t('common.close')}
          </Button>
          {payment.invoiceGenerated && (
            <Button
              variant="perso"
              icon={Download}
              onClick={() => {
                onDownload(payment);
                onClose();
              }}>
              {t('payments.download_invoice')}
            </Button>
          )}
          <Button
            variant="secondary"
            icon={Share2}
            onClick={() => {
              navigator.clipboard.writeText(payment.id);
              showToast(t('common.saved'), t('payments.id_copied'), 'success');
            }}>
            {t('common.share')}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default PaymentDetailsModal;
