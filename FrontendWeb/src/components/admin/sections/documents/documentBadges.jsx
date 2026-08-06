import { statusTypes } from './documentConstants';

export const getStatusBadge = (status) => {
  const statusType = statusTypes.find(s => s.id === status);
  if (!statusType) return null;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusType.bgColor} ${statusType.textColor}`}>
      <statusType.icon className="w-3 h-3 mr-1" />
      {statusType.label}
    </span>
  );
};
