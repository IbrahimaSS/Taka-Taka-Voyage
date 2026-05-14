import React, { useRef, useState } from 'react';
import {
    Download, Printer, ZoomIn, ZoomOut,
    Maximize2, X, Check, MapPin, Phone,
    Mail, Globe, Calendar, Hash, User,
    Car, CreditCard, ShieldCheck, Hourglass
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../../../context/SettingsContext';
import { apiClient } from '../../../services/apiClient';

const PremiumInvoice = ({ payment, onClose }) => {
    const { settings } = useSettings();
    const { t } = useTranslation();
    const [zoom, setZoom] = useState(0.85); // Légèrement dézoomé par défaut pour tout voir
    const printRef = useRef();

    const platformName = 'Taka Taka';
    const platformLogo = settings?.platform?.logo;

    // Dégradé signature : Bleu doux vers Vert
    const softGradient = "bg-gradient-to-r from-blue-500 to-emerald-500";

    const handlePrint = async () => {
        const printContent = printRef.current;

        // ✅ JOURNAL D'ACTIVITÉ (LOG MANUEL)
        try {
            await apiClient.post('/admin/logs/manuel', {
                action: "IMPRESSION_RECU_FISCAL",
                module: "PAIEMENTS",
                details: { 
                    reference: payment?.reference || payment?.invoiceNumber,
                    montant: payment?.amount,
                    type: payment?.type
                }
            });
        } catch (e) {
            console.warn("Log manuel failed", e);
        }

        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        printWindow.document.write(`
      <html>
        <head>
          <title>Facture {payment?.invoiceNumber || payment?.reference || 'TakaTaka'}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <style>
            @media print {
              body { padding: 0 !important; margin: 0 !important; }
              .no-print { display: none !important; }
               @page { size: A4; margin: 0; }
            }
            body { 
              font-family: 'Montserrat', sans-serif; 
              background: white;
            }
            .invoice-a4 {
              width: 210mm;
              height: 297mm;
              position: relative;
              background: white;
              overflow: hidden;
            }
          </style>
        </head>
        <body class="m-0 p-0">
          <div class="invoice-a4">
            ${printContent.innerHTML}
          </div>
          <script>
            window.onload = () => {
              window.print();
              window.close();
            };
          </script>
        </body>
      </html>
    `);
        printWindow.document.close();
        printWindow.focus();
    };

    const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 1.5));
    const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-950 w-full max-w-6xl h-[95vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800"
            >
                {/* Header / Toolbar */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shadow-sm z-10">
                    <div className="flex items-center gap-4 text-slate-800 dark:text-slate-100">
                        <div className="flex items-center gap-3">
                            <span className={`p-2 ${softGradient} rounded-lg shadow-lg`}>
                                <Printer className="w-5 h-5 text-white" />
                            </span>
                            <div className="flex flex-col">
                                <h2 className="text-base font-bold leading-tight">Facture Premium Taka Taka</h2>
                                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Format Professionnel A4</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 gap-1 border border-slate-200/50 dark:border-slate-700/50">
                            <button
                                onClick={handleZoomOut}
                                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-600 dark:text-slate-400"
                                title="Zoom arrière"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="px-3 text-xs font-black text-slate-700 dark:text-slate-200 min-w-[55px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-all text-slate-600 dark:text-slate-400"
                                title="Zoom avant"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white hover:bg-black transition-all font-bold text-sm rounded-xl"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Imprimer</span>
                        </button>
                        <button
                            onClick={handlePrint}
                            className={`flex items-center gap-2 px-5 py-2.5 ${softGradient} text-white rounded-xl transition-all font-bold text-sm shadow-lg shadow-blue-500/20`}
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all text-slate-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Invoice Canvas */}
                <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950/50 p-4 md:p-8 flex justify-center items-start scrollbar-hide">
                    <div
                        ref={printRef}
                        className="bg-white shadow-[0_0_50px_-12px_rgba(0,0,0,0.15)] origin-top transition-transform duration-300 relative border-box overflow-hidden"
                        style={{
                            width: '210mm',
                            height: '297mm',
                            transform: `scale(${zoom})`,
                            fontFamily: "'Montserrat', sans-serif"
                        }}
                    >
                        {/* 1. Gradient Border Updated */}
                        <div className="absolute inset-0 pointer-events-none border-[12px] border-white z-50"></div>
                        <div className={`absolute inset-[12px] pointer-events-none border-2 border-transparent bg-gradient-to-br from-blue-500 to-emerald-500 [mask-image:linear-gradient(white,white),linear-gradient(white,white)] [mask-clip:content-box,border-box] [mask-composite:exclude] z-50`}></div>

                        {/* Main Content Container - Optimized Spacing */}
                        <div className="p-[20mm] h-full flex flex-col relative z-10 text-slate-900">

                            {/* Header Section */}
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-4">
                                    {platformLogo ? (
                                        <img src={platformLogo} alt="Logo" className="w-16 h-16 object-contain" />
                                    ) : (
                                        <div className={`w-16 h-16 ${softGradient} rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg`}>
                                            T
                                        </div>
                                    )}
                                    <div className="space-y-0.5">
                                        <h1 className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-500">Taka Taka</h1>
                                        <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-[0.3em]">Plateforme de Voyage</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-1 rounded-xl shadow-sm">
                                    <div className={`px-4 py-1.5 ${softGradient} text-white font-black text-[10px] uppercase tracking-widest rounded-lg`}>Facture</div>
                                    <div className="px-3 py-1.5 text-slate-800 font-extrabold text-xs tracking-tight">{payment?.reference || payment?.invoiceNumber || '-'}</div>
                                </div>
                            </div>

                            {/* Info Section - Slightly more compact */}
                            <div className="grid grid-cols-2 gap-12 mb-8 px-2">
                                <div className="space-y-4">
                                    <div>
                                        <h4 className={`text-[8px] font-black text-blue-500 uppercase tracking-[0.2em] mb-2`}>Émetteur du reçu</h4>
                                        <p className="font-extrabold text-slate-800 text-xs tracking-tight">Taka Taka</p>
                                        <div className="flex items-center gap-2 text-slate-500 text-[10px] mt-1">
                                            <MapPin className="w-3 h-3 text-emerald-500" /> Conakry, Guinée
                                        </div>
                                    </div>

                                    <div className="flex gap-6 pt-2">
                                        <div>
                                            <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Date d'émission</h4>
                                            <p className="text-[10px] font-bold text-slate-700">{payment?.date || '-'}</p>
                                        </div>
                                        <div>
                                            <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Mode de Paiement</h4>
                                            <p className="text-[10px] font-bold text-slate-700">{payment?.method?.toUpperCase() || 'CASH'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-200 flex flex-col justify-center items-center">
                                    <h4 className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total à Régler</h4>
                                    <p className="text-3xl font-black tracking-tight text-blue-600 mb-2">{payment?.amount || '0 GNF'}</p>
                                    <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 ${payment?.status === 'confirmed' || payment?.status === 'paid' || payment?.status === 'completed'
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-amber-500 text-white'
                                        }`}>
                                        {payment?.status === 'confirmed' || payment?.status === 'paid' || payment?.status === 'completed' ? <Check className="w-2.5 h-2.5" /> : <Hourglass className="w-2.5 h-2.5" />}
                                        {payment?.status === 'confirmed' || payment?.status === 'paid' || payment?.status === 'completed' ? 'Paiement Confirmé' : 'Attente'}
                                    </div>
                                </div>
                            </div>

                            {/* Client & Driver Mirror Design */}
                            <div className="grid grid-cols-2 gap-8 mb-8 px-2">
                                {/* Client - Mirrored from Driver style */}
                                <div className="p-5 bg-white rounded-2xl border-l-[6px] border-blue-500 shadow-sm border-y border-r border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500"><User className="w-3.5 h-3.5" /></div>
                                        <h3 className="font-black text-slate-800 text-[9px] uppercase tracking-widest">Client (Destinataire)</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900 tracking-tight truncate">{(payment?.passenger?.name || payment?.passenger?.nomComplet) || '-'}</p>
                                        <div className="text-[10px] text-slate-500 space-y-1">
                                            <p className="flex items-center gap-2 font-semibold"><Phone className="w-3 h-3 text-blue-400" /> {payment?.passenger?.phone || payment?.passenger?.telephone || '-'}</p>
                                            <p className="flex items-center gap-2 font-semibold truncate"><Mail className="w-3 h-3 text-blue-400" /> {payment?.passenger?.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Driver style preserved */}
                                <div className="p-5 bg-white rounded-2xl border-l-[6px] border-emerald-500 shadow-sm border-y border-r border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-600"><Car className="w-3.5 h-3.5" /></div>
                                        <h3 className="font-black text-slate-800 text-[9px] uppercase tracking-widest">Chauffeur (Prestataire)</h3>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-black text-slate-900 tracking-tight truncate">{payment?.driver?.name || '-'}</p>
                                        <div className="text-[10px] text-slate-500 space-y-1">
                                            <p className="flex items-center gap-2 font-semibold"><Car className="w-3 h-3 text-emerald-400" /> {payment?.driver?.vehicle || 'Véhicule standard'}</p>
                                            <p className="flex items-center gap-2 font-semibold"><Phone className="w-3 h-3 text-emerald-400" /> {payment?.driver?.phone || payment?.driver?.telephone || '-'}</p>
                                            <p className="flex items-center gap-2 font-semibold truncate"><Mail className="w-3 h-3 text-emerald-400" /> {payment?.driver?.email || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Gradient Table Header */}
                            <div className="mb-8 px-2">
                                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className={`${softGradient} text-white`}>
                                                <th className="px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] w-1/2">
                                                    {payment?.type === 'transaction' ? 'Désignation de l’opération' : 'Désignation du trajet'}
                                                </th>
                                                {payment?.type !== 'transaction' && (
                                                    <>
                                                        <th className="px-4 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-center border-l border-white/20">Distance</th>
                                                        <th className="px-4 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-center border-l border-white/20">Durée</th>
                                                    </>
                                                )}
                                                <th className={`px-6 py-4 text-[9px] font-black uppercase tracking-[0.2em] text-right ${payment?.type !== 'transaction' ? 'border-l border-white/20' : ''}`}>Montant</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200">
                                            <tr>
                                                <td className="px-6 py-6 font-medium">
                                                    <div className="space-y-3">
                                                        <span className="block font-black text-slate-900 text-sm leading-tight uppercase">
                                                            {payment?.type === 'transaction' ? (payment?.trip?.route || 'OPÉRATION PORTEFEUILLE') : 'COURSE TAKATAKA PREMIUM'}
                                                        </span>
                                                        {payment?.type !== 'transaction' && (
                                                            <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1.5 items-start">
                                                                <div className="w-1 h-1 rounded-full bg-blue-500 mt-1.5"></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Départ</span>
                                                                    <span className="text-[10px] font-bold text-slate-700">{payment?.trip?.route?.split('→')[0]?.trim() || '-'}</span>
                                                                </div>
                                                                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5"></div>
                                                                <div className="flex flex-col">
                                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Arrivée</span>
                                                                    <span className="text-[10px] font-bold text-slate-700">{payment?.trip?.route?.split('→')[1]?.trim() || '-'}</span>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {payment?.type === 'transaction' && (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-1 h-1 rounded-full bg-blue-500"></div>
                                                                <p className="text-[10px] font-bold text-slate-500 italic">Preuve numérique d’opération financière sur le compte.</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                                {payment?.type !== 'transaction' && (
                                                    <>
                                                        <td className="px-4 py-6 text-center align-top pt-8 border-l border-slate-100">
                                                            <span className="text-xs font-black text-slate-800">{payment?.trip?.distance || '-'}</span>
                                                        </td>
                                                        <td className="px-4 py-6 text-center align-top pt-8 border-l border-slate-100">
                                                            <span className="text-xs font-black text-slate-800">{payment?.trip?.duration === '-' ? '0 min' : (payment?.trip?.duration || '0 min')}</span>
                                                        </td>
                                                    </>
                                                )}
                                                <td className={`px-6 py-6 text-right align-top pt-8 ${payment?.type !== 'transaction' ? 'border-l border-slate-100' : ''}`}>
                                                    <span className="text-sm font-black text-slate-950">{payment?.amount || '0 GNF'}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Summary & Footer - Consolidated */}
                            <div className="flex justify-end pr-4 mb-10 mt-auto">
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                                        <span className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Sous-total</span>
                                        <span className="text-right font-bold text-slate-700">{payment?.amount || '0 GNF'}</span>

                                        {payment?.fees?.platform && (
                                            <>
                                                <span className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Commission Plateforme</span>
                                                <span className="text-right font-bold text-red-500">-{payment.fees.platform}</span>
                                            </>
                                        )}

                                        <span className="text-slate-400 font-black uppercase tracking-widest text-[8px]">Taxes Incl.</span>
                                        <span className="text-right font-bold text-slate-700">18%</span>
                                    </div>
                                    <div className="pt-2 border-t border-slate-200 border-dashed flex justify-between items-center">
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-900">Total TTC</span>
                                        <span className="text-xl font-black tracking-tighter text-blue-600">{payment?.amount || '0 GNF'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="flex justify-between items-end px-2">
                                    <div className="space-y-3 max-w-[250px]">
                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-emerald-50 text-emerald-600 rounded-lg w-fit">
                                            <ShieldCheck className="w-3 h-3" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Certifié Taka Taka</span>
                                        </div>
                                        <p className="text-[8px] text-slate-400 leading-normal italic">
                                            Preuve numérique de paiement. Validité juridique pour toutes fins administratives sur la plateforme Taka Taka.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="relative">
                                            <p className="font-signature text-2xl text-blue-500/60 italic font-serif -rotate-6 tracking-tight pr-2">
                                                Admin TakaTaka
                                            </p>
                                            <div className={`absolute -bottom-1.5 left-0 right-0 h-[1.5px] ${softGradient} opacity-30`}></div>
                                        </div>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Signature Autoritaire</p>
                                    </div>
                                </div>

                                <div className={`relative h-1.5 w-full flex rounded-full overflow-hidden shadow-sm shadow-blue-500/10`}>
                                    <div className={`h-full w-full ${softGradient}`}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PremiumInvoice;
