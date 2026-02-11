import React, { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Car, MapPin, AlertCircle, CheckCircle, XCircle } from "lucide-react";

const Planning = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingReservation, setEditingReservation] = useState(null); // ID de la réservation en cours d'édition
  const [actionPosition, setActionPosition] = useState({ x: 0, y: 0 });
  const [reservationsData, setReservationsData] = useState({
    "2025-12-28": [
      { id: 1, client: "Fela Baldé", time: "09:00", from: "Paris", to: "Lyon", status: "confirmée" },
      { id: 2, client: "Mariama Diané", time: "14:30", from: "Marseille", to: "Nice", status: "en attente" },
      { id: 8, client: "Ibrahim soumah", time: "18:00", from: "Lille", to: "Paris", status: "confirmée" }
    ],
    "2025-12-29": [
      { id: 9, client: "Tara man", time: "07:30", from: "Nice", to: "Marseille", status: "confirmée" },
      { id: 10, client: "Kevin Martin", time: "12:00", from: "Toulouse", to: "Montpellier", status: "en attente" }
    ],
    "2024-12-28": [
      { id: 3, client: "Pierre Bernard", time: "11:00", from: "Lyon", to: "Grenoble", status: "confirmée" },
      { id: 11, client: "Laura Petit", time: "15:45", from: "Rennes", to: "Nantes", status: "confirmée" }
    ],
    "2025-12-31": [
      { id: 4, client: "Sophie Dubois", time: "16:00", from: "Bordeaux", to: "Toulouse", status: "confirmée" },
      { id: 5, client: "Thomas Leroy", time: "20:00", from: "Paris", to: "Orléans", status: "annulée" },
      { id: 12, client: "Alexandre Moreau", time: "22:00", from: "Strasbourg", to: "Metz", status: "en attente" }
    ],
  });

  const actionMenuRef = useRef(null);

  // Gestionnaire pour fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target)) {
        setEditingReservation(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fonction pour ouvrir le menu d'actions
  const handleActionClick = (event, reservationId) => {
    event.stopPropagation();
    const rect = event.target.getBoundingClientRect();
    setActionPosition({
      x: rect.left - 120, // Ajuster la position
      y: rect.bottom + 5
    });
    setEditingReservation(reservationId);
  };

  // Fonction pour changer le statut d'une réservation
  const updateReservationStatus = (reservationId, newStatus) => {
    setReservationsData(prev => {
      const updated = { ...prev };
      
      Object.keys(updated).forEach(dateKey => {
        updated[dateKey] = updated[dateKey].map(reservation => {
          if (reservation.id === reservationId) {
            return { ...reservation, status: newStatus };
          }
          return reservation;
        });
      });
      
      return updated;
    });
    
    setEditingReservation(null); // Fermer le menu après l'action
  };

  // Fonctions utilitaires (inchangées)
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('fr-FR', {
      month: 'long',
      year: 'numeric'
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSameDay = (date1, date2) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const getMonthDays = (year, month) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];
    
    const firstDayOfWeek = firstDay.getDay();
    const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    for (let i = startOffset; i > 0; i--) {
      days.push(new Date(year, month, -i + 1));
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }
    
    const totalCells = 35;
    while (days.length < totalCells) {
      const nextDate = new Date(year, month + 1, days.length - lastDay.getDate() + 1);
      days.push(nextDate);
    }
    
    return days;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmée': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'en attente': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700';
      case 'annulée': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600';
    }
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const days = getMonthDays(currentYear, currentMonth);
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };
  
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const selectedKey = formatDateKey(selectedDate);
  const selectedReservations = reservationsData[selectedKey] || [];

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-500" />
            Planning des Réservations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Gérez vos trajets planifiés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier COMPACT */}
        <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 dark:text-white" />
            </button>
            
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              {formatMonthYear(currentDate)}
            </h2>
            
            <button 
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <ChevronRight className="w-5 h-5 dark:text-white" />
            </button>
          </div>

          {/* Bouton Aujourd'hui */}
          <button 
            onClick={goToToday}
            className="w-full mb-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
          >
            Aujourd'hui
          </button>

          {/* Jours de la semaine */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center font-medium text-gray-600 dark:text-gray-300 text-xs py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Grille du calendrier COMPACT */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              const dayKey = formatDateKey(date);
              const hasReservations = reservationsData[dayKey];
              const isSelected = isSameDay(date, selectedDate);
              const isCurrentDay = isToday(date);
              const isCurrentMonth = date.getMonth() === currentMonth;

              return (
                <div
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    h-12 flex flex-col items-center justify-center rounded-lg cursor-pointer transition-all
                    ${isSelected 
                      ? 'border-2 border-blue-500 bg-blue-50 dark:bg-blue-900/30' 
                      : 'border border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                    ${!isCurrentMonth ? 'opacity-40' : ''}
                  `}
                >
                  {/* Date */}
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
                    
                    {/* Point pour les réservations */}
                    {hasReservations && (
                      <div className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2
                        ${reservationsData[dayKey].some(r => r.status === 'confirmée') ? 'w-1.5 h-1.5 bg-green-500' : 
                         reservationsData[dayKey].some(r => r.status === 'en attente') ? 'w-1.5 h-1.5 bg-yellow-500' : 
                         'w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500'} rounded-full`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Légende compacte */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Aujourd'hui</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-gray-600 dark:text-gray-400">Confirmé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span className="text-gray-600 dark:text-gray-400">En attente</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panneau des réservations détaillées (GRAND) */}
        <div className="lg:col-span-2 space-y-6">
          {/* En-tête de la date */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-500 dark:text-blue-400" />
                  {formatDisplayDate(selectedDate)}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReservations.filter(r => r.status === 'confirmée').length} confirmées
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {selectedReservations.filter(r => r.status === 'en attente').length} en attente
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {selectedReservations.length} réservation{selectedReservations.length > 1 ? 's' : ''}
                </span>
                <div className="w-8 h-8 bg-blue-500/10 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Car className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Liste détaillée des réservations */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* En-tête du tableau */}
            <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-3">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 font-medium text-gray-700 dark:text-gray-300">Client</div>
                <div className="col-span-2 font-medium text-gray-700 dark:text-gray-300">Heure</div>
                <div className="col-span-4 font-medium text-gray-700 dark:text-gray-300">Trajet</div>
                <div className="col-span-2 font-medium text-gray-700 dark:text-gray-300">Statut</div>
                <div className="col-span-1 font-medium text-gray-700 dark:text-gray-300">Actions</div>
              </div>
            </div>

            {/* Liste des réservations */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
              {selectedReservations.length > 0 ? (
                selectedReservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Client */}
                      <div className="col-span-3 flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{reservation.client}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {reservation.id}</p>
                        </div>
                      </div>

                      {/* Heure */}
                      <div className="col-span-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                          <span className="font-medium text-gray-900 dark:text-white">{reservation.time}</span>
                        </div>
                      </div>

                      {/* Trajet */}
                      <div className="col-span-4">
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{reservation.from}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Départ</div>
                          </div>
                          <div className="text-gray-400 dark:text-gray-500">
                            <Car className="w-4 h-4" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{reservation.to}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Arrivée</div>
                          </div>
                        </div>
                      </div>

                      {/* Statut */}
                      <div className="col-span-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {reservation.status}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 relative">
                        <button 
                          onClick={(e) => handleActionClick(e, reservation.id)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors group"
                        >
                          <div className="flex flex-col items-center">
                            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1 group-hover:bg-blue-500"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full mb-1 group-hover:bg-blue-500"></div>
                            <div className="w-1 h-1 bg-gray-400 rounded-full group-hover:bg-blue-500"></div>
                          </div>
                        </button>

                        {/* Menu d'actions */}
                        {editingReservation === reservation.id && (
                          <div 
                            ref={actionMenuRef}
                            className="absolute z-10 top-full right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg w-48"
                            style={{
                              position: 'fixed',
                              left: `${actionPosition.x}px`,
                              top: `${actionPosition.y}px`
                            }}
                          >
                            <div className="p-1">
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'confirmée')}
                                className="flex items-center w-full px-3 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Confirmer
                              </button>
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'annulée')}
                                className="flex items-center w-full px-3 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Annuler
                              </button>
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'en attente')}
                                className="flex items-center w-full px-3 py-2 text-sm text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/30 rounded-md transition-colors"
                              >
                                <Clock className="w-4 h-4 mr-2" />
                                Mettre en attente
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions détaillées */}
                    <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700 flex gap-2">
                      <button className="flex-1 px-3 py-1.5 text-sm bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-colors">
                        <div className="flex items-center justify-center gap-1">
                          <User className="w-3 h-3" />
                          Contacter
                        </div>
                      </button>
                      <button className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        <div className="flex items-center justify-center gap-1">
                          <MapPin className="w-3 h-3" />
                          Itinéraire
                        </div>
                      </button>
                      <button className="flex-1 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                        Détails
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                  <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Aucune réservation</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                    Vous n'avez pas de trajet prévu pour le {formatDisplayDate(selectedDate)}
                  </p>
                  <button 
                    onClick={goToToday}
                    className="mt-4 px-4 py-2 text-blue-500 hover:text-blue-600 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Voir les réservations d'aujourd'hui
                  </button>
                </div>
              )}
            </div>

            {/* Résumé en bas */}
            {selectedReservations.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-3 bg-gray-50 dark:bg-gray-900">
                <div className="flex justify-between items-center text-sm">
                  <div className="text-gray-600 dark:text-gray-400">
                    Total : <span className="font-bold text-gray-900 dark:text-white">{selectedReservations.length}</span> réservation{selectedReservations.length > 1 ? 's' : ''}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      {selectedReservations.filter(r => r.status === 'confirmée').length} confirmées
                    </span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                      {selectedReservations.filter(r => r.status === 'en attente').length} en attente
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Planning;