// src/components/ui/Table.jsx - VERSION MODERNE
import React from 'react';
import clsx from 'clsx';

const Table = ({
  headers,
  children,
  className = '',
  compact = false,
  striped = false,
  hoverable = true
}) => {
  return (
    <div className={`overflow-x-auto w-full max-w-full rounded-lg border-gray-200 bg-white  ${className}`}>
      <table className="w-full min-w-[800px]">
        <thead>
          <tr className="bg-gradient-to-r from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-800/80">
            {headers.map((header, index) => {
              const isObject = typeof header === 'object' && header !== null;
              const label = isObject ? header.label : header;
              const headerClassName = isObject ? header.className : '';

              return (
                <th
                  key={index}
                  className={clsx(
                    'text-left py-4 px-6 text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider',
                    compact && 'py-3 px-4',
                    headerClassName
                  )}
                >
                  {label}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className={clsx(
          'divide-y divide-gray-200 dark:divide-gray-900',
          striped && '[&>*:nth-child(even)]:bg-gray-50/50 dark:[&>*:nth-child(even)]:bg-gray-800/30'
        )}>
          {children}
        </tbody>
      </table>
    </div>
  );
};

export const TableRow = ({
  children,
  className = '',
  onClick,
  hoverable = true
}) => (
  <tr
    className={clsx(
      'transition-colors duration-200',
      hoverable && 'hover:bg-gray-50/40   dark:bg-gray-800 dark:hover:bg-gray-900/20 dark:border-gray-900',
      onClick && 'cursor-pointer',
      className
    )}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const TableCell = ({
  children,
  className = '',
  align = 'left',
  compact = false
}) => {
  const alignment = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <td className={clsx(
      'py-4 px-6 text-sm text-gray-800 dark:text-gray-100 hover:bg-gray-50/40 border-b  dark:bg-gray-800  dark:border-gray-900',
      alignment[align],
      compact && 'py-3 px-4',
      className
    )}>
      {children}
    </td>
  );
};

export const TableHeader = ({
  children,
  className = '',
  align = 'left',
  compact = false
}) => {
  const alignment = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <th className={clsx(
      'py-4 px-6 text-sm font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider',
      alignment[align],
      compact && 'py-3 px-4',
      className
    )}>
      {children}
    </th>
  );
};

export default Table;