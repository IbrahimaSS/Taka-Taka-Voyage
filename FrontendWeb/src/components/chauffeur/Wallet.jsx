import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet as WalletIcon, ArrowUpRight, ArrowDownRight,
  Plus, Smartphone, History, CreditCard,
  Shield, AlertCircle, Loader, Send, QrCode, Info, Search
} from 'lucide-react';
import MtnLogo from '../../assets/mtn_logo.png';
import { PaymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Button from '../admin/ui/Bttn';
import Badge from '../admin/ui/Badge';
import Modal from '../admin/ui/Modal';
import { useTranslation } from 'react-i18next';
import { socketService } from '../../services/socketService';

const Wallet = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState({ type: null, isOpen: false });
  const [formData, setFormData] = useState({ amount: '', phone: '', method: 'ORANGE_MONEY' });
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // 🔄 Charger les données réelles
  useEffect(() => {
    fetchWalletData();
    
    // Écouter les mises à jour en temps réel (Validation Admin ou Transfert)
    const handleUpdate = (data) => {
      console.log("🔔 Socket Event Received:", data);
      toast.success(data.message, { icon: '💰', duration: 5000 });
      
      // 🔊 JOUER UN SON SI DEMANDÉ (Transfert reçu)
      if (data.playSound === true) {
        console.log("🔊 Playing notification sound...");
        const audio = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3');
        audio.play().catch(e => {
          console.warn("⚠️ Audio play blocked by browser. Click on the page to enable sounds.", e);
        });
      }
      
      fetchWalletData();
    };

    socketService.on("wallet:status_update", handleUpdate);
    socketService.on("wallet:update", handleUpdate);
    return () => {
      socketService.off("wallet:status_update", handleUpdate);
      socketService.off("wallet:update", handleUpdate);
    };
  }, []);

  const fetchWalletData = async () => {
    try {
      setLoading(true);
      const [balanceRes, historyRes] = await Promise.all([
        PaymentService.checkWalletBalance(),
        PaymentService.getHistorique()
      ]);
      setBalance(balanceRes.balance || 0);
      setTransactions(historyRes.transactions || []);
    } catch (error) {
      toast.error("Impossible de charger les données du portefeuille");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (e) => {
    e.preventDefault();
    const { amount, phone, method } = formData;

    if (!amount || amount <= 0) return toast.error("Montant invalide");

    try {
      let res;
      if (showModal.type === 'depot') {
        res = await PaymentService.deposer(amount, method, `REF-${Date.now()}`);
      } else if (showModal.type === 'retrait') {
        if (!otpStep) {
          // ÉTAPE 1: Envoyer l'OTP
          const otpRes = await PaymentService.envoyerOTP();
          if (otpRes.succes) {
            setOtpStep(true);
            toast.success("Code de sécurité envoyé par e-mail !");
          }
          return;
        } else {
          // ÉTAPE 2: Valider avec l'OTP
          if (!otpCode || otpCode.length !== 4) return toast.error("Veuillez saisir le code à 4 chiffres");
          res = await PaymentService.retirer(amount, method, phone, otpCode);
        }
      } else if (showModal.type === 'transfert') {
        res = await PaymentService.transferer(phone, amount);
      }

      if (res && res.succes) {
        toast.success(res.message || "Opération réussie");
        setShowModal({ type: null, isOpen: false });
        setFormData({ amount: '', phone: '', method: 'ORANGE_MONEY' });
        setOtpStep(false);
        setOtpCode('');
        fetchWalletData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Une erreur est survenue");
    }
  };

  const actions = [
    { id: 'depot', name: "Dépôt", icon: Plus, color: "bg-emerald-500", desc: "Recharger mon solde" },
    { id: 'retrait', name: "Retrait", icon: Smartphone, color: "bg-orange-500", desc: "Vers Orange/MTN" },
    { id: 'transfert', name: "Transférer", icon: Send, color: "bg-blue-500", desc: "À un ami TakaTaka" },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 min-h-[400px]">
        <Loader className="w-10 h-10 animate-spin text-green-600 mb-4" />
        <p className="text-gray-500 font-medium animate-pulse italic">Interrogation des coffres-forts...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-8 pb-10">

      {/* 🚀 Header & Card Section - OPTIMIZED SPACE */}
      <div className="flex flex-col lg:flex-row gap-8 items-center">

        {/* Visual Wallet Card - FIXED WIDTH NARROW */}
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="relative group h-44 w-full lg:w-[400px] shrink-0 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white p-6 shadow-2xl flex flex-col justify-between border border-white/10"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <QrCode size={100} />
          </div>

          <div className="flex justify-between items-start z-10">
            <div>
              <p className="text-white/70 text-[9px] font-bold tracking-[0.2em] uppercase">PORTEFEUILLE CHAUFFEUR</p>
              <h1 className="text-3xl font-black mt-1 tracking-tighter flex items-baseline">
                {balance.toLocaleString()} <span className="text-sm font-medium ml-2 opacity-80 uppercase">GNF</span>
              </h1>
            </div>
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">
               <WalletIcon className="w-5 h-5 text-white" />
            </div>
          </div>

          <div className="z-10 flex justify-between items-end bg-black/5 -mx-6 -mb-6 px-6 py-3 backdrop-blur-sm border-t border-white/5">
            <div>
              <p className="text-[8px] uppercase opacity-60 font-bold mb-0.5">Titulaire</p>
              <p className="font-bold text-xs tracking-wide uppercase truncate max-w-[150px]">{user?.prenom} {user?.nom}</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] uppercase opacity-60 font-bold mb-0.5">Numéro de téléphone</p>
              <p className="font-mono text-[10px] opacity-90">{user?.telephone || user?.phone}</p>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons - FILL REMAINING SPACE */}
        <div className="flex-1 w-full grid grid-cols-3 gap-4">
          {actions.map((action, idx) => (
            <motion.button
              key={action.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setShowModal({ type: action.id, isOpen: true })}
              className="flex flex-col items-center justify-center p-4 rounded-3xl bg-white dark:bg-gray-800 border-[1.5px] border-gray-100 dark:border-gray-700 hover:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all hover:shadow-xl group h-44"
            >
              <div className={`w-12 h-12 rounded-2xl ${action.color} text-white flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                <action.icon size={24} />
              </div>
              <div className="text-center">
                <span className="block font-black text-gray-900 dark:text-white text-sm leading-tight text-nowrap">{action.name}</span>
                <span className="text-[9px] text-gray-400 mt-1.5 font-medium px-2 leading-tight block">{action.desc}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* 📜 Historique Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center">
            <History size={24} className="mr-3 text-emerald-600" />
            Activité financière
          </h2>
          <Button variant="ghost" icon={Search} size="small">Filtrer</Button>
        </div>

        <div className="space-y-3">
          {transactions.slice(0, 10).map((tx) => (
            <motion.div
              key={tx._id}
              whileHover={{ x: 5 }}
              className="flex items-center justify-between p-5 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex items-center space-x-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${tx.type.includes('TRANSFERT_ENVOI') || tx.type === 'RETRAIT' || tx.type === 'PAIEMENT_TRAJET'
                  ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'
                  : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600'
                  }`}>
                  {tx.type === 'DEPOT' ? <Plus size={24} /> : (tx.type === 'RETRAIT' ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />)}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white leading-none mb-1 uppercase text-[10px] tracking-widest">
                    {tx.type.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {new Date(tx.createdAt).toLocaleDateString()} • {tx.commentaire || tx.methode}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-black ${tx.amount < 0 || tx.type.includes('ENVOI') || tx.type === 'PAIEMENT_TRAJET'
                  ? 'text-rose-600'
                  : 'text-emerald-600'
                  }`}>
                  {tx.type.includes('ENVOI') || tx.type === 'PAIEMENT_TRAJET' ? '-' : '+'}
                  {tx.montant.toLocaleString()} <span className="text-[10px]">GNF</span>
                </p>
                <Badge size="xs" color={tx.statut === 'COMPLETE' ? 'success' : 'warning'}>
                  {tx.statut}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showModal.isOpen}
        onClose={() => {
          setShowModal({ type: null, isOpen: false });
          setOtpStep(false);
          setOtpCode('');
        }}
        title={showModal.type === 'depot' ? "Recharger mon compte" : (showModal.type === 'retrait' ? "Demander un retrait" : "Transférer de l'argent")}
        size="md"
      >
        <form onSubmit={handleAction} className="space-y-6">
          {showModal.type === 'retrait' && (
            <div className={`bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800/30 flex items-start space-x-3 ${otpStep ? 'hidden' : ''}`}>
              <Info className="text-amber-600 mt-0.5 shrink-0" size={18} />
              <p className="text-xs text-amber-800 dark:text-amber-300">
                Les retraits chauffeur sont vérifiés par l'administration avant virement effectif.
              </p>
            </div>
          )}

          {!otpStep ? (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Montant (GNF)</label>
                <input
                  type="number"
                  placeholder="Ex: 50000"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full h-14 px-4 text-2xl font-bold bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all dark:text-white"
                />
              </div>

              {(showModal.type === 'retrait' || showModal.type === 'transfert') && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Numéro de téléphone
                  </label>
                  <input
                    type="text"
                    placeholder={showModal.type === 'transfert' ? "Vers un autre utilisateur..." : "Numéro de retrait..."}
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full h-14 px-4 bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 outline-none transition-all dark:text-white"
                  />
                </div>
              )}

              {(!otpStep && (showModal.type === 'depot' || showModal.type === 'retrait')) && (
                 <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, method: 'ORANGE_MONEY' })}
                    className={`relative p-3 rounded-xl border-2 transition-all ${formData.method === 'ORANGE_MONEY'
                        ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 shadow-md ring-2 ring-green-500/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 mb-2 flex items-center justify-center rounded-lg overflow-hidden bg-white border">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Orange_logo.svg/120px-Orange_logo.svg.png"
                          alt="Orange"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-bold dark:text-white text-nowrap">Orange Money</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, method: 'MTN_MONEY' })}
                    className={`relative p-3 rounded-xl border-2 transition-all ${formData.method === 'MTN_MONEY'
                        ? "border-green-500 bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-900/30 dark:to-blue-900/30 shadow-md ring-2 ring-green-500/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-green-300"
                      }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 mb-2 flex items-center justify-center rounded-lg overflow-hidden bg-white border">
                        <img
                          src={MtnLogo}
                          alt="MTN"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-sm font-bold dark:text-white text-nowrap">MTN/Areeba</span>
                    </div>
                  </button>
                </div>
              )}
            </>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
                <AlertCircle className="mx-auto text-emerald-600 mb-2" size={32} />
                <h4 className="font-bold text-gray-900 dark:text-white">Dernière étape : Sécurité</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Saisissez le code à 4 chiffres envoyé à votre adresse <b>{user?.email}</b>
                </p>
              </div>

              <div className="flex flex-col items-center">
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Code de sécurité (OTP)</label>
                <div className="flex gap-2">
                   <input
                    type="text"
                    maxLength={4}
                    placeholder="0000"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-40 h-16 text-center text-4xl font-black tracking-[0.5em] bg-gray-100 dark:bg-gray-800 border-2 border-green-500 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 transition-all dark:text-white"
                  />
                </div>
                <button 
                  type="button"
                  onClick={() => setOtpStep(false)}
                  className="text-xs font-bold text-emerald-600 mt-4 hover:underline"
                >
                  Modifier les informations de retrait
                </button>
              </div>
            </motion.div>
          )}

          <Button
            fullWidth
            variant="primary"
            size="large"
            type="submit"
            className="h-14 font-black shadow-xl"
          >
            {otpStep ? "Vérifier et Confirmer" : "Suivant"}
          </Button>
        </form>
      </Modal>

    </div>
  );
};

export default Wallet;
