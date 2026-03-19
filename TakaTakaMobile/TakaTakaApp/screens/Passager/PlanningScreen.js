import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    StyleSheet,
    Dimensions,
    SafeAreaView,
    FlatList,
    ActivityIndicator,
    Platform,
    RefreshControl,
    Alert,
    Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext';
import { apiClient } from '../../services/apiClient';

const { width, height } = Dimensions.get('window');

// --- COMPOSANT CALENDRIER HORIZONTAL ---
const CalendarStrip = ({ selectedDate, onSelectDate, onOpenFullCalendar, theme, darkMode, trips }) => {
    const styles = getStyles(theme, darkMode);
    const dates = useMemo(() => {
        const d = [];
        const today = new Date();

        // On affiche 7 jours en arrière et 30 jours en avant pour voir les trajets passés et futurs
        for (let i = -7; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            d.push({
                fullDate: date.toISOString().split('T')[0],
                dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }),
                dayNum: date.getDate(),
                monthName: date.toLocaleDateString('fr-FR', { month: 'short' }),
            });
        }
        return d;
    }, []);

    // Vérifier si une date a des trajets
    const hasTrips = useCallback((dateStr) => {
        return trips.some(t => t.dateISO === dateStr);
    }, [trips]);

    const currentMonthYear = useMemo(() => {
        const date = new Date(selectedDate);
        return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }, [selectedDate]);

    return (
        <View style={styles.calendarStripContainer}>
            <View style={styles.calendarHeaderStrip}>
                <Text style={[styles.calendarTitleStrip, { textTransform: 'capitalize' }]}>{currentMonthYear}</Text>
                <TouchableOpacity onPress={onOpenFullCalendar} style={styles.calendarIconBtn}>
                    <Ionicons name="calendar" size={20} color={theme.primary} />
                </TouchableOpacity>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.calendarScroll}
            >
                {dates.map((date) => {
                    const isSelected = date.fullDate === selectedDate;
                    const hasJourney = hasTrips(date.fullDate);
                    return (
                        <TouchableOpacity
                            key={date.fullDate}
                            style={[
                                styles.dateCard,
                                isSelected && styles.dateCardActive
                            ]}
                            onPress={() => onSelectDate(date.fullDate)}
                        >
                            <Text style={[
                                styles.dayName,
                                isSelected && styles.dayNameActive
                            ]}>
                                {date.dayName}
                            </Text>
                            <Text style={[
                                styles.dayNumber,
                                isSelected && styles.dayNumberActive
                            ]}>
                                {date.dayNum}
                            </Text>
                            {hasJourney && !isSelected && (
                                <View style={styles.tripDot} />
                            )}
                            {hasJourney && isSelected && (
                                <View style={[styles.tripDot, { backgroundColor: '#FFFFFF' }]} />
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

// --- COMPOSANT CALENDRIER COMPLET (MODAL) ---
const FullCalendarModal = ({ visible, onClose, selectedDate, onSelectDate, theme, darkMode, trips }) => {
    const styles = getStyles(theme, darkMode);
    const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Dimanche

        const days = [];
        // Jours vides avant le 1er du mois
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push({ day: '', isEmpty: true });
        }
        // Jours du mois
        for (let i = 1; i <= daysInMonth; i++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            days.push({
                day: i,
                isEmpty: false,
                dateStr,
                isSelected: dateStr === selectedDate
            });
        }
        return days;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + offset);
        setCurrentMonth(newDate);
    };

    const days = getDaysInMonth(currentMonth);
    const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const weekDays = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={styles.fullCalendarOverlay}>
                <View style={styles.fullCalendarContainer}>
                    <View style={styles.fullCalendarHeader}>
                        <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthNavBtn}>
                            <Ionicons name="chevron-back" size={24} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={styles.fullCalendarTitle}>
                            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </Text>
                        <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthNavBtn}>
                            <Ionicons name="chevron-forward" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.weekDaysRow}>
                        {weekDays.map((day, index) => (
                            <Text key={index} style={styles.weekDayText}>{day}</Text>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {days.map((item, index) => {
                            const hasJourney = !item.isEmpty && trips.some(t => t.dateISO === item.dateStr);
                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.dayCell,
                                        !item.isEmpty && item.isSelected && styles.dayCellSelected
                                    ]}
                                    onPress={() => {
                                        if (!item.isEmpty) {
                                            onSelectDate(item.dateStr);
                                            onClose();
                                        }
                                    }}
                                    disabled={item.isEmpty}
                                >
                                    <Text style={[
                                        styles.dayCellText,
                                        item.isSelected && styles.dayCellTextSelected
                                    ]}>
                                        {item.day}
                                    </Text>
                                    {hasJourney && (
                                        <View style={[
                                            styles.tripDot,
                                            {
                                                bottom: 5,
                                                backgroundColor: item.isSelected ? '#FFFFFF' : theme.primary
                                            }
                                        ]} />
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TouchableOpacity style={styles.closeCalendarBtn} onPress={onClose}>
                        <Text style={styles.closeCalendarText}>Fermer</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

// --- COMPOSANT PRINCIPAL PLANNING SCREEN ---
const PlanningScreen = ({ onClose, onNewTrip }) => {
    const { darkMode, theme, t } = useApp();
    const styles = getStyles(theme, darkMode);

    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showFullCalendar, setShowFullCalendar] = useState(false);
    const [trips, setTrips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({ total: 0, confirmed: 0, pending: 0 });

    const fetchPlanning = useCallback(async (isRefreshing = false) => {
        if (!isRefreshing) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await apiClient('/passager/reservations-planifiees/planning?limit=50');
            if (res.succes) {
                const formattedTrips = res.plannings.map(item => {
                    const dateObj = new Date(item.datePlanifiee);
                    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

                    let statusLabel = 'En attente';
                    if (item.statut === 'ACCEPTEE' || item.statut === 'CONFIRMEE') statusLabel = 'Confirmé';
                    else if (item.statut === 'ANNULEE') statusLabel = 'Annulé';
                    else if (item.statut === 'TERMINEE') statusLabel = 'Terminé';

                    let vehicle = 'Véhicule';
                    if (item.chauffeur?.profilVehicule) {
                        const { marque, modele } = item.chauffeur.profilVehicule;
                        vehicle = `${marque || ''} ${modele || ''}`.trim() || 'Véhicule';
                    } else if (item.chauffeur?.vehicule) {
                        if (typeof item.chauffeur.vehicule === 'object') {
                            const { marque, modele, type } = item.chauffeur.vehicule;
                            vehicle = `${marque || ''} ${modele || ''}`.trim() || type || 'Véhicule';
                        } else {
                            vehicle = item.chauffeur.vehicule;
                        }
                    }

                    return {
                        id: item._id,
                        from: item.depart,
                        to: item.destination,
                        dateISO: dateObj.toISOString().split('T')[0],
                        displayDate: `${dateObj.getDate().toString().padStart(2, '0')} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`,
                        time: dateObj.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                        price: `${Number(item.prix).toLocaleString('fr-FR')} GNF`,
                        status: statusLabel,
                        rawStatus: item.statut,
                        driver: item.chauffeur ? `${item.chauffeur.prenom} ${item.chauffeur.nom?.charAt(0) || ''}.` : 'Recherche...',
                        car: vehicle,
                        plate: item.chauffeur?.profilVehicule?.plaque || 'En attente',
                        phone: item.chauffeur?.telephone || null
                    };
                });

                setTrips(formattedTrips);
                setStats({
                    total: res.stats?.totalTrajets || 0,
                    confirmed: res.stats?.confirmes || 0,
                    pending: res.stats?.enAttente || 0,
                });

                // Auto-sélectionner la date la plus pertinente
                const today = new Date().toISOString().split('T')[0];
                const hasToday = formattedTrips.some(t => t.dateISO === today);
                if (!hasToday && formattedTrips.length > 0) {
                    // 1. Chercher le prochain trajet futur
                    const upcomingTrips = formattedTrips
                        .filter(t => t.dateISO > today)
                        .sort((a, b) => a.dateISO.localeCompare(b.dateISO));

                    if (upcomingTrips.length > 0) {
                        setSelectedDate(upcomingTrips[0].dateISO);
                    } else {
                        // 2. Sinon, chercher le dernier trajet passé le plus récent
                        const pastTrips = formattedTrips
                            .filter(t => t.dateISO < today)
                            .sort((a, b) => b.dateISO.localeCompare(a.dateISO));

                        if (pastTrips.length > 0) {
                            setSelectedDate(pastTrips[0].dateISO);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Fetch planning error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchPlanning();
    }, [fetchPlanning]);

    const filteredTrips = useMemo(() => {
        return trips.filter(trip => trip.dateISO === selectedDate);
    }, [trips, selectedDate]);

    const renderTripItem = ({ item }) => (
        <TouchableOpacity
            style={styles.tripCard}
            onPress={() => setSelectedTrip(item)}
            activeOpacity={0.9}
        >
            <View style={styles.tripHeader}>
                <View style={styles.routeInfo}>
                    <Text style={styles.routeFrom}>{item.from}</Text>
                    <View style={styles.arrowContainer}>
                        <Ionicons name="arrow-down" size={12} color={theme.textSecondary} />
                    </View>
                    <Text style={styles.routeTo}>{item.to}</Text>
                </View>
                <View style={[
                    styles.statusBadge,
                    {
                        backgroundColor: (item.rawStatus === 'CONFIRMEE' || item.rawStatus === 'ACCEPTEE')
                            ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : '#DCFCE7')
                            : (item.rawStatus === 'ANNULEE' ? 'rgba(239, 68, 68, 0.2)' : (darkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7'))
                    }
                ]}>
                    <Text style={[
                        styles.statusText,
                        {
                            color: (item.rawStatus === 'CONFIRMEE' || item.rawStatus === 'ACCEPTEE')
                                ? (darkMode ? '#34D399' : '#166534')
                                : (item.rawStatus === 'ANNULEE' ? '#EF4444' : (darkMode ? '#FBBF24' : '#92400E'))
                        }
                    ]}>
                        {(item.rawStatus === 'CONFIRMEE' || item.rawStatus === 'ACCEPTEE') ? (t('planning_confirmed') || 'Confirmé') :
                            (item.rawStatus === 'ANNULEE' ? (t('history_cancelled') || 'Annulé') :
                                (item.rawStatus === 'TERMINEE' ? (t('history_completed') || 'Terminé') :
                                    (t('planning_pending') || 'En attente')))}
                    </Text>
                </View>
            </View>

            <View style={styles.tripFooter}>
                <View style={styles.tripMeta}>
                    <View style={styles.metaItem}>
                        <Ionicons name="time-outline" size={16} color={theme.textSecondary} />
                        <Text style={styles.metaText}>{item.time}</Text>
                    </View>
                    <View style={styles.metaItem}>
                        <Ionicons name="car-outline" size={16} color={theme.textSecondary} />
                        <Text style={styles.metaText}>{item.car}</Text>
                    </View>
                </View>
                <View style={styles.priceTag}>
                    <Text style={styles.priceText}>{item.price}</Text>
                </View>
            </View>
            <View style={styles.sectionTitleRow}>
                <Text style={styles.sectionTitle}>{t('ride_route') || 'ITINÉRAIRE'}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header Principal */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>{t('planning_title')}</Text>
                    <Text style={styles.subtitle}>{t('planning_subtitle')}</Text>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity
                        style={[styles.iconButton, styles.primaryButton]}
                        onPress={onNewTrip}
                    >
                        <Ionicons name="add" size={22} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Statistiques */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statNumber}>{stats.total}</Text>
                    <Text style={styles.statLabel}>{t('planning_total') || 'Total'}</Text>
                </View>
                <View style={[styles.statCard, styles.statBorder]}>
                    <Text style={[styles.statNumber, { color: '#10B981' }]}>{stats.confirmed}</Text>
                    <Text style={styles.statLabel}>{t('planning_confirmed_stats') || 'Confirmés'}</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statNumber, { color: '#F59E0B' }]}>{stats.pending}</Text>
                    <Text style={styles.statLabel}>{t('planning_pending_stats') || 'En attente'}</Text>
                </View>
            </View>

            {/* Calendrier Horizontal avec bouton Full Calendrier */}
            <CalendarStrip
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                onOpenFullCalendar={() => setShowFullCalendar(true)}
                theme={theme}
                darkMode={darkMode}
                trips={trips}
            />

            {/* Liste des trajets */}
            <View style={styles.listHeader}>
                <Text style={styles.listTitle}>
                    {filteredTrips.length} {t('planning_trips_for_date') || 'Trajet(s) pour le'} {selectedDate}
                </Text>
                <TouchableOpacity>
                    <Text style={styles.filterText}>{t('planning_filter') || 'Filtrer'}</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={[styles.emptyState, { marginTop: 100 }]}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={[styles.emptyText, { marginTop: 12 }]}>{t('planning_loading_trips') || 'Chargement de vos trajets...'}</Text>
                </View>
            ) : filteredTrips.length === 0 ? (
                <View style={styles.emptyState}>
                    <Ionicons name="calendar-clear-outline" size={60} color={darkMode ? '#475569' : '#CBD5E1'} />
                    <Text style={styles.emptyText}>{t('planning_no_trips_date') || 'Aucun trajet prévu à cette date'}</Text>

                    {trips.length > 0 && (
                        <TouchableOpacity
                            style={[styles.emptyButton, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.primary }]}
                            onPress={() => {
                                // Sauter au trajet le plus proche
                                const today = new Date().toISOString().split('T')[0];
                                const closest = trips
                                    .sort((a, b) => Math.abs(new Date(a.dateISO) - new Date(today)) - Math.abs(new Date(b.dateISO) - new Date(today)))[0];
                                if (closest) setSelectedDate(closest.dateISO);
                            }}
                        >
                            <Text style={[styles.emptyButtonText, { color: theme.primary }]}>Voir le trajet le plus proche</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.emptyButton}
                        onPress={onNewTrip}
                    >
                        <Text style={styles.emptyButtonText}>Réserver un trajet</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <FlatList
                    data={filteredTrips}
                    renderItem={renderTripItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => fetchPlanning(true)} tintColor={theme.primary} />
                    }
                />
            )}

            {/* --- MODAL CALENDRIER COMPLET --- */}
            <FullCalendarModal
                visible={showFullCalendar}
                onClose={() => setShowFullCalendar(false)}
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                theme={theme}
                darkMode={darkMode}
                trips={trips}
            />

            {/* --- MODAL DÉTAILS TRAJET (AMÉLIORÉ) --- */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={!!selectedTrip}
                onRequestClose={() => setSelectedTrip(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalBackdrop}
                        activeOpacity={1}
                        onPress={() => setSelectedTrip(null)}
                    />
                    <View style={styles.modalContent}>
                        {/* Handle pour le swipe */}
                        <View style={styles.modalHandle} />

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.modalScrollContent}
                        >
                            {/* Header Modal */}
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>{t('ride_details') || 'Détails du trajet'}</Text>
                                <TouchableOpacity onPress={() => setSelectedTrip(null)}>
                                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                                </TouchableOpacity>
                            </View>

                            {/* Statut */}
                            <View style={styles.statusContainer}>
                                <View style={[
                                    styles.statusPill,
                                    {
                                        backgroundColor: selectedTrip?.status === 'Confirmé'
                                            ? (darkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5')
                                            : (darkMode ? 'rgba(245, 158, 11, 0.2)' : '#FEF3C7')
                                    }
                                ]}>
                                    <View style={[styles.statusBadge, {
                                        backgroundColor: selectedTrip?.rawStatus === 'CONFIRMEE' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)'
                                    }]}>
                                        <View style={[styles.statusDot, {
                                            backgroundColor: selectedTrip?.rawStatus === 'CONFIRMEE' ? '#10B981' : '#F59E0B'
                                        }]} />
                                        <Text style={[styles.statusText, {
                                            color: selectedTrip?.rawStatus === 'CONFIRMEE' ? '#10B981' : '#F59E0B'
                                        }]}>
                                            {selectedTrip?.rawStatus === 'CONFIRMEE' ? (t('planning_confirmed') || 'Confirmé') : (t('planning_pending') || 'En attente')}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Carte Itinéraire */}
                            <View style={styles.infoCard}>
                                <Text style={styles.cardLabel}>Itinéraire</Text>
                                <View style={styles.routeRow}>
                                    <View style={styles.pointContainer}>
                                        <View style={styles.dotGreen} />
                                        <View style={styles.dashedLine} />
                                    </View>
                                    <View style={styles.routePointInfo}>
                                        <Text style={styles.routeLabel}>{t('ride_pickup') || 'Départ'}</Text>
                                        <Text style={styles.routeText} numberOfLines={2}>{selectedTrip?.from}</Text>
                                        <Text style={styles.routeTime}>{selectedTrip?.time}</Text>
                                    </View>
                                </View>
                                <View style={styles.routeRow}>
                                    <View style={styles.pointContainer}>
                                        <View style={styles.dotRed} />
                                    </View>
                                    <View style={styles.routePointInfo}>
                                        <Text style={styles.routeLabel}>{t('ride_destination') || 'Arrivée'}</Text>
                                        <Text style={styles.routeText} numberOfLines={3}>{selectedTrip?.to}</Text>
                                    </View>
                                </View>
                            </View>

                            {/* Carte Chauffeur */}
                            <View style={styles.infoCard}>
                                <Text style={styles.cardLabel}>Chauffeur</Text>
                                <View style={styles.driverRow}>
                                    <LinearGradient
                                        colors={['#3B82F6', '#2563EB']}
                                        style={styles.driverAvatarLarge}
                                    >
                                        <Text style={styles.driverAvatarText}>
                                            {selectedTrip?.driver.charAt(0)}
                                        </Text>
                                    </LinearGradient>
                                    <View style={styles.driverDetails}>
                                        <Text style={styles.driverName}>{selectedTrip?.driver}</Text>
                                        <Text style={styles.driverCar}>{selectedTrip?.car}</Text>
                                        <Text style={styles.driverPlate}>{selectedTrip?.plate}</Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.callButtonLarge}
                                        onPress={() => {
                                            if (selectedTrip?.phone) {
                                                Linking.openURL(`tel:${selectedTrip.phone}`);
                                            } else {
                                                Alert.alert('Indisponible', 'Le numéro du chauffeur n\'est pas encore disponible.');
                                            }
                                        }}
                                    >
                                        <Ionicons name="call" size={20} color="#FFFFFF" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                        </ScrollView>

                        {/* Pied de page fixe avec Prix et Actions */}
                        <View style={styles.modalFooterFixed}>
                            <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>{t('total') || 'Total'}</Text>
                                <Text style={styles.priceValueBig}>{selectedTrip?.price}</Text>
                            </View>
                            <View style={styles.actionRow}>
                                <TouchableOpacity
                                    style={styles.btnCancel}
                                    onPress={() => {
                                        Alert.alert(
                                            'Annuler le trajet',
                                            'Êtes-vous sûr de vouloir annuler ce trajet planifié ?',
                                            [
                                                { text: 'Non', style: 'cancel' },
                                                {
                                                    text: 'Oui, annuler',
                                                    style: 'destructive',
                                                    onPress: async () => {
                                                        try {
                                                            const res = await apiClient(`/passager/reservations-planifiees/planning/${selectedTrip.id}`, {
                                                                method: 'DELETE'
                                                            });
                                                            if (res.succes) {
                                                                setSelectedTrip(null);
                                                                fetchPlanning();
                                                                Alert.alert('Succès', 'Trajet annulé avec succès.');
                                                            } else {
                                                                Alert.alert('Erreur', res.message || 'Impossible d\'annuler ce trajet.');
                                                            }
                                                        } catch (e) {
                                                            Alert.alert('Erreur', 'Une erreur est survenue lors de l\'annulation.');
                                                        }
                                                    }
                                                }
                                            ]
                                        );
                                    }}
                                >
                                    <Text style={styles.btnCancelText}>Annuler</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.btnModify}
                                    onPress={() => {
                                        Alert.alert('Information', 'La modification sera disponible dans une prochaine mise à jour.');
                                    }}
                                >
                                    <Text style={styles.btnModifyText}>Modifier</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const getStyles = (theme, darkMode) => StyleSheet.create({
    // --- Styles Généraux ---
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: Platform.OS === 'android' ? 40 : 20,
        paddingBottom: 15,
        backgroundColor: 'transparent',
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.text,
    },
    subtitle: {
        fontSize: 13,
        color: theme.textSecondary,
        marginTop: 2,
    },
    headerButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: theme.card,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    primaryButton: {
        backgroundColor: theme.primary,
        borderWidth: 0,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: theme.card,
        marginHorizontal: 16,
        borderRadius: 20,
        padding: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: darkMode ? 0.3 : 0.05,
        shadowRadius: 10,
        elevation: 3,
        borderWidth: darkMode ? 1 : 0,
        borderColor: theme.border,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
    },
    statBorder: {
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: theme.border,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 11,
        color: theme.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // --- Calendrier Horizontal ---
    calendarStripContainer: {
        marginBottom: 16,
    },
    calendarHeaderStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    calendarTitleStrip: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
    },
    calendarIconBtn: {
        padding: 6,
        borderRadius: 8,
        backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
    },
    calendarScroll: {
        paddingHorizontal: 16,
    },
    dateCard: {
        width: 62,
        height: 78,
        borderRadius: 16,
        backgroundColor: theme.card,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: darkMode ? 0.2 : 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    dateCardActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    dayName: {
        fontSize: 11,
        color: theme.textSecondary,
        marginBottom: 2,
    },
    dayNameActive: {
        color: '#DBEAFE',
        fontWeight: '600',
    },
    dayNumber: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
    },
    dayNumberActive: {
        color: '#FFFFFF',
    },
    tripDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#10B981', // Vert pour plus de visibilité
        position: 'absolute',
        bottom: 6,
    },

    // --- Liste ---
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    listTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: theme.text,
    },
    filterText: {
        fontSize: 13,
        color: theme.primary,
        fontWeight: '600',
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 100,
    },
    tripCard: {
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: darkMode ? 0.2 : 0.04,
        shadowRadius: 12,
        elevation: 4,
    },
    tripHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    routeInfo: {
        flex: 1,
    },
    routeFrom: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 2,
    },
    arrowContainer: {
        marginVertical: 2,
    },
    routeTo: {
        fontSize: 14,
        color: theme.textSecondary,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '700',
    },
    tripFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    tripMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaText: {
        fontSize: 12,
        color: theme.textSecondary,
        marginLeft: 4,
    },
    priceTag: {
        backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.1)' : '#F0FDF4',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    priceText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#10B981',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        marginTop: 40,
    },
    emptyText: {
        fontSize: 16,
        color: theme.textSecondary,
        marginTop: 16,
        textAlign: 'center',
    },
    emptyButton: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 24,
        backgroundColor: theme.primary,
        borderRadius: 25,
    },
    emptyButtonText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },

    // --- Full Calendar Modal Styles ---
    fullCalendarOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    fullCalendarContainer: {
        backgroundColor: theme.background,
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        padding: 20,
        paddingBottom: 40,
        height: height * 0.7,
    },
    fullCalendarHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    fullCalendarTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.text,
    },
    monthNavBtn: {
        padding: 8,
        borderRadius: 10,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
    },
    weekDaysRow: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    weekDayText: {
        flex: 1,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '600',
        color: theme.textSecondary,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: (width - 40) / 7,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dayCellSelected: {
        backgroundColor: theme.primary,
        borderRadius: 12,
    },
    dayCellText: {
        fontSize: 15,
        color: theme.text,
    },
    dayCellTextSelected: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    closeCalendarBtn: {
        marginTop: 20,
        backgroundColor: theme.card,
        paddingVertical: 14,
        borderRadius: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    closeCalendarText: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
    },

    // --- Modal Détails ---
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
    },
    modalContent: {
        backgroundColor: theme.background,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: 24,
        maxHeight: height * 0.85,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: theme.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalTopBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
    },
    modalScrollContent: {
        paddingBottom: 20,
    },
    statusContainer: {
        marginBottom: 24,
    },
    statusPill: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusPillText: {
        fontSize: 13,
        fontWeight: '700',
    },
    infoCard: {
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    cardLabel: {
        fontSize: 12,
        color: theme.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 16,
        fontWeight: '700',
    },
    routeRow: {
        flexDirection: 'row',
        gap: 15,
    },
    pointContainer: {
        alignItems: 'center',
    },
    dotGreen: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#10B981',
        marginTop: 6,
    },
    dotRed: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        marginTop: 6,
    },
    dashedLine: {
        width: 1,
        height: 50,
        borderWidth: 1,
        borderColor: theme.border,
        borderStyle: 'dashed',
        marginVertical: 4,
    },
    routeTextContainer: {
        flex: 1,
        paddingBottom: 20,
    },
    routeLabelSmall: {
        fontSize: 11,
        color: theme.textSecondary,
        marginBottom: 2,
    },
    routeValueBig: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.text,
    },
    routeTimeText: {
        fontSize: 13,
        color: theme.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    driverRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    driverAvatarLarge: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    driverAvatarText: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    driverDetails: {
        flex: 1,
        marginLeft: 15,
    },
    driverName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: theme.text,
    },
    driverCar: {
        fontSize: 13,
        color: theme.textSecondary,
        marginTop: 2,
    },
    driverPlate: {
        fontSize: 11,
        color: theme.primary,
        fontWeight: '700',
        backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.1)' : '#EFF6FF',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginTop: 4,
    },
    callButtonLarge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalFooterFixed: {
        paddingTop: 20,
        paddingBottom: Platform.OS === 'ios' ? 20 : 10,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    priceLabel: {
        fontSize: 16,
        color: theme.text,
    },
    priceValueBig: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#10B981',
    },
    actionRow: {
        flexDirection: 'row',
        gap: 12,
    },
    btnCancel: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: theme.card,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.border,
    },
    btnCancelText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#EF4444',
    },
    btnModify: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: theme.primary,
        alignItems: 'center',
    },
    btnModifyText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});

export default PlanningScreen;