import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Car, Users, FileText, HelpCircle, Shield,
  Download, ExternalLink, Search, ChevronDown, ChevronRight,
  ArrowLeft, Eye, Smartphone, CreditCard, MapPin, Star,
  Phone, Wallet, Calendar, MessageCircle, Truck, Clock,
  CheckCircle, AlertTriangle, Lock, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/home/Navbar';
import Footer from '../components/home/Footer';
import guideService from '../services/guideService';

// ==================== DONNÉES FAQ STATIQUES ====================
const faqData = [
  {
    categorie: 'PASSAGER',
    questions: [
      {
        q: "Comment réserver une course ?",
        a: "Depuis l'onglet Accueil, entrez votre point de départ et votre destination, choisissez le type de véhicule souhaité, puis confirmez. Un chauffeur sera automatiquement recherché pour vous."
      },
      {
        q: "Comment payer ma course ?",
        a: "Vous pouvez payer via votre portefeuille TakaPay (rechargeable par Orange Money / MTN Mobile Money), en espèces directement au chauffeur, ou par carte bancaire."
      },
      {
        q: "Comment annuler une course ?",
        a: "L'annulation est gratuite tant qu'aucun chauffeur n'a accepté. Une fois le chauffeur en route, des frais de 5 000 GNF sont appliqués. Le reste est remboursé sur votre portefeuille."
      },
      {
        q: "Comment suivre mon chauffeur en temps réel ?",
        a: "Dès qu'un chauffeur accepte votre course, vous pouvez suivre sa position sur la carte en temps réel. Vous recevrez des notifications à chaque étape (en approche, arrivé, trajet démarré)."
      },
      {
        q: "Comment recharger mon portefeuille TakaPay ?",
        a: "Allez dans la section 'Portefeuille', cliquez sur 'Recharger', sélectionnez votre méthode (Orange Money, MTN, etc.) et suivez les instructions."
      },
      {
        q: "Comment évaluer un chauffeur ?",
        a: "À la fin de chaque course, un écran d'évaluation apparaît automatiquement. Attribuez une note de 1 à 5 étoiles et laissez un commentaire si vous le souhaitez."
      },
      {
        q: "Comment utiliser un code promo ?",
        a: "Lors de la confirmation de votre course, entrez votre code promotionnel dans le champ dédié. La réduction sera appliquée automatiquement sur le prix final."
      },
    ]
  },
  {
    categorie: 'CHAUFFEUR',
    questions: [
      {
        q: "Comment m'inscrire en tant que chauffeur ?",
        a: "Inscrivez-vous via l'application en choisissant le profil 'Chauffeur'. Uploadez vos documents (permis, carte grise, assurance) et attendez la validation de l'équipe."
      },
      {
        q: "Comment accepter une course ?",
        a: "Activez votre statut 'En ligne' depuis le tableau de bord. Quand une demande arrive, vous verrez les détails (départ, destination, prix) et pourrez accepter ou refuser."
      },
      {
        q: "Comment sont calculés mes revenus ?",
        a: "Le prix de chaque course est affiché avant acceptation. La commission Taka-Taka est automatiquement déduite et le reste est crédité sur votre portefeuille chauffeur."
      },
      {
        q: "Comment retirer mes gains ?",
        a: "Depuis la section 'Revenus', cliquez sur 'Retirer'. Choisissez votre méthode de retrait (Mobile Money, virement) et le montant sera transféré sous 24h."
      },
      {
        q: "Comment louer un véhicule via Baraka Trans ?",
        a: "Dans le menu 'Location BTrans', parcourez les véhicules disponibles, sélectionnez celui qui vous convient, choisissez la durée et soumettez votre demande de réservation."
      },
      {
        q: "Comment utiliser l'espace communauté ?",
        a: "Le bouton flottant en bas à droite ouvre l'Espace Communauté. Vous pouvez y poster des messages, partager des médias, passer des appels audio/vidéo avec d'autres utilisateurs."
      },
    ]
  },
  {
    categorie: 'GENERAL',
    questions: [
      {
        q: "Qu'est-ce que Taka-Taka ?",
        a: "Taka-Taka est une SuperApp de mobilité urbaine guinéenne. Elle regroupe le transport VTC, la location de véhicules (Baraka Trans), un portefeuille digital (TakaPay), une communauté intégrée et bien plus."
      },
      {
        q: "L'application est-elle disponible sur iPhone ?",
        a: "L'application est actuellement disponible en version web (accessible sur tous les navigateurs) et en APK Android. La version iOS est en cours de développement."
      },
      {
        q: "Comment contacter le support ?",
        a: "Depuis votre espace passager ou chauffeur, allez dans 'Support'. Vous pouvez envoyer un message, appeler le +224 623 09 07 41, ou écrire à support@takataka.gn."
      },
      {
        q: "Mes données sont-elles sécurisées ?",
        a: "Absolument. Toutes les communications sont chiffrées (HTTPS/SSL). Les mots de passe sont hashés et les paiements sont sécurisés via des systèmes certifiés."
      },
    ]
  }
];

// ==================== COMPOSANT TAB ====================
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-300 whitespace-nowrap
      ${active
        ? 'bg-gradient-to-r from-emerald-500 to-blue-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
        : 'bg-white/60 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700/80 hover:shadow-md border border-slate-200/60 dark:border-slate-700/60'
      }
    `}
  >
    <Icon className="w-4 h-4" />
    {label}
    {count > 0 && (
      <span className={`text-xs px-2 py-0.5 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300'}`}>
        {count}
      </span>
    )}
  </button>
);

// ==================== COMPOSANT DOCUMENT CARD ====================
const DocumentCard = ({ guide, index }) => {
  const iconMap = {
    FileText, BookOpen, Shield, HelpCircle, Car, Users, Smartphone,
    CreditCard, MapPin, Star, Phone, Wallet, Calendar, Truck, Lock
  };
  const Icon = iconMap[guide.icone] || FileText;

  const categorieColors = {
    PASSAGER: 'from-blue-500 to-cyan-500',
    CHAUFFEUR: 'from-amber-500 to-orange-500',
    ETUDE: 'from-purple-500 to-pink-500',
    FAQ: 'from-emerald-500 to-teal-500',
    LEGAL: 'from-slate-500 to-gray-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="group relative"
    >
      <div className="relative bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 overflow-hidden hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-slate-900/40 transition-all duration-300 hover:-translate-y-1">
        {/* Gradient top bar */}
        <div className={`h-1.5 bg-gradient-to-r ${categorieColors[guide.categorie] || 'from-emerald-500 to-blue-600'}`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${categorieColors[guide.categorie] || 'from-emerald-500 to-blue-600'} flex items-center justify-center shadow-lg shrink-0`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1 line-clamp-2">
                {guide.titre}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-4">
                {guide.description}
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={guide.fichierUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-xs font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-300"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Consulter
                </a>
                <a
                  href={guide.fichierUrl}
                  download
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300"
                >
                  <Download className="w-3.5 h-3.5" />
                  Télécharger
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== COMPOSANT FAQ ITEM ====================
const FaqItem = ({ question, answer, isOpen, onToggle, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    className="border border-slate-200/60 dark:border-slate-700/60 rounded-xl overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-700 transition-colors"
  >
    <button
      onClick={onToggle}
      className="w-full p-4 flex justify-between items-center text-left bg-white/60 dark:bg-slate-800/40 hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/10 to-blue-500/10 flex items-center justify-center shrink-0">
          <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{question}</span>
      </div>
      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="px-4 pb-4 pt-1 pl-[3.75rem]">
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{answer}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

// ==================== PAGE PRINCIPALE ====================
const GuidePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PASSAGER');
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const tabs = [
    { id: 'PASSAGER', label: 'Passagers', icon: Users, color: 'blue' },
    { id: 'CHAUFFEUR', label: 'Chauffeurs', icon: Car, color: 'amber' },
    { id: 'ETUDE', label: 'Étude du Projet', icon: BookOpen, color: 'purple' },
    { id: 'FAQ', label: 'FAQ', icon: HelpCircle, color: 'emerald' },
    { id: 'LEGAL', label: 'Légal', icon: Shield, color: 'slate' },
  ];

  useEffect(() => {
    const fetchGuides = async () => {
      setLoading(true);
      try {
        const { data } = await guideService.getAll();
        if (data.succes) {
          setGuides(data.guides);
        }
      } catch (err) {
        console.error('Erreur chargement guides:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGuides();
  }, []);

  // Filtrer les guides par onglet actif et recherche
  const filteredGuides = useMemo(() => {
    let result = guides.filter(g => g.categorie === activeTab);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(g =>
        g.titre.toLowerCase().includes(q) || g.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [guides, activeTab, searchQuery]);

  // Filtrer les FAQ par onglet actif
  const filteredFaqs = useMemo(() => {
    if (activeTab !== 'FAQ') return [];
    if (!searchQuery.trim()) return faqData;
    const q = searchQuery.toLowerCase();
    return faqData.map(cat => ({
      ...cat,
      questions: cat.questions.filter(fq => fq.q.toLowerCase().includes(q) || fq.a.toLowerCase().includes(q))
    })).filter(cat => cat.questions.length > 0);
  }, [activeTab, searchQuery]);

  // Compter les documents par catégorie
  const countByCategory = useMemo(() => {
    const counts = {};
    tabs.forEach(t => { counts[t.id] = 0; });
    guides.forEach(g => { if (counts[g.categorie] !== undefined) counts[g.categorie]++; });
    // Compter les FAQ
    counts['FAQ'] = faqData.reduce((acc, cat) => acc + cat.questions.length, 0);
    return counts;
  }, [guides]);

  const categorieLabels = {
    PASSAGER: '🔵 Guide Passager',
    CHAUFFEUR: '🟠 Guide Chauffeur',
    GENERAL: '🟢 Général',
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen">
      <Navbar />

      {/* ==================== HERO SECTION ==================== */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        {/* Background gradient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-emerald-400/20 to-blue-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/15 to-pink-500/15 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Centre de Documentation</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
              Guide & Aide{' '}
              <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent">
                Taka-Taka
              </span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mb-8">
              Retrouvez tous les guides d'utilisation, la documentation technique, les FAQ et les informations légales de la plateforme.
            </p>

            {/* Search bar */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un guide, une question..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-none transition-all shadow-lg shadow-slate-200/30 dark:shadow-slate-900/30"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ==================== TABS + CONTENT ==================== */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {tabs.map(tab => (
            <TabButton
              key={tab.id}
              active={activeTab === tab.id}
              onClick={() => { setActiveTab(tab.id); setExpandedFaq(null); setSearchQuery(''); }}
              icon={tab.icon}
              label={tab.label}
              count={countByCategory[tab.id]}
            />
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* ===== ONGLET FAQ ===== */}
            {activeTab === 'FAQ' ? (
              <div className="space-y-8">
                {filteredFaqs.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <HelpCircle className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">Aucune question ne correspond à votre recherche.</p>
                  </div>
                )}
                {filteredFaqs.map((cat) => (
                  <div key={cat.categorie}>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
                      {categorieLabels[cat.categorie] || cat.categorie}
                      <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400">
                        {cat.questions.length} questions
                      </span>
                    </h2>
                    <div className="space-y-2">
                      {cat.questions.map((faq, idx) => {
                        const faqKey = `${cat.categorie}-${idx}`;
                        return (
                          <FaqItem
                            key={faqKey}
                            question={faq.q}
                            answer={faq.a}
                            isOpen={expandedFaq === faqKey}
                            onToggle={() => setExpandedFaq(expandedFaq === faqKey ? null : faqKey)}
                            index={idx}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ===== ONGLETS DOCUMENTS (Passager, Chauffeur, Étude, Légal) ===== */
              <>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                      <div key={i} className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 p-6 animate-pulse">
                        <div className="flex gap-4">
                          <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                            <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredGuides.length === 0 ? (
                  <div className="text-center py-16">
                    <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">Aucun document disponible</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto">
                      {searchQuery
                        ? "Aucun document ne correspond à votre recherche."
                        : "Les documents pour cette section seront bientôt disponibles. Revenez plus tard !"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredGuides.map((guide, idx) => (
                      <DocumentCard key={guide._id} guide={guide} index={idx} />
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ===== INFO BANNER ===== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-gradient-to-r from-emerald-500/5 via-blue-500/5 to-purple-500/5 border border-emerald-200/40 dark:border-emerald-800/40 rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 flex items-center justify-center shadow-lg shrink-0">
              <MessageCircle className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                Besoin d'aide supplémentaire ?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Notre équipe de support est disponible pour répondre à toutes vos questions. Contactez-nous par téléphone ou email.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <a
                href="tel:+224623090741"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:shadow-md transition-all"
              >
                <Phone className="w-4 h-4" />
                Appeler
              </a>
              <a
                href="mailto:support@takataka.gn"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Email
              </a>
            </div>
          </div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};

export default GuidePage;
