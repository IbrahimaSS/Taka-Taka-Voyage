import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { usePassenger } from '../../../context/PassengerContext';
import { apiClient } from '../../../services/apiClient';

export const useTransactionActions = () => {
  const { t } = useTranslation();
  const { passenger } = usePassenger();

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  const handleViewDetails = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleShareReceipt = async (transaction) => {
    // Journal d'activité (log manuel)
    try {
      await apiClient.post('/admin/logs/manuel', {
        action: "PARTAGE_RECU",
        module: "PAIEMENTS",
        details: { reference: transaction.reference, montant: transaction.amount }
      });
    } catch (e) { console.warn("Log manuel failed", e); }

    const shareText = t('transactions.messages.share_text', {
      type: transaction.type,
      amount: Math.abs(transaction.amount).toLocaleString(),
      date: transaction.date
    });

    if (navigator.share) {
      navigator.share({
        title: 'Reçu TakaTaka',
        text: shareText,
      });
    } else {
      navigator.clipboard.writeText(shareText);
      toast.success(t('transactions.messages.receipt_copied'));
    }
  };

  const handleCopyReference = (reference) => {
    navigator.clipboard.writeText(reference);
    toast.success(t('transactions.messages.ref_copied'));
  };

  const handleShowInvoice = (transaction) => {
    // Fermer la modale de détails pour ne pas avoir d'overlay conflictuel
    setShowDetailsModal(false);

    // Transformer l'objet transaction pour qu'il soit compatible avec PremiumInvoice
    const formattedInvoice = {
      invoiceNumber: transaction.reference,
      date: transaction.date,
      transactionId: transaction.id,
      status: transaction.status === 'completed' ? 'paid' : 'pending',
      method: transaction.method,
      amount: `${Math.abs(transaction.amount).toLocaleString()} GNF`,
      passenger: {
        name: `${passenger?.prenom || ''} ${passenger?.nom || ''}`,
        phone: passenger?.telephone || '-',
        email: passenger?.email || '-'
      },
      driver: {
        name: transaction.details?.driverName || 'Chauffeur TakaTaka',
        vehicle: transaction.details?.vehicleInfo || 'Véhicule standard',
        phone: transaction.details?.driverPhone || '-',
        email: transaction.details?.driverEmail || '-'
      },
      trip: {
        route: transaction.details?.route || 'Trajet TakaTaka',
        distance: transaction.details?.distance || '0 km',
        duration: transaction.details?.duration || '0 min'
      },
      fees: {
        platform: 'Incl.'
      }
    };
    setInvoiceData(formattedInvoice);
    setShowInvoice(true);
  };

  return {
    selectedTransaction,
    showDetailsModal, setShowDetailsModal,
    showInvoice, setShowInvoice,
    invoiceData,
    handleViewDetails,
    handleShareReceipt,
    handleCopyReference,
    handleShowInvoice,
  };
};
