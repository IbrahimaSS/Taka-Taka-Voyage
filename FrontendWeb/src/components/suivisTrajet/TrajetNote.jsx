// components/passenger/TripRating.jsx
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';

import { useTripRating } from './rating/useTripRating';
import RatingHeader from './rating/RatingHeader';
import RatingProgressSteps from './rating/RatingProgressSteps';
import PaymentConfirmationBanner from './rating/PaymentConfirmationBanner';
import RatingForm from './rating/RatingForm';
import LoyaltyRewardCard from './rating/LoyaltyRewardCard';
import NextStepsCard from './rating/NextStepsCard';
import RatingFooter from './rating/RatingFooter';

const TripRating = ({ trip, onRatingComplete, onBack }) => {
  const { settings } = useSettings();
  const platform = settings?.platform || {};
  const navigate = useNavigate();

  const {
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
  } = useTripRating(trip, onRatingComplete);

  const handleGoBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen  bg-gradient-to-br from-green-50/50 to-blue-50/50 dark:from-gray-800  dark:bg-slate-900  dark:text-slate-100 transition-colors duration-300">
      <RatingHeader platform={platform} onGoBack={handleGoBack} />

      {/* Contenu principal */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <RatingProgressSteps />

        <PaymentConfirmationBanner tripData={tripData} />

        <RatingForm
          overallRating={overallRating}
          categoryRatings={categoryRatings}
          onStarClick={handleStarClick}
          selectedEmoji={selectedEmoji}
          onSelectEmoji={setSelectedEmoji}
          selectedTags={selectedTags}
          onTagClick={handleTagClick}
          comment={comment}
          onCommentChange={setComment}
          isSubmitting={isSubmitting}
          onSkip={handleSkipRating}
          onSubmit={handleSubmitRating}
        />

        <LoyaltyRewardCard tripData={tripData} />

        <NextStepsCard />
      </div>

      <RatingFooter platform={platform} />
    </div>
  );
};

export default TripRating;
