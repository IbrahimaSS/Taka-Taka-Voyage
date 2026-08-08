import { useTranslation } from 'react-i18next';
import { Calendar, Smartphone } from 'lucide-react';
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import Card, { CardContent } from '../../admin/ui/Card';
import Button from '../../admin/ui/Bttn';

const PlanningCalendarSidebar = ({
  calendarDate, onCalendarChange, tripDates,
  selectedDate, onSelectDate, onResetToday, onPageReset,
}) => {
  const { i18n } = useTranslation();

  return (
    <div className="lg:col-span-4 space-y-6">
      <Card hoverable className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent padding="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-blue-500" />
              Calendrier
            </h3>
            <Button variant="ghost" size="small" onClick={onResetToday}>Aujourd'hui</Button>
          </div>
          <div className="premium-calendar-v5">
            <CalendarComponent
              onChange={onCalendarChange}
              value={calendarDate}
              onClickDay={(date) => {
                const d = date.toISOString().split('T')[0];
                onSelectDate(selectedDate === d ? null : d);
                onPageReset();
              }}
              tileContent={({ date, view }) => {
                if (view === 'month') {
                  const dayStat = tripDates[date.toDateString()];
                  if (dayStat) {
                    return (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        {dayStat.includes('ACCEPTEE') && <div className="w-1 h-1 bg-emerald-500 rounded-full" />}
                        {dayStat.includes('EN_ATTENTE') && <div className="w-1 h-1 bg-amber-500 rounded-full" />}
                        {(dayStat.includes('ANNULEE') || dayStat.includes('ANNULEE_AVEC_FRAIS')) && <div className="w-1 h-1 bg-rose-500 rounded-full" />}
                      </div>
                    );
                  }
                }
                return null;
              }}
              locale={i18n.language === 'en' ? 'en-US' : 'fr-FR'}
              className="!w-full !border-0"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-blue-600 to-emerald-600 text-white">
        <div className="p-6">
          <div className="relative">
            <div className="absolute top-0 right-0 opacity-10"><Smartphone className="w-12 h-12" /></div>
            <h3 className="text-lg font-bold mb-2">Synchronisation Mobile</h3>
            <p className="text-sm text-white/80 mb-4">Recevez des rappels 15 minutes avant chaque départ programmé.</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default PlanningCalendarSidebar;
