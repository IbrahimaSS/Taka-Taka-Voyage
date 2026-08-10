// src/components/chauffeur/ChauffeurTracking.jsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Car, Map, ArrowLeft } from 'lucide-react';
import Card, { CardTitle, CardContent } from '../admin/ui/Card';
import Button from '../admin/ui/Bttn';
import QRScannerWeb from '../common/QRScannerWeb';

import TrackingMap from './tracking/TrackingMap';
import PassengerList from './tracking/PassengerList';
import StatsPanel from './tracking/StatsPanel';
import RevenueOptimizationCard from './tracking/RevenueOptimizationCard';
import { useChauffeurTracking } from './tracking/useChauffeurTracking';

const ChauffeurTracking = () => {
    const { t } = useTranslation();
    const {
        acceptedTrips,
        currentPickupTripId,
        tripStep,
        driverLocation,
        selectPickupTrip,
        signalArrival,
        startTripImmediately,
        navigate,
        showScanner,
        setShowScanner,
        hasScannedTicket,
        handleQRScanSuccess,
        currentTime,
        speed,
        activeTrip,
        targetCoords,
        progress,
        distanceDisplay,
        etaMinutes,
        handleCallPassenger,
    } = useChauffeurTracking();

    // État vide
    if (acceptedTrips.length === 0) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center p-6">
                <Card className="max-w-4xl mx-auto" animate>
                    <CardContent className="text-center p-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', damping: 12 }}
                            className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mb-6"
                        >
                            <Car className="w-12 h-12 text-gray-400 dark:text-gray-500" />
                        </motion.div>
                        <CardTitle size="lg" className="mb-3">
                            {t('tracking.no_active_trip')}
                        </CardTitle>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            {t('tracking.no_active_trip_desc')}
                        </p>
                        <Button
                            variant="primary"
                            size="large"
                            icon={Map}
                            onClick={() => navigate('/chauffeur/trips')}
                            className="w-full"
                        >
                            {t('tracking.view_requests')}
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 max-w-7xl mx-auto pb-8"
        >
            {/* En-tête et statistiques */}
            <StatsPanel
                acceptedTrips={acceptedTrips}
                currentTime={currentTime}
                speed={speed}
                tripStep={tripStep}
                activeTrip={activeTrip}
                onCallPassenger={handleCallPassenger}
                signalArrival={signalArrival}
                startTripImmediately={startTripImmediately}
                navigate={navigate}
                progress={progress}
                distanceDisplay={distanceDisplay}
                etaMinutes={etaMinutes}
                onOpenScanner={() => setShowScanner(true)}
                hasScannedTicket={hasScannedTicket}
            />

            {/* Contenu principal */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Carte et contrôles */}
                <div className="lg:col-span-8 space-y-6">
                    <TrackingMap
                        driverLocation={driverLocation}
                        acceptedTrips={acceptedTrips}
                        targetCoords={targetCoords}
                    />
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <PassengerList
                        acceptedTrips={acceptedTrips}
                        currentPickupTripId={currentPickupTripId}
                        selectPickupTrip={selectPickupTrip}
                    />

                    <RevenueOptimizationCard acceptedTrips={acceptedTrips} />
                </div>
            </div>

            {/* Bouton retour */}
            <div className="fixed bottom-6 left-6 z-50">
                <Button
                    variant="secondary"
                    size="medium"
                    icon={ArrowLeft}
                    onClick={() => navigate(-1)}
                    tooltip={t('tracking.back_btn')}
                >
                    {t('tracking.back_btn')}
                </Button>
            </div>

            {showScanner && (
                <QRScannerWeb
                    onScanSuccess={handleQRScanSuccess}
                    onClose={() => setShowScanner(false)}
                />
            )}
        </motion.div>
    );
};

export default ChauffeurTracking;
