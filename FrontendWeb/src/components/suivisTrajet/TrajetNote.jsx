// components/passenger/TripRating.jsx
import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Car,
  Clock,
  User,
  Check,
  Gift,
  History,
  Plus,
  MessageSquare,
  Send,
  Award,
  Shield,
  HelpCircle,
  FileText,
  ChevronRight,
  Sparkles,
  ThumbsUp,
  ShieldCheck,
  Smile,
  Frown,
  Meh,
  Award as Trophy,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import evaluationService from '../../services/evaluationService';
import { toast } from 'react-hot-toast';

const TripRating = ({ trip, onRatingComplete, onBack }) => {
  const navigate = useNavigate();
  const confettiContainerRef = useRef(null);

  // États
  const [overallRating, setOverallRating] = useState(4);
  const [categoryRatings, setCategoryRatings] = useState({
    driving: 4,
    punctuality: 4,
    cleanliness: 3,
    communication: 5
  });
  const [selectedEmoji, setSelectedEmoji] = useState('good');
  const [selectedTags, setSelectedTags] = useState(['Véhicule propre']);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Données du trajet
  const tripData = trip || {
    amount: '1 600 GNF',
    driver: 'Fela Balde',
    loyaltyPoints: 350,
    earnedPoints: 50
  };

  // Tags disponibles
  const availableTags = [
    'Conduite fluide',
    'Véhicule propre',
    'Très ponctuel',
    'Service courtois',
    'Prix juste',
    'Sécurité',
    'Confortable',
    'Climatisation'
  ];

  // Émojis disponibles
  const emojis = [
    { id: 'excellent', icon: Smile, label: 'Excellent', color: 'text-green-600' },
    { id: 'good', icon: ThumbsUp, label: 'Très bien', color: 'text-blue-600' },
    { id: 'average', icon: Meh, label: 'Correct', color: 'text-yellow-600' },
    { id: 'poor', icon: Frown, label: 'Médiocre', color: 'text-red-600' }
  ];

  // Catégories d'évaluation
  const categories = [
    { id: 'driving', label: 'Conduite' },
    { id: 'punctuality', label: 'Ponctualité' },
    { id: 'cleanliness', label: 'Propreté du véhicule' },
    { id: 'communication', label: 'Communication' }
  ];

  // Gestion des clics sur les étoiles
  const handleStarClick = (rating, category = null) => {
    if (category) {
      setCategoryRatings(prev => ({
        ...prev,
        [category]: rating
      }));
    } else {
      setOverallRating(rating);
    }
  };

  // Gestion des tags
  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  // Soumission de l'évaluation
  const handleSubmitRating = async () => {
    if (!trip?.reservationId && !trip?.id) {
      toast.error('Erreur: Identifiant du trajet manquant');
      return;
    }

    setIsSubmitting(true);

    // Mapping des tags UI vers l'énumération Backend
    const tagMapping = {
      'Conduite fluide': 'CONDUITE_FLUIDE',
      'Véhicule propre': 'VEHICULE_PROPRE',
      'Très ponctuel': 'TRES_PONCTUEL',
      'Service courtois': 'SERVICE_COURTOIS',
      'Prix juste': 'PRIX_JUSTE'
    };

    // Mapping des emojis UI vers l'énumération Backend
    const emojiMapping = {
      'excellent': 'EXCELLENT',
      'good': 'TRES_BIEN',
      'average': 'CORRECT',
      'poor': 'MEDIOCRE'
    };

    // Données de l'évaluation
    const ratingData = {
      reservationId: trip.reservationId || trip.id,
      noteGlobale: overallRating,
      details: {
        conduite: categoryRatings.driving,
        ponctualite: categoryRatings.punctuality,
        proprete: categoryRatings.cleanliness,
        communication: categoryRatings.communication
      },
      ressenti: emojiMapping[selectedEmoji] || 'CORRECT',
      pointsForts: selectedTags
        .map(tag => tagMapping[tag])
        .filter(Boolean),
      commentaire: comment
    };

    try {
      await evaluationService.creerEvaluation(ratingData);

      setIsSubmitting(false);
      createConfetti();
      toast.success('Merci pour votre évaluation !');

      // Appeler la fonction de complétion après un court délai
      setTimeout(() => {
        if (onRatingComplete) {
          onRatingComplete(ratingData);
        }
      }, 1500);
    } catch (error) {
      setIsSubmitting(false);
      toast.error(error.message || 'Erreur lors de l\'envoi de l\'évaluation');
      console.error('Submit rating error:', error);
    }
  };

  // Passer l'évaluation
  const handleSkipRating = () => {
    if (window.confirm('Passer l\'évaluation ? Vous pourrez évaluer plus tard dans votre historique.')) {
      if (onRatingComplete) {
        onRatingComplete({
          skipped: true,
          tripId: trip?.id,
          timestamp: new Date().toISOString()
        });
      }
    }
  };





  // Confetti animation
  const createConfetti = useCallback(() => {
    if (!confettiContainerRef.current) return;

    const colors = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'absolute w-2 h-2 rounded-full animate-confetti';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.setProperty('--x-end', `${Math.random() * 100 - 50}px`);
      confetti.style.setProperty('--y-end', `${Math.random() * 100 + 100}px`);
      confetti.style.animationDelay = `${Math.random() * 0.5}s`;

      confettiContainerRef.current.appendChild(confetti);

      setTimeout(() => confetti.remove(), 2000);
    }
  }, []);




  // Navigation
  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const handleGoToHistory = () => navigate('/passenger/history');
  const handleNewTrip = () => navigate('/passenger/book');
  const handleGoToProfile = () => navigate('/passenger/profile');

  return (
    <div className="min-h-screen  bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-gray-800  dark:bg-slate-900  dark:text-slate-100 transition-colors duration-300">
      {/* Header */}
      <nav className="glass-header shadow-sm sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="flex  justify-between items-center  w-full mx-auto px-10 py-4">



          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Taka<span className="gradient-text">Taka</span>
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400">Évaluation du trajet</p>
            </div>
          </div>


          <div className="flex items-center space-x-6">
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoBack}
              className="flex items-center space-x-3 text-gray-700 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </motion.button>
          </div>
        </div>
      </nav>

      <div ref={confettiContainerRef} className="fixed inset-0 pointer-events-none z-50" />

      {/* Contenu principal */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Progression */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-8 mb-4">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Trajet terminé</span>
            </div>
            <div className="h-1 w-16 bg-green-500" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <Check className="w-4 h-4" />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2">Paiement</span>
            </div>
            <div className="h-1 w-16 bg-green-500" />
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
                <span className="text-sm font-bold">3</span>
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium mt-2">Évaluation</span>
            </div>
          </div>
        </div>

        {/* Confirmation paiement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl p-6 mb-8 shadow-lg shadow-green-100 dark:shadow-none"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6">
              <Check className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Paiement confirmé !</h2>
            <p className="opacity-90">
              Votre paiement de <strong>{tripData.amount}</strong> a été effectué avec succès
            </p>
          </div>
        </motion.div>

        {/* Section évaluation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 mb-8 border border-white/20 dark:border-white/5 shadow-xl"
        >
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">Évaluez votre expérience</h2>
            <p className="text-gray-600 dark:text-gray-400">Votre avis nous aide à améliorer notre service</p>
          </div>

          {/* Note globale */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Note globale</h3>
            <div className="flex justify-center gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${star <= overallRating
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300 dark:text-gray-700'
                      }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-center text-gray-600 dark:text-gray-400">
              {overallRating === 5 && 'Excellent !'}
              {overallRating === 4 && 'Très bien'}
              {overallRating === 3 && 'Bien'}
              {overallRating === 2 && 'Moyen'}
              {overallRating === 1 && 'Médiocre'}
              {overallRating === 0 && 'Sélectionnez une note'}
            </p>
          </div>

          {/* Évaluation par catégories */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Évaluation détaillée</h3>

            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="rating-category p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl flex items-center justify-between transition-colors">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{category.label}</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleStarClick(star, category.id)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-5 h-5 ${star <= categoryRatings[category.id]
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-300 dark:text-gray-600'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Évaluation rapide */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Comment s'est passé votre trajet ?
            </h3>
            <div className="flex flex-wrap justify-center gap-4">
              {emojis.map((emoji) => {
                const IconComponent = emoji.icon;
                return (
                  <button
                    key={emoji.id}
                    onClick={() => setSelectedEmoji(emoji.id)}
                    className={`emoji-option p-4 rounded-xl border-2 transition-all ${selectedEmoji === emoji.id
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 shadow-md shadow-green-100 dark:shadow-none font-bold'
                      : 'border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700'
                      }`}
                  >
                    <div className="mb-2">
                      <IconComponent className={`w-8 h-8 ${emoji.color}`} />
                    </div>
                    <div className={`font-medium text-sm ${emoji.color}`}>{emoji.label}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Points forts (sélectionnez)
            </h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`px-4 py-2 rounded-full transition-all ${selectedTags.includes(tag)
                    ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 border border-green-300 dark:border-green-800 font-medium'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Commentaire */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Commentaire (optionnel)
            </h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all placeholder-gray-400"
              rows="4"
              placeholder="Partagez votre expérience avec le chauffeur..."
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <button
              onClick={handleSkipRating}
              className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Passer l'évaluation
            </button>
            <button
              onClick={handleSubmitRating}
              disabled={isSubmitting}
              className={`flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-3 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Envoyer l'évaluation</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Récompense */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 mb-8"
        >
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center">
              <Gift className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Merci pour votre retour !
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Vous avez gagné{' '}
                <strong className="text-amber-600 dark:text-amber-400">{tripData.earnedPoints} points de fidélité</strong>{' '}
                pour cette évaluation.
              </p>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="bg-white dark:bg-gray-800 px-4 py-3 rounded-lg border border-amber-200 dark:border-amber-800 shadow-sm">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Points cumulés</span>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                    <span className="font-bold text-gray-800 dark:text-gray-100">{tripData.loyaltyPoints} points</span>
                  </div>
                </div>
                <button className="text-green-700 dark:text-green-400 font-medium hover:underline flex items-center transition-colors">
                  Voir les avantages
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Prochaines étapes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="passenger-glass dark:bg-gray-900/90 rounded-2xl p-8 border border-white/20 dark:border-white/5 shadow-xl"
        >
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-6">
            Que souhaitez-vous faire maintenant ?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Historique */}
            <div
              onClick={handleGoToHistory}
              className="group cursor-pointer"
            >
              <div className="bg-gray-50 dark:bg-gray-800/50 hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 rounded-xl p-6 transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                    <History className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Historique</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Consultez tous vos trajets</p>
                </div>
              </div>
            </div>

            {/* Nouveau trajet */}
            <div
              onClick={handleNewTrip}
              className="group cursor-pointer"
            >
              <div className="bg-gray-50 dark:bg-gray-800/50 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 rounded-xl p-6 transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                    <Plus className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Nouveau trajet</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Réservez un autre trajet</p>
                </div>
              </div>
            </div>

            {/* Mon profil */}
            <div
              onClick={handleGoToProfile}
              className="group cursor-pointer"
            >
              <div className="bg-gray-50 dark:bg-gray-800/50 hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 rounded-xl p-6 transition-all duration-300 group-hover:-translate-y-1">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                    <User className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-100 mb-2">Mon profil</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Gérez votre compte</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="mt-12 bg-gray-900 dark:bg-black text-white py-8 border-t border-gray-800 transition-colors">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center">
            <p className="text-gray-500 mb-6">© 2024 TakaTaka. Tous droits réservés.</p>
            <div className="flex justify-center gap-6">
              <button className="text-gray-500 hover:text-white transition-colors text-sm flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Sécurité
              </button>
              <button className="text-gray-500 hover:text-white transition-colors text-sm flex items-center">
                <HelpCircle className="w-4 h-4 mr-2" />
                Aide
              </button>
              <button className="text-gray-500 hover:text-white transition-colors text-sm flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Conditions
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TripRating;