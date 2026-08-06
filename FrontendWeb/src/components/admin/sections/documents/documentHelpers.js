import { FileText } from 'lucide-react';
import { documentTypes } from './documentConstants';

export const getDocumentIcon = (type) => {
  const docType = documentTypes.find(t => t.id === type);
  return docType ? docType.icon : FileText;
};

export const getTypeColor = (typeId) => {
  const type = documentTypes.find(t => t.id === typeId);
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
    teal: 'bg-teal-100 text-teal-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    pink: 'bg-pink-100 text-pink-600',
  };
  return colorMap[type?.color] || 'bg-gray-100 dark:bg-gray-950 text-gray-600 dark:text-gray-300';
};
