import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Flag, MessageSquare } from 'lucide-react';
import DisputeReportingModal from './DisputeReportingModal';
import Button from '../admin/ui/Bttn';
import { usePassenger } from '../../context/PassengerContext';
import { useDriver } from '../../context/DriverContext';

const DisputeButton = ({ role }) => {
    const [showModal, setShowModal] = useState(false);

    // Accès sécurisé aux contextes
    const passengerContext = React.useContext(require('../../context/PassengerContext').PassengerContext);
    const driverContext = React.useContext(require('../../context/DriverContext').DriverContext);

    const currentTrip = role === 'chauffeur'
        ? driverContext?.currentTrip
        : passengerContext?.currentTrip;

    // On n'affiche le bouton que si une course est active
    if (!currentTrip) return null;

    return (
        <>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-28 right-8 z-40"
            >
                <Button
                    variant="warning"
                    size="large"
                    className="!rounded-full !w-16 !h-16 !p-0 shadow-2xl hover:shadow-3xl bg-amber-500 hover:bg-amber-600 border-none"
                    onClick={() => setShowModal(true)}
                    icon={Flag}
                />
            </motion.div>

            <DisputeReportingModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                reservationId={currentTrip._id || currentTrip.reservationId}
                role={role}
            />
        </>
    );
};

export default DisputeButton;
