import { Clock, ChevronLeft } from 'lucide-react';

const TrackingHeader = ({ destinationName, currentTime, onBack }) => (
  <nav className="glass-header container shadow-sm sticky w-[100%] mx-auto px-4 py-4 top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">

        <div>
          <span className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Suivi en direct
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400">Trajet vers {destinationName}</p>
        </div>
      </div>
      <div className="flex items-center space-x-4">
        <div className="hidden md:flex items-center space-x-2 text-gray-600 dark:text-gray-300">
          <Clock className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="font-medium">{currentTime}</span>
        </div>
        <button
          onClick={onBack}
          className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors shrink-0"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
      </div>
    </div>
  </nav>
);

export default TrackingHeader;
