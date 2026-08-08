import { ArrowLeft, Home, RefreshCw } from 'lucide-react';

const CompleteHeader = ({ localTrip, role, isRefreshing, onGoBack, onGoHome, onRefresh }) => (
  <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-200 dark:border-gray-800">
    <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
      <button
        onClick={onGoBack}
        className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
      >
        <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
      <div className="text-center">
        <h1 className="text-lg font-bold text-gray-900 dark:text-white">Récapitulatif de course</h1>
        <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
          ID: {localTrip?.id?.slice(-8) || localTrip?._id?.slice(-8) || 'TRP...'}
          {role === 'driver' && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className={`ml-1 hover:text-blue-500 transition-colors ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          )}
        </p>
      </div>
      <button
        onClick={onGoHome}
        className="w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
      >
        <Home className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  </header>
);

export default CompleteHeader;
