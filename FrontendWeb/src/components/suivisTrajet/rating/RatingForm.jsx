import { motion } from 'framer-motion';
import { Star, Send, ThumbsUp, Smile, Frown, Meh } from 'lucide-react';
import { availableTags, categories } from './useTripRating';

const emojis = [
  { id: 'excellent', icon: Smile, label: 'Excellent', color: 'text-green-600' },
  { id: 'good', icon: ThumbsUp, label: 'Très bien', color: 'text-blue-600' },
  { id: 'average', icon: Meh, label: 'Correct', color: 'text-yellow-600' },
  { id: 'poor', icon: Frown, label: 'Médiocre', color: 'text-red-600' }
];

const RatingForm = ({
  overallRating, categoryRatings, onStarClick,
  selectedEmoji, onSelectEmoji,
  selectedTags, onTagClick,
  comment, onCommentChange,
  isSubmitting, onSkip, onSubmit,
}) => {
  return (
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
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onStarClick(star)}
              className="p-2 transition-transform hover:scale-110"
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
            <div key={category.id} className="rating-category p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl flex flex-wrap items-center justify-between gap-2 transition-colors">
              <span className="font-medium text-gray-700 dark:text-gray-300">{category.label}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => onStarClick(star, category.id)}
                    className="p-1.5 transition-transform hover:scale-110"
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
                onClick={() => onSelectEmoji(emoji.id)}
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
              onClick={() => onTagClick(tag)}
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
          onChange={(e) => onCommentChange(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-all placeholder-gray-400"
          rows="4"
          placeholder="Partagez votre expérience avec le chauffeur..."
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          onClick={onSkip}
          className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          Passer l'évaluation
        </button>
        <button
          onClick={onSubmit}
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
  );
};

export default RatingForm;
