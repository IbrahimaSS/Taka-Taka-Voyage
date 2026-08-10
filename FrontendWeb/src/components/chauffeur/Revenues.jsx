import { useTranslation } from "react-i18next";
import { DollarSign } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import PremiumInvoice from "../admin/ui/PremiumInvoice";

import { useRevenues } from "./revenues/useRevenues";
import { getPaymentIcon, getPaymentLabel } from "./revenues/paymentMethodUtils";
import RevenueDetailModal from "./revenues/RevenueDetailModal";
import RevenueSummaryCards from "./revenues/RevenueSummaryCards";
import CommissionBanner from "./revenues/CommissionBanner";
import RevenueFilters from "./revenues/RevenueFilters";
import RevenueTable from "./revenues/RevenueTable";

const Revenues = ({ onToast }) => {
    const { t, i18n } = useTranslation();
    const { user } = useAuth();
    const {
        selectedPeriod,
        setSelectedPeriod,
        selectedPaymentMethod,
        setSelectedPaymentMethod,
        loading,
        selectedRide,
        showDetailModal,
        setShowDetailModal,
        showReceipt,
        setShowReceipt,
        summaryData,
        filteredData,
        totalCommission,
        totalNet,
        formatAmount,
        formatDate,
        handleViewRide,
    } = useRevenues({ onToast, t, i18n });

    const boundGetPaymentLabel = (method) => getPaymentLabel(method, t);

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-6">
            <RevenueDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                ride={selectedRide}
                formatAmount={formatAmount}
                formatDate={formatDate}
                getPaymentIcon={getPaymentIcon}
                getPaymentLabel={boundGetPaymentLabel}
                onShowReceipt={() => {
                    setShowReceipt(true);
                    setShowDetailModal(false);
                }}
            />

            {showReceipt && selectedRide && (
                <PremiumInvoice
                    payment={{
                        invoiceNumber: `INV-${(selectedRide.id || '').substring(0, 8).toUpperCase() || '000'}`,
                        date: formatDate(selectedRide.date),
                        transactionId: null,
                        status: (selectedRide.verse === true || selectedRide.verse === 'true') ? 'paid' : 'pending',
                        method: selectedRide.paymentMethod || 'cash',
                        amount: formatAmount(selectedRide.montantBrut),
                        passenger: {
                            name: selectedRide.passager?.name || t('revenues.unknown_passenger'),
                            phone: selectedRide.passager?.phone || selectedRide.telephonePassager || '-',
                            email: selectedRide.passager?.email || selectedRide.emailPassager || '-'
                        },
                        driver: {
                            name: user ? [user.prenom, user.nom].filter(Boolean).join(' ').trim() || (t('common.me') || 'Vous') : (t('common.me') || 'Vous'),
                            vehicle: user?.vehicule?.modele || user?.vehicule?.marque || user?.vehicule || (t('common.my_vehicle') || 'Votre véhicule'),
                            phone: user?.telephone || user?.phone || '-',
                            email: user?.email || '-'
                        },
                        trip: {
                            route: `${selectedRide.depart} → ${selectedRide.destination}`,
                            distance: `${selectedRide.distanceKm || '-'} km`,
                            duration: `${selectedRide.dureeMin || '-'} min`
                        },
                        fees: {
                            platform: formatAmount(selectedRide.commission)
                        }
                    }}
                    onClose={() => setShowReceipt(false)}
                />
            )}

            {/* En-tête */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <DollarSign className="w-6 h-6 text-green-500" />
                        {t('revenues.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">{t('revenues.subtitle')}</p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-8 text-gray-600 dark:text-gray-400 font-medium">
                    {t('revenues.loading')}
                </div>
            ) : (
                <>
                    <RevenueSummaryCards summaryData={summaryData} formatAmount={formatAmount} />

                    <CommissionBanner totalCommission={totalCommission} totalNet={totalNet} formatAmount={formatAmount} />

                    <RevenueFilters
                        selectedPeriod={selectedPeriod}
                        setSelectedPeriod={setSelectedPeriod}
                        selectedPaymentMethod={selectedPaymentMethod}
                        setSelectedPaymentMethod={setSelectedPaymentMethod}
                    />

                    <RevenueTable
                        filteredData={filteredData}
                        formatAmount={formatAmount}
                        formatDate={formatDate}
                        onViewRide={handleViewRide}
                    />
                </>
            )}
        </div>
    );
};

export default Revenues;
