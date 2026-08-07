import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  X, QrCode, CheckCircle, Users, Car, Star, Phone, Award,
  Smartphone, Clock, ShieldAlert, Download,
} from 'lucide-react';
import { getFullAssetURL } from '../../../utils/urlHelper';
import Badge from '../../admin/ui/Badge';
import Button from '../../admin/ui/Bttn';
import Modal from '../../admin/ui/Modal';

const TicketDetailModal = ({ ticket, passengerName, passengerPhoto, onClose }) => {
  const getImageUrl = (avatar) => getFullAssetURL(avatar);

  const handleDownloadTicket = () => {
    if (!ticket) return;

    try {
      const doc = new jsPDF();

      // En-tête du PDF
      doc.setFillColor(0, 168, 142); // Vert Taka
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("TAKA TAKA - REÇU DE VOYAGE", 105, 25, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text(`Code Ticket: ${ticket.codeUnique || ticket.id || 'N/A'}`, 20, 50);
      doc.text(`Date: ${ticket.createdAt ? new Date(ticket.createdAt).toLocaleString() : 'N/A'}`, 20, 60);

      // Extraction sécurisée des données
      const chauffeurName = ticket.chauffeur
        ? `${ticket.chauffeur.prenom || ''} ${ticket.chauffeur.nom || ''}`.trim()
        : (ticket.chauffeurName || 'Non assigné');

      const distance = ticket.distanceKm || ticket.distance || 0;
      const duree = ticket.dureeMin || ticket.duree || 0;

      // Tableau des détails
      const tableData = [
        ["Passager", passengerName || "Passager"],
        ["Chauffeur", chauffeurName || "Non spécifié"],
        ["Trajet", `${ticket.depart || '—'} -> ${ticket.destination || '—'}`],
        ["Distance", `${distance} KM`],
        ["Durée", `${duree} MIN`],
        ["Montant Total", `${(ticket.prix || 0).toLocaleString()} GNF`],
        ["Statut", "PAYÉ"]
      ];

      autoTable(doc, {
        startY: 70,
        head: [['Champ', 'Détail']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 92, 151], textColor: [255, 255, 255] }
      });

      const finalY = doc.lastAutoTable?.finalY || 150;
      doc.text("Merci d'avoir choisi Taka Taka !", 105, finalY + 20, { align: "center" });

      doc.save(`TakaTaka_Recu_${ticket.codeUnique || 'ticket'}.pdf`);
      toast.success("Recu téléchargé avec succès");
    } catch (error) {
      console.error("Erreur PDF:", error);
      toast.error("Erreur lors de la génération du PDF");
    }
  };

  return (
    <Modal isOpen={!!ticket} onClose={onClose} size="xl">
      <div className="relative bg-white dark:bg-[#0B1120] rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 dark:border-gray-800 max-w-md mx-auto">
        {/* En-tête avec dégradé Taka-Taka */}
        <div className="bg-gradient-to-br from-[#00A88E] to-[#005C97] p-8 pb-12 relative overflow-hidden">
          {/* Cercles de décoration */}
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl"></div>

          <div className="flex justify-between items-start relative z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30">
                <img src="/logo-mini.png" alt="T" className="w-6 h-6 brightness-0 invert"
                  onError={(e) => e.target.style.display = 'none'}
                />
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-black tracking-tighter text-xl leading-none">TAKA TAKA</h2>
                <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest mt-1">Votre transport, notre confort</p>
              </div>
            </div>
            <button onClick={onClose} className="w-11 h-11 bg-black/20 hover:bg-black/40 text-white rounded-full flex items-center justify-center transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-2xl overflow-hidden ring-4 ring-white/10">
                <img
                  src={passengerPhoto ? getImageUrl(passengerPhoto) : `https://ui-avatars.com/api/?name=${passengerName}&background=00A88E&color=fff&size=200`}
                  alt="Passager"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-1 w-7 h-7 bg-[#00FFD1] text-[#005C97] rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-gray-800">
                <CheckCircle className="w-5 h-5" />
              </div>
            </div>
            <h3 className="text-white text-xl font-black mt-4 uppercase tracking-tight">{passengerName}</h3>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm text-[10px] font-black uppercase tracking-widest">
                <Users className="w-3 h-3 mr-1" /> Passager Vérifié
              </Badge>
            </div>
          </div>
        </div>

        {/* Corps du Ticket (Effet papier coupé) */}
        <div className="bg-white dark:bg-[#0B1120] px-8 pt-8 pb-6 relative -mt-6 rounded-t-[3rem] z-20">
          {/* Trajet */}
          <div className="flex justify-between items-center mb-10 relative">
            <div className="flex-1 text-left">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Départ</p>
              <h4 className="text-[13px] font-black text-[#005C97] dark:text-blue-400 leading-tight uppercase line-clamp-2 max-w-[120px]">{ticket?.depart || "Point A"}</h4>
            </div>

            <div className="flex flex-col items-center px-2">
              <div className="relative w-20 h-8 flex items-center justify-center">
                <div className="absolute w-full h-[1.5px] bg-dashed border-t-2 border-dashed border-green-500/30 rounded-full"></div>
                <div className="relative z-10 w-7 h-7 bg-green-50 dark:bg-green-900/30 rounded-full flex items-center justify-center shadow-sm border border-green-100 dark:border-green-800">
                  <Car className="w-3 h-3 text-green-600" />
                </div>
              </div>
              <p className="text-[9px] font-black text-green-600 uppercase mt-1">{ticket?.distanceKm || 0} KM</p>
            </div>

            <div className="flex-1 text-right">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">Destination</p>
              <h4 className="text-[13px] font-black text-[#00A88E] dark:text-emerald-400 leading-tight uppercase line-clamp-2 max-w-[120px] ml-auto">{ticket?.destination || "Point B"}</h4>
            </div>
          </div>

          {/* Infos Chauffeur Premium */}
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-3xl p-5 border border-gray-100 dark:border-gray-800/50 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-xl border-2 border-white dark:border-gray-600 ring-4 ring-blue-500/5">
                  <img
                    src={ticket?.chauffeur?.photoUrl ? getFullAssetURL(ticket.chauffeur.photoUrl) : `https://ui-avatars.com/api/?name=${ticket?.chauffeur?.prenom || 'D'}+${ticket?.chauffeur?.nom || ''}&background=005C97&color=fff`}
                    alt="Chauffeur"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Votre Chauffeur</p>
                  <h5 className="text-base font-black text-gray-900 dark:text-white uppercase leading-none mt-1">
                    {ticket?.chauffeur?.prenom} {ticket?.chauffeur?.nom}
                  </h5>
                  <div className="flex items-center mt-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-[11px] font-black ml-1">4.9 EXCELLENT</span>
                  </div>
                </div>
              </div>
              <a href={`tel:${ticket?.chauffeur?.telephone || ''}`} className="w-12 h-12 bg-[#00A88E] hover:bg-[#008f79] text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-all active:scale-95">
                <Phone className="w-5 h-5" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600"><Smartphone className="w-4 h-4" /></div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Véhicule</p>
                  <p className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase truncate">{ticket?.vehicule?.marque} {ticket?.vehicule?.modele}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center text-purple-600"><Award className="w-4 h-4" /></div>
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase">Plaque</p>
                  <p className="text-[10px] font-black text-gray-700 dark:text-gray-300 uppercase">{ticket?.vehicule?.immatriculation}</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR CODE FINAL */}
          <div className="flex flex-col items-center">
            <div className="p-5 bg-white dark:bg-white rounded-[2rem] shadow-xl border-4 border-gray-50 dark:border-gray-800 scale-105">
              <img src={ticket?.qrCodeBase64} alt="QR Code" className="w-40 h-40" />
            </div>
            <div className="mt-4 text-center">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.3em]">Code de validation</p>
              <p className="text-xl font-black text-[#005C97] dark:text-blue-400 tracking-tighter mt-1">{ticket?.codeUnique?.split('-')[1] || "XXXX"}</p>
            </div>
          </div>

          <div className="mt-8 flex justify-between items-center py-4 border-t-2 border-dashed border-gray-100 dark:border-gray-800">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase">Durée estimée</p>
                <p className="text-sm font-black text-gray-900 dark:text-white">{ticket?.dureeMin || 0} MIN</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Prix Total</p>
              <p className="text-2xl font-black text-[#00A88E] leading-none">{(ticket?.prix || 0).toLocaleString()} <span className="text-sm">GNF</span></p>
            </div>
          </div>

          {/* Message de sécurité important */}
          <div className="mt-6 flex items-start space-x-3 bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
            <ShieldAlert className="w-5 h-5 text-red-600 mt-0.5" />
            <p className="text-[9px] font-bold text-red-800 dark:text-red-400 leading-relaxed uppercase tracking-wide">
              Pour votre sécurité, vérifiez toujours que la plaque d'immatriculation correspond à celle affichée sur ce ticket avant de monter à bord.
            </p>
          </div>

          <Button variant="primary" fullWidth onClick={handleDownloadTicket} className="mt-8 h-14 rounded-2xl font-black text-base uppercase tracking-widest shadow-xl shadow-emerald-500/20" icon={Download}>
            Télécharger le reçu
          </Button>
        </div>

        {/* Footer "Cut" effect */}
        <div className="h-6 bg-white dark:bg-[#0B1120] relative">
          <div className="absolute top-0 left-0 w-full h-full flex justify-between px-2 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-4 h-4 bg-gray-50 dark:bg-gray-950 rounded-full -mt-2"></div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TicketDetailModal;
