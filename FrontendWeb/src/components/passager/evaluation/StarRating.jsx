import { Star } from 'lucide-react';

const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, i) => {
        const starValue = i + 1;
        const isFull = starValue <= Math.floor(rating);
        const isHalf = !isFull && starValue - 0.5 <= rating;

        return (
          <div key={i} className="relative">
            <Star className="w-5 h-5 text-gray-300 dark:text-gray-600" />
            {(isFull || isHalf) && (
              <div className={`absolute top-0 left-0 overflow-hidden ${isHalf ? 'w-1/2' : 'w-full'}`}>
                <Star className="w-5 h-5 text-amber-400 dark:text-amber-500 fill-amber-400 dark:fill-amber-500" />
              </div>
            )}
          </div>
        );
      })}
      <span className="ml-2 text-lg font-bold text-gray-900 dark:text-gray-100">
        {Number(rating).toFixed(1)}
      </span>
    </div>
  );
};

export default StarRating;
