import { useTranslation } from "react-i18next";
import { Calendar, RefreshCw } from "lucide-react";

import { useDriverPlanning } from "./planning/useDriverPlanning";
import PlanningCalendar from "./planning/PlanningCalendar";
import ReservationsPanel from "./planning/ReservationsPanel";
import ReservationDetailModal from "./planning/ReservationDetailModal";

const Planning = () => {
  const { t, i18n } = useTranslation();
  const {
    currentDate,
    selectedDate,
    setSelectedDate,
    editingReservation,
    actionPosition,
    loading,
    viewingDetails,
    setViewingDetails,
    actionMenuRef,
    reservationsData,
    handleActionClick,
    handleCall,
    handleStartTrip,
    updateReservationStatus,
    formatDateKey,
    formatDisplayDate,
    isToday,
    isSameDay,
    getStatusColor,
    currentMonth,
    daysGrid,
    weekDays,
    formatMonthYear,
    prevMonth,
    nextMonth,
    goToToday,
    selectedReservations,
  } = useDriverPlanning({ t, i18n });

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500 shrink-0" />
            {t('planning.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('planning.subtitle')}</p>
        </div>
        {loading && <RefreshCw className="w-5 h-5 animate-spin text-blue-500 shrink-0" />}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PlanningCalendar
          currentDate={currentDate}
          currentMonth={currentMonth}
          daysGrid={daysGrid}
          weekDays={weekDays}
          selectedDate={selectedDate}
          reservationsData={reservationsData}
          formatDateKey={formatDateKey}
          formatMonthYear={formatMonthYear}
          isToday={isToday}
          isSameDay={isSameDay}
          onSelectDate={setSelectedDate}
          onPrevMonth={prevMonth}
          onNextMonth={nextMonth}
          onGoToToday={goToToday}
        />

        <ReservationsPanel
          selectedDate={selectedDate}
          selectedReservations={selectedReservations}
          formatDisplayDate={formatDisplayDate}
          getStatusColor={getStatusColor}
          editingReservation={editingReservation}
          actionPosition={actionPosition}
          actionMenuRef={actionMenuRef}
          onActionClick={handleActionClick}
          onViewDetails={setViewingDetails}
          onCall={handleCall}
          onStartTrip={handleStartTrip}
          onUpdateStatus={updateReservationStatus}
        />
      </div>

      <ReservationDetailModal
        viewingDetails={viewingDetails}
        onClose={() => setViewingDetails(null)}
        formatDisplayDate={formatDisplayDate}
        onCall={handleCall}
        onStartTrip={handleStartTrip}
      />
    </div>
  );
};

export default Planning;
