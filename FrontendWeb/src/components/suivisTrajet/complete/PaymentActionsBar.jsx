import { AlertTriangle, CheckCircle, Star, Lock } from 'lucide-react';

const PaymentActionsBar = ({
  role,
  paymentStatus,
  isPrepaid,
  isProcessing,
  onReportProblem,
  onPrimaryAction,
}) => (
  <div className="flex flex-col md:flex-row gap-4">
    <button
      onClick={onReportProblem}
      className="flex-1 bg-red-50 text-red-700 border border-red-200 py-4 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-3"
    >
      <AlertTriangle className="w-5 h-5" />
      <span>Signaler un problème</span>
    </button>

    {role === 'driver' ? (
      <button
        onClick={onPrimaryAction}
        disabled={isProcessing}
        className={`flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-3 ${(isProcessing && paymentStatus !== 'PAYE' && !isPrepaid) ? 'opacity-40 cursor-not-allowed grayscale' : 'shadow-lg'}`}
      >
        {(isProcessing && paymentStatus !== 'PAYE' && !isPrepaid) ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>En cours...</span>
          </>
        ) : (paymentStatus === 'PAYE' || isPrepaid) ? (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Terminer le trajet</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Confirmer le paiement</span>
          </>
        )}
      </button>
    ) : (
      <button
        onClick={onPrimaryAction}
        disabled={isProcessing}
        className={`flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 rounded-xl font-bold hover:opacity-90 transition flex items-center justify-center gap-3 ${(isProcessing && paymentStatus !== 'PAYE' && !isPrepaid) ? 'opacity-70 cursor-not-allowed' : ''}`}
      >
        {(isProcessing && paymentStatus !== 'PAYE' && !isPrepaid) ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
            <span>Attente chauffeur...</span>
          </>
        ) : (
          <>
            {(paymentStatus === 'PAYE' || isPrepaid) ? <Star className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
            <span>{(paymentStatus === 'PAYE' || isPrepaid) ? 'Noter le chauffeur' : 'Confirmer mon paiement'}</span>
          </>
        )}
      </button>
    )}
  </div>
);

export default PaymentActionsBar;
