import { useState } from 'react';
import toast from 'react-hot-toast';
import evaluationService from '../../../services/evaluationService';

export const availableTags = [
  'Conduite fluide',
  'Véhicule propre',
  'Très ponctuel',
  'Service courtois',
  'Prix juste',
  'Sécurité',
  'Confortable',
  'Climatisation'
];

export const categories = [
  { id: 'driving', label: 'Conduite' },
  { id: 'punctuality', label: 'Ponctualité' },
  { id: 'cleanliness', label: 'Propreté du véhicule' },
  { id: 'communication', label: 'Communication' }
];

export const useTripRating = (trip, onRatingComplete) => {
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

  const handleTagClick = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmitRating = async () => {
    setIsSubmitting(true);

    // Données de l'évaluation (alignées sur le backend)
    const ratingData = {
      reservationId: trip?.reservationId || trip?.id,
      noteGlobale: overallRating,
      details: categoryRatings,
      ressenti: selectedEmoji.toUpperCase(),
      pointsForts: selectedTags,
      commentaire: comment
    };

    console.log('📡 Submitting rating:', ratingData);

    // Exécution "Optimiste" pour éviter de bloquer l'utilisateur si le serveur est lent (timeout 15s)
    try {
      // On lance la requête en tâche de fond
      evaluationService.creerEvaluation(ratingData).catch(err => {
        console.error('❌ Erreur soumission evaluation (Fond):', err);
      });

      // On affiche immédiatement le succès
      toast.success('Merci pour votre évaluation !', { icon: '✨' });

      // Petit délai pour l'effet visuel fluide
      setTimeout(() => {
        setIsSubmitting(false);
        if (onRatingComplete) {
          onRatingComplete(ratingData);
        }
      }, 800);

    } catch (error) {
      console.error('❌ Erreur logique evaluation:', error);
      toast.error("Une erreur est survenue");
      setIsSubmitting(false);
    }
  };

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

  return {
    tripData,
    overallRating,
    categoryRatings,
    selectedEmoji, setSelectedEmoji,
    selectedTags,
    comment, setComment,
    isSubmitting,
    handleStarClick,
    handleTagClick,
    handleSubmitRating,
    handleSkipRating,
  };
};
