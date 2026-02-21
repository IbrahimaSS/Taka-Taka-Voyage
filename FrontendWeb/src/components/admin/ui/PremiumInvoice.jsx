import React, { useRef, useState } from 'react';
import {
    Download, Printer, ZoomIn, ZoomOut,
    Maximize2, X, Check, MapPin, Phone,
    Mail, Globe, Calendar, Hash, User,
    Car, CreditCard, ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../../../context/SettingsContext';

const PremiumInvoice = ({ payment, onClose }) => {
    const { settings } = useSettings();
    const [zoom, setZoom] = useState(1);
    const printRef = useRef();

    const platformName = settings?.platform?.name || 'Taka Taka Voyage';
    const platformLogo = settings?.platform?.logo;
    const platformColor = '#10B981'; // Emerald 500

    const handlePrint = () => {
        const printContent = printRef.current;
        const windowUrl = 'about:blank';
        const uniqueName = new Date();
        const windowName = 'Print' + uniqueName.getTime();
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=0,height=0');

        printWindow.document.write(`
      <html>
        <head>
          <title>Facture ${payment.invoiceNumber}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @media print {
              body { padding: 0; margin: 0; }
              .no-print { display: none; }
            }
            body { font-family: 'Inter', sans-serif; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header / Toolbar */}
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                                <Printer className="w-5 h-5 text-primary-600" />
                            </span>
                            Aperçu de la facture
                        </h2>
                        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2 hidden md:block" />
                        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                            <button
                                onClick={handleZoomOut}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition text-slate-600 dark:text-slate-400"
                                title="Zoom arrière"
                            >
                                <ZoomOut className="w-4 h-4" />
                            </button>
                            <span className="px-3 text-sm font-medium text-slate-700 dark:text-slate-300 min-w-[60px] text-center">
                                {Math.round(zoom * 100)}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-md transition text-slate-600 dark:text-slate-400"
                                title="Zoom avant"
                            >
                                <ZoomIn className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition font-medium"
                        >
                            <Printer className="w-4 h-4" />
                            <span className="hidden sm:inline">Imprimer</span>
                        </button>
                        <button
                            onClick={() => {/* Custom PDF logic if needed, otherwise Print to PDF */ handlePrint() }}
                            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition font-medium shadow-lg shadow-primary-500/20"
                        >
                            <Download className="w-4 h-4" />
                            <span className="hidden sm:inline">Exporter PDF</span>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition text-slate-500"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Invoice Canvas */}
                <div className="flex-1 overflow-auto bg-slate-100 dark:bg-slate-950 p-8 flex justify-center">
                    <div
                        ref={printRef}
                        className="bg-white shadow-xl origin-top transition-transform duration-200"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '20mm',
                            transform: `scale(${zoom})`
                        }}
                    >
                        {/* Invoice Content Start */}
                        <div className="invoice-container text-slate-800 h-full flex flex-col">
                            {/* Header Design */}
                            <div className="flex justify-between items-start mb-12">
                                <div className="flex items-center gap-4">
                                    {platformLogo ? (
                                        <img src={platformLogo} alt="Logo" className="w-16 h-16 object-contain" />
                                    ) : (
                                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                                            T
                                        </div>
                                    )}
                                    <div>
                                        <h1 className="text-2xl font-black tracking-tight text-slate-900">{platformName}</h1>
                                        <p className="text-slate-500 font-medium uppercase text-xs tracking-widest px-1">Plateforme de Voyage</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="inline-block px-4 py-1 bg-slate-900 text-white font-bold text-sm rounded-lg mb-2">FACTURE</div>
                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-tighter">Référence</p>
                                    <p className="text-slate-900 font-bold">{payment.invoiceNumber}</p>
                                </div>
                            </div>

                            {/* Info Bar */}
                            <div className="grid grid-cols-3 gap-8 p-6 bg-slate-50 rounded-2xl mb-10 border border-slate-100">
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Emetteur</h4>
                                    <p className="font-bold text-slate-900 text-sm">{platformName}</p>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                        <MapPin className="w-3 h-3" /> Conakry, Guinée
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs mt-1">
                                        <Mail className="w-3 h-3" /> contact@takataka.com
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Informations</h4>
                                    <div className="flex items-center gap-2 text-slate-700 text-xs">
                                        <Calendar className="w-3 h-3 text-slate-400" />
                                        <span className="font-bold">Date:</span> {payment.date}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700 text-xs mt-1">
                                        <Hash className="w-3 h-3 text-slate-400" />
                                        <span className="font-bold">ID:</span> {payment.transactionId}
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-700 text-xs mt-1">
                                        <CreditCard className="w-3 h-3 text-slate-400" />
                                        <span className="font-bold">Méthode:</span> {payment.method.toUpperCase()}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total à payer</h4>
                                    <p className="text-3xl font-black text-emerald-600">{payment.amount}</p>
                                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold uppercase">
                                        <Check className="w-3 h-3" /> Paiement Confirmé
                                    </div>
                                </div>
                            </div>

                            {/* Client & Provider */}
                            <div className="grid grid-cols-2 gap-12 mb-10 px-4">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <User className="w-4 h-4 text-primary-500" />
                                        <h3 className="font-bold text-slate-900 text-sm">Destinaire (Client)</h3>
                                    </div>
                                    <div className="pl-6 space-y-1">
                                        <p className="text-base font-bold text-slate-800">{payment.passenger.name}</p>
                                        <p className="text-sm text-slate-500">{payment.passenger.phone}</p>
                                        <p className="text-sm text-slate-500">{payment.passenger.email || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <Car className="w-4 h-4 text-primary-500" />
                                        <h3 className="font-bold text-slate-900 text-sm">Prestataire (Chauffeur)</h3>
                                    </div>
                                    <div className="pl-6 space-y-1">
                                        <p className="text-base font-bold text-slate-800">{payment.driver.name}</p>
                                        <p className="text-sm text-slate-500">{payment.driver.vehicle}</p>
                                        <p className="text-sm text-slate-500">{payment.driver.phone}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Course Details Table */}
                            <div className="mb-10 flex-1">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-900 text-white">
                                            <th className="px-6 py-4 rounded-tl-xl text-xs font-bold uppercase tracking-widest">Désignation du trajet</th>
                                            <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-center">Distance</th>
                                            <th className="px-4 py-4 text-xs font-bold uppercase tracking-widest text-center">Durée</th>
                                            <th className="px-6 py-4 rounded-tr-xl text-xs font-bold uppercase tracking-widest text-right">Montant</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 border-x border-b border-slate-100 rounded-b-xl">
                                        <tr>
                                            <td className="px-6 py-8">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 text-lg">Course Standard Taka Taka</span>
                                                    <span className="text-xs text-slate-400 mt-2 font-medium uppercase tracking-tighter">De:</span>
                                                    <span className="text-sm text-slate-700 font-medium">{payment.trip.route.split('→')[0].trim()}</span>
                                                    <span className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-tighter">Vers:</span>
                                                    <span className="text-sm text-slate-700 font-medium">{payment.trip.route.split('→')[1]?.trim() || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-8 text-center align-top">
                                                <span className="inline-block px-3 py-1 bg-slate-100 rounded-full font-bold text-slate-700 text-sm">
                                                    {payment.trip.distance}
                                                </span>
                                            </td>
                                            <td className="px-4 py-8 text-center align-top">
                                                <span className="inline-block px-3 py-1 bg-slate-100 rounded-full font-bold text-slate-700 text-sm">
                                                    {payment.trip.duration}
                                                </span>
                                            </td>
                                            <td className="px-6 py-8 text-right align-top">
                                                <span className="text-lg font-black text-slate-900">{payment.amount}</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Financial Recap */}
                            <div className="flex justify-end mb-16">
                                <div className="w-full max-w-xs space-y-3">
                                    <div className="flex justify-between items-center text-slate-500 text-sm">
                                        <span>Sous-total</span>
                                        <span className="font-bold">{payment.amount}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 text-sm">
                                        <span>Frais de service (Incl.)</span>
                                        <span className="font-bold">{payment.fees?.platform || '0 GNF'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 text-sm">
                                        <span>TVA (18% Incl.)</span>
                                        <span className="font-bold">Calculé</span>
                                    </div>
                                    <div className="h-px bg-slate-200 mt-4 mb-2"></div>
                                    <div className="flex justify-between items-center text-slate-900">
                                        <span className="text-lg font-bold">TOTAL TTC</span>
                                        <span className="text-2xl font-black">{payment.amount}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Part */}
                            <div className="mt-auto">
                                <div className="grid grid-cols-2 items-end">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Certifié conforme par Taka Taka</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 leading-relaxed max-w-xs italic">
                                            Cette facture électronique tient lieu de document officiel de paiement pour la prestation de transport effectuée. En cas de litige, veuillez vous munir du numéro de référence en haut de ce document.
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <div className="mb-2">
                                            {/* E-Signature Placeholder */}
                                            <div className="relative">
                                                <p className="font-signature text-3xl text-blue-600/60 transform -rotate-6 select-none italic font-serif">
                                                    Admin TakaTaka
                                                </p>
                                                <div className="absolute -bottom-2 left-0 right-0 h-px bg-slate-300 transform rotate-1"></div>
                                            </div>
                                        </div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Signature de l'administrateur</p>
                                    </div>
                                </div>

                                {/* Bottom Bar Design */}
                                <div className="mt-12 h-2 w-full flex rounded-full overflow-hidden">
                                    <div className="h-full w-1/2 bg-blue-600"></div>
                                    <div className="h-full w-1/2 bg-emerald-500"></div>
                                </div>
                            </div>
                        </div>
                        {/* Invoice Content End */}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default PremiumInvoice;
