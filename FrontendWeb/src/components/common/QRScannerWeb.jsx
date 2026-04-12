import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';

/**
 * QRScannerWeb - Composant de scan QR Premium pour le Web (PC)
 * @param {Function} onScanSuccess - Callback quand un code est validé
 * @param {Function} onClose - Callback pour fermer le scanner
 */
const QRScannerWeb = ({ onScanSuccess, onClose }) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const html5QrCodeRef = useRef(null);
  const scannerId = "taka-qr-reader";

  useEffect(() => {
    // Initialiser l'instance
    html5QrCodeRef.current = new Html5Qrcode(scannerId);
    
    // Démarrer la caméra automatiquement
    startScanner();

    return () => {
      stopScanner();
    };
  }, []);

  const startScanner = async () => {
    try {
      setError(null);
      setIsReady(false);
      
      const config = {
        fps: 15,
        qrbox: { width: 280, height: 280 },
        aspectRatio: 1.0
      };

      // Utiliser la caméra arrière par défaut (ou la première dispo sur PC)
      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        config,
        (decodedText) => {
          console.log(`Code détecté: ${decodedText}`);
          onScanResult(decodedText);
        },
        (errorMessage) => {
          // Ignorer les erreurs de scan continu
        }
      );
      
      setIsReady(true);
      setIsScanning(true);
    } catch (err) {
      console.error("Erreur caméra:", err);
      setError("Impossible d'accéder à la caméra. Vérifiez les autorisations.");
      setIsReady(true);
    }
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        setIsScanning(false);
      } catch (err) {
        console.error("Erreur arrêt scanner:", err);
      }
    }
  };

  const onScanResult = async (decodedText) => {
    // Feedback visuel / sonore pourrait être ajouté ici
    await stopScanner();
    onScanSuccess(decodedText);
  };

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(11, 17, 32, 0.95)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px'
      }}
      className="animate-in fade-in duration-300"
    >
      <div 
        style={{
          width: '100%',
          maxWidth: '420px',
          backgroundColor: '#1E293B',
          borderRadius: '2.5rem',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(255, 255, 255, 0.15)',
        }}
        className="qr-modal-container scale-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Compact Premium */}
        <div className="p-5 flex justify-between items-center bg-gradient-to-r from-[#00A88E] to-[#005C97] text-white shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2.5 rounded-2xl backdrop-blur-md border border-white/30 shadow-inner">
              <Camera size={22} className="animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight uppercase leading-none">Scanner le Ticket</h3>
              <p className="text-white/70 text-[9px] font-black uppercase tracking-[0.2em] mt-1.5">Validation Taka-Taka</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-all active:scale-90 shadow-lg"
          >
            <X size={20} />
          </button>
        </div>

        {/* Camera Area */}
        <div className="p-8 relative flex-1 flex flex-col items-center">
          {!isReady && (
            <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1E293B]">
              <div className="w-12 h-12 border-4 border-[#00A88E] border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-400 font-bold animate-pulse uppercase text-[11px] tracking-widest font-poppins">Initialisation...</p>
            </div>
          )}

          {error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mb-6 border border-red-500/10">
                <AlertCircle size={40} />
              </div>
              <h4 className="text-xl font-black text-white mb-3 uppercase tracking-tight">Accès Refusé</h4>
              <p className="text-sm text-gray-400 mb-8 px-6 leading-relaxed font-medium">{error}</p>
              <button 
                onClick={startScanner}
                className="flex items-center gap-3 px-10 py-4 bg-[#00A88E] text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#008f79] transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                <RefreshCw size={18} /> Réessayer
              </button>
            </div>
          ) : (
            <>
              <div className="relative rounded-[2rem] overflow-hidden border-4 border-slate-700/50 shadow-2xl aspect-square bg-black flex items-center justify-center w-full max-w-[320px] ring-8 ring-white/5">
                <div id={scannerId} className="w-full h-full [&>video]:object-cover [&>video]:w-full [&>video]:h-full"></div>
                
                {/* Custom Focus Frame Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 p-10">
                  <div className="w-full h-full relative border border-white/5 rounded-[2rem]">
                    <div className="absolute -top-1 -left-1 w-12 h-12 border-l-[5px] border-t-[5px] border-[#00FFD1] rounded-tl-[1.8rem] shadow-[0_0_20px_rgba(0,255,209,0.6)]"></div>
                    <div className="absolute -top-1 -right-1 w-12 h-12 border-r-[5px] border-t-[5px] border-[#00FFD1] rounded-tr-[1.8rem] shadow-[0_0_20px_rgba(0,255,209,0.6)]"></div>
                    <div className="absolute -bottom-1 -left-1 w-12 h-12 border-l-[5px] border-b-[5px] border-[#00FFD1] rounded-bl-[1.8rem] shadow-[0_0_20px_rgba(0,255,209,0.6)]"></div>
                    <div className="absolute -bottom-1 -right-1 w-12 h-12 border-r-[5px] border-b-[5px] border-[#00FFD1] rounded-br-[1.8rem] shadow-[0_0_20px_rgba(0,255,209,0.6)]"></div>
                    
                    {/* Dynamic Scanning Line */}
                    {isScanning && (
                      <div className="absolute left-0 top-0 w-full h-[2.5px] bg-[#00FFD1] animate-scan-line shadow-[0_0_25px_#00FFD1,0_0_10px_#00FFD1] z-20"></div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col items-center text-center">
                <div className="bg-[#00A88E]/15 px-6 py-2.5 rounded-2xl mb-4 border border-[#00A88E]/30 shadow-lg shadow-[#00A88E]/5">
                  <p className="text-[#00FFD1] text-[10px] font-black flex items-center gap-3 uppercase tracking-[0.05em]">
                    <ShieldCheck size={18} className="animate-bounce" />
                    Placez le code au centre
                  </p>
                </div>
                <p className="text-gray-400 text-[10px] font-bold leading-relaxed max-w-[260px] uppercase tracking-wide opacity-80">
                  Le système détectera automatiquement le ticket du passager.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer Compact */}
        <div className="p-6 bg-[#0B1120]/50 border-t border-white/5 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-700/80 hover:bg-slate-700 text-gray-200 rounded-2xl font-black uppercase tracking-[0.25em] text-[10px] transition-all active:scale-95 shadow-xl border border-white/5"
          >
            Annuler
          </button>
        </div>
      </div>

      <style jsx>{`
        #${scannerId} video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line {
          position: absolute;
          animation: scan-line 2s ease-in-out infinite;
        }
        .qr-modal-container {
          animation: modal-enter 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes modal-enter {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default QRScannerWeb;
