import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Card from '../../admin/ui/Card';

const PlanningCalendar = ({
  currentDate,
  currentMonth,
  daysGrid,
  weekDays,
  selectedDate,
  reservationsData,
  formatDateKey,
  formatMonthYear,
  isToday,
  isSameDay,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onGoToToday,
}) => {
  const { t } = useTranslation();

  return (
    <Card
      padding="p-4 sm:p-6"
      animate={false}
      className="lg:col-span-1 !rounded-xl !shadow-lg dark:!border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onPrevMonth}
          className="w-11 h-11 flex items-center justify-center shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronLeft className="w-5 h-5 dark:text-white" />
        </button>

        <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white text-center truncate">
          {formatMonthYear(currentDate)}
        </h2>

        <button
          onClick={onNextMonth}
          className="w-11 h-11 flex items-center justify-center shrink-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ChevronRight className="w-5 h-5 dark:text-white" />
        </button>
      </div>

      <button
        onClick={onGoToToday}
        className="w-full mb-4 min-h-[44px] px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
      >
        {t('planning.today')}
      </button>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-300 text-xs py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {daysGrid.map((date, index) => {
          const dayKey = formatDateKey(date);
          const hasReservations = reservationsData[dayKey];
          const isSelected = isSameDay(date, selectedDate);
          const isCurrentDay = isToday(date);
          const isCurrentMonth = date.getMonth() === currentMonth;

          return (
            <div
              key={index}
              onClick={() => onSelectDate(date)}
              className={`
                    h-11 sm:h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
                    ${isSelected
                  ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                  : 'border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                  `}
            >
              <div className="relative">
                <span className={`
                      text-sm font-medium
                      ${isCurrentDay
                    ? 'text-blue-500 font-bold dark:text-blue-400'
                    : isSelected ? 'text-blue-500 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                  }
                    `}>
                  {date.getDate()}
                </span>
                {hasReservations && (
                  <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2
                        ${reservationsData[dayKey].some(r => r.status === 'confirmée') ? 'w-1.5 h-1.5 bg-green-500' :
                      'w-1.5 h-1.5 bg-yellow-500'} rounded-full`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <div className="flex items-center justify-between text-xs flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('planning.today')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('planning.confirmed')}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">{t('planning.pending')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PlanningCalendar;
