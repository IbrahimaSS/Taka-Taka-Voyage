import React from 'react';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react';

const CommunityFAB = ({ onClick, unreadCount = 0 }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="fixed bottom-24 left-6 z-[55] w-14 h-14 bg-gradient-to-br from-blue-600 to-emerald-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:shadow-emerald-500/20 transition-all border-4 border-white dark:border-slate-900 group"
    >
      <div className="relative">
        <Users className="w-7 h-7" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
            {unreadCount}
          </span>
        )}
      </div>
      
      {/* Label Tooltip */}
      <div className="absolute left-16 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap font-bold">
        Communauté Taka-Taka
      </div>
    </motion.button>
  );
};

export default CommunityFAB;
