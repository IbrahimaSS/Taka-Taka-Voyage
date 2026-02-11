// src/components/ui/Pagination.jsx
import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className = '',
  showNumbers = true,
  showInfo = true,
  pageSize = 6,
  totalItems = 0
}) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div className={clsx('flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0', className)}>
      {showInfo && totalItems > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Affichage de {startItem} à {endItem} sur {totalItems} éléments
        </div>
      )}

      <div className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={clsx(
            'w-10 h-10 rounded-lg border flex items-center justify-center transition',
            currentPage === 1
              ? 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400'
          )}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Numbers */}
        {showNumbers && getPageNumbers().map((page, index) => (
          <React.Fragment key={index}>
            {page === '...' ? (
              <span className="w-10 h-10 flex items-center justify-center text-gray-400 dark:text-gray-500">
                <MoreHorizontal className="w-4 h-4" />
              </span>
            ) : (
              <button
                onClick={() => handlePageChange(page)}
                className={clsx(
                  'w-10 h-10 rounded-lg border text-sm font-medium transition',
                  currentPage === page
                    ? 'bg-green-500 border-green-500 text-white shadow-sm'
                    : 'border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400'
                )}
              >
                {page}
              </button>
            )}
          </React.Fragment>
        ))}

        {/* Next Button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={clsx(
            'w-10 h-10 rounded-lg border flex items-center justify-center transition',
            currentPage === totalPages
              ? 'border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400'
          )}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Page Size Selector */}
      {/* <div className="flex items-center space-x-2">
        <span className="text-sm text-gray-500 dark:text-gray-400">Afficher par page:</span>
        <select className="border border-gray-200 dark:border-gray-800 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-green-400 transition">
          <option value="10">5</option>
          <option value="25">10</option>
          <option value="50">20</option>
          <option value="100">50</option>
        </select>
      </div> */}
    </div>
  );
};

export default Pagination;