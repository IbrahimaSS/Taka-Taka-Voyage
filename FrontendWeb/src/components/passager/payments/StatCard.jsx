import Card from '../../admin/ui/Card';

const StatCard = ({ label, value, icon: Icon, colorClass, subValue, subIcon: SubIcon, onClick }) => (
  <Card hoverable padding="p-6" onClick={onClick} className="cursor-pointer">
    <div className="flex items-center space-x-4">
      <div className={`w-12 h-12 rounded-xl ${colorClass} flex items-center justify-center`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subValue && (
          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
            {SubIcon && <SubIcon className="w-3 h-3 mr-1" />}
            {subValue}
          </p>
        )}
      </div>
    </div>
  </Card>
);

export default StatCard;
