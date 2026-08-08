import Button from '../../admin/ui/Bttn';

const FilterChip = ({ active, onClick, icon: Icon, label }) => (
  <Button
    variant={active ? 'primary' : 'secondary'}
    size="small"
    onClick={onClick}
    icon={Icon}
    className={active ? '' : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300'}
  >
    {label}
  </Button>
);

export default FilterChip;
