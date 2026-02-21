import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import DisputeReportingModal from './DisputeReportingModal';
import Button from '../admin/ui/Bttn';

const FloatingDisputeButton = ({ currentTrip, role, offset = 6 }) => {
    const [showModal, setShowModal] = useState(false);

    if (!currentTrip) return null;

    const bottomPos = `${2 + offset}rem`;

    return (
        <>
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="fixed right-8 z-40"
                style={{ bottom: bottomPos }}
            >
                <Button
                    variant="warning"
                    size="large"
                    className="!rounded-full !w-16 !h-16 !p-0 shadow-2xl hover:shadow-3xl flex items-center justify-center transition-all bg-amber-500 hover:bg-amber-600 border-none"
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

export default FloatingDisputeButton;
