import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Dimensions,
    Platform,
    Modal,
    StyleSheet,
    Image,
    Linking,
    ActivityIndicator,
    RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { WebView } from 'react-native-webview';
import { useApp } from '../../AppContext';
import { apiClient } from '../../services/apiClient';

const { width, height } = Dimensions.get('window');

export default function HistoryScreen({ navigation }) {
    const { darkMode, theme, user, t } = useApp();
    const styles = getStyles(theme, darkMode);
    const [selectedTab, setSelectedTab] = useState('trips');
    const [selectedFilter, setSelectedFilter] = useState('all');
    const [expandedRide, setExpandedRide] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [invoicePreview, setInvoicePreview] = useState(null);

    const [rideHistory, setRideHistory] = useState([]);
    const [paymentHistory, setPaymentHistory] = useState([]);
    const [stats, setStats] = useState({ trips: 0, spending: 0, rating: 5.0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            // 1. Fetch Stats
            const statsRes = await apiClient('/passager/profile/stats');
            if (statsRes.succes && statsRes.stats) {
                setStats({
                    trips: statsRes.stats.trips || 0,
                    spending: statsRes.stats.spending || 0,
                    rating: statsRes.stats.averageRating || 5.0
                });
            }

            // 2. Fetch Trips
            const tripsRes = await apiClient('/passager/trajets?limit=50');
            if (tripsRes.succes && tripsRes.trajets) {
                setRideHistory(groupRidesByDate(tripsRes.trajets));
                // Synchroniser le compteur de trajets avec le total réel de la liste
                if (tripsRes.pagination && tripsRes.pagination.total !== undefined) {
                    setStats(prev => ({ ...prev, trips: tripsRes.pagination.total }));
                }
            }

            // 3. Fetch Payments
            const paymentsRes = await apiClient('/passager/paiements/paiements?limit=50');
            if (paymentsRes.succes && Array.isArray(paymentsRes.paiements)) {
                setPaymentHistory(groupPaymentsByDate(paymentsRes.paiements));
            }
        } catch (e) {
            console.error('Fetch history error:', e);
        } finally {
            setLoading(false);
        }
    };

    const groupRidesByDate = (rides) => {
        const groups = {};
        const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

        rides.forEach(ride => {
            const date = new Date(ride.createdAt);
            const dateString = `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;
            const dayName = days[date.getDay()];
            const dateNumber = date.getDate();

            if (!groups[dateString]) {
                groups[dateString] = {
                    id: dateString,
                    date: dateString,
                    day: dayName,
                    dateNumber: dateNumber,
                    rides: []
                };
            }

            const driverName = ride.chauffeur ? `${ride.chauffeur.prenom} ${ride.chauffeur.nom.charAt(0)}.` : 'N/A';
            const vehicle = ride.chauffeur?.profilVehicule ? `${ride.chauffeur.profilVehicule.marque} ${ride.chauffeur.profilVehicule.modele}` : 'Véhicule';

            groups[dateString].rides.push({
                id: ride._id,
                reservationId: ride.reservation?._id || ride.reservation,
                time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
                from: ride.depart,
                to: ride.destination,
                driver: driverName,
                car: vehicle,
                plate: ride.chauffeur?.profilVehicule?.plaque || 'Sans plaque',
                price: `${Number(ride.prix).toLocaleString('fr-FR')} GNF`,
                duration: `${ride.dureeMin} min`,
                distance: `${ride.distanceKm} km`,
                rating: 5, // Default for now
                status: ride.statut.toLowerCase()
            });
        });
        return Object.values(groups);
    };

    const groupPaymentsByDate = (payments) => {
        const groups = {};
        const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

        payments.forEach(payment => {
            const date = new Date(payment.createdAt);
            const dateString = `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`;

            if (!groups[dateString]) {
                groups[dateString] = {
                    id: dateString,
                    date: dateString,
                    transactions: []
                };
            }
            groups[dateString].transactions.push({
                id: payment._id,
                time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
                amount: `${Number(payment.montantTotal).toLocaleString('fr-FR')} GNF`,
                method: payment.methode || 'Orange Money',
                status: payment.statut === 'PAYE' ? 'success' : 'pending',
                reference: payment.reference || payment._id?.toString().slice(-8).toUpperCase(),
                rideId: payment.reservation?._id || payment.reservation
            });
        });
        return Object.values(groups);
    };

    const filters = [
        { id: 'all', label: t('history_filter_all') || 'Tous' },
        { id: 'week', label: t('history_filter_week') || '7j' },
        { id: 'month', label: t('history_filter_month') || '30j' },
    ];

    const toggleRideDetails = (rideId) => {
        setExpandedRide(expandedRide === rideId ? null : rideId);
    };

    const getTotalTrips = () => {
        return rideHistory.reduce((total, day) => total + day.rides.length, 0);
    };

    const getTotalSpent = () => {
        let total = 0;
        rideHistory.forEach(day => {
            day.rides.forEach(ride => {
                total += parseInt(ride.price.replace(/[^0-9]/g, ''));
            });
        });
        return total.toLocaleString();
    };

    const handleBookAgain = (ride) => {
        // Naviguer vers l'écran de réservation
        Alert.alert(
            'Réserver à nouveau',
            `Voulez-vous réserver un trajet de ${ride.from} à ${ride.to} ?`,
            [
                {
                    text: 'Annuler',
                    style: 'cancel'
                },
                {
                    text: 'Réserver',
                    onPress: () => {
                        // Simuler la navigation
                        if (navigation && typeof navigation.navigate === 'function') {
                            navigation.navigate('Home', {
                                screen: 'Booking',
                                params: {
                                    pickup: ride.from,
                                    destination: ride.to
                                }
                            });
                        } else {
                            Alert.alert('Navigation non disponible');
                        }
                    }
                }
            ]
        );
    };

    const renderPaymentMethodLogo = (method) => {
        const m = method?.toUpperCase() || '';

        if (m.includes('ORANGE')) {
            return (
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#FF7900', justifyContent: 'center', alignItems: 'center' }}>
                    <Text
                        style={{ fontSize: 9, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' }}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                    >OM</Text>
                </View>
            );
        }
        if (m.includes('MTN')) {
            return (
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFCC00', justifyContent: 'center', alignItems: 'center' }}>
                    <Text
                        style={{ fontSize: 8, fontWeight: 'bold', color: '#000000', textAlign: 'center' }}
                        adjustsFontSizeToFit
                        numberOfLines={1}
                    >MTN</Text>
                </View>
            );
        }
        if (m.includes('CASH') || m.includes('ESPECE')) {
            return (
                <View style={{ width: 26, height: 26, backgroundColor: '#10B981', borderRadius: 13, justifyContent: 'center', alignItems: 'center' }}>
                    <Ionicons name="cash" size={14} color="#FFFFFF" />
                </View>
            );
        }
        return <Ionicons name="card" size={18} color={theme.textSecondary} />;
    };

    const renderStars = (rating) => {
        return (
            <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                        key={star}
                        name="star"
                        size={12}
                        color={star <= rating ? '#F59E0B' : (darkMode ? '#4B5563' : '#D1D5DB')}
                        style={{ marginRight: 2 }}
                    />
                ))}
            </View>
        );
    };

    const renderTripsHistory = () => (
        <>
            {/* Filtres simplifiés */}
            <View style={styles.filterContainer}>
                {filters.map(filter => (
                    <TouchableOpacity
                        key={filter.id}
                        style={[
                            styles.filterTab,
                            selectedFilter === filter.id && styles.filterTabActive
                        ]}
                        onPress={() => setSelectedFilter(filter.id)}
                    >
                        <Text style={[
                            styles.filterText,
                            selectedFilter === filter.id && styles.filterTextActive
                        ]}>
                            {filter.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Historique des trajets */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={false} onRefresh={fetchHistory} colors={[theme.primary]} />}
            >
                {rideHistory.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="car-outline" size={64} color={darkMode ? '#374151' : '#E5E7EB'} />
                        <Text style={styles.emptyText}>{t('history_empty')}</Text>
                    </View>
                ) : (
                    rideHistory.map(day => (
                        <View key={day.id} style={styles.daySection}>
                            <View style={styles.dayHeader}>
                                <View style={styles.dateBadge}>
                                    <Text style={styles.dayText}>{day.day}</Text>
                                    <Text style={styles.dateNumber}>{day.dateNumber}</Text>
                                </View>
                                <Text style={styles.dayTitle}>{day.date}</Text>
                            </View>

                            {day.rides.map(ride => (
                                <View key={ride.id} style={styles.rideCard}>
                                    <View style={styles.rideHeader}>
                                        <View style={styles.rideInfoLeft}>
                                            <View style={styles.timeBadge}>
                                                <Ionicons name="time" size={12} color="#3B82F6" />
                                                <Text style={styles.rideTime}>{ride.time}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.rideInfoRight}>
                                            <Text style={styles.ridePrice}>{ride.price}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.routeContainer}>
                                        <View style={styles.routeDot}>
                                            <View style={styles.startDot} />
                                        </View>
                                        <Text style={styles.routeFrom} numberOfLines={1}>{ride.from}</Text>
                                    </View>

                                    <View style={styles.routeContainer}>
                                        <View style={styles.routeDot}>
                                            <Ionicons name="location" size={12} color="#EF4444" />
                                        </View>
                                        <Text style={styles.routeTo} numberOfLines={1}>{ride.to}</Text>
                                    </View>

                                    <View style={styles.driverInfo}>
                                        <View style={[styles.driverAvatar, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}>
                                            <Ionicons name="person" size={14} color={theme.textSecondary} />
                                        </View>
                                        <View style={styles.driverDetails}>
                                            <Text style={styles.driverName}>{ride.driver}</Text>
                                            <Text style={styles.carInfo}>{ride.car} • {ride.plate}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.bookButton}
                                            onPress={() => handleBookAgain(ride)}
                                        >
                                            <Ionicons name="repeat" size={16} color="#FFFFFF" />
                                            <Text style={styles.bookButtonText}>{t('planning_book_now') || 'Réserver'}</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {expandedRide === ride.id && (
                                        <View style={styles.rideDetails}>
                                            <View style={styles.detailsGrid}>
                                                <View style={styles.detailItem}>
                                                    <Ionicons name="speedometer" size={14} color={theme.textSecondary} />
                                                    <Text style={styles.detailLabel}>{t('history_distance') || 'Distance'}</Text>
                                                    <Text style={styles.detailValue}>{ride.distance}</Text>
                                                </View>
                                                <View style={styles.detailItem}>
                                                    <Ionicons name="timer" size={14} color={theme.textSecondary} />
                                                    <Text style={styles.detailLabel}>{t('history_duration') || 'Durée'}</Text>
                                                    <Text style={styles.detailValue}>{ride.duration}</Text>
                                                </View>
                                            </View>
                                        </View>
                                    )}

                                    <TouchableOpacity
                                        style={styles.expandButton}
                                        onPress={() => toggleRideDetails(ride.id)}
                                    >
                                        <Text style={styles.expandText}>
                                            {expandedRide === ride.id ? (t('history_see_less') || 'Voir moins') : (t('history_see_more') || 'Voir plus')}
                                        </Text>
                                        <Ionicons
                                            name={expandedRide === ride.id ? "chevron-up" : "chevron-down"}
                                            size={16}
                                            color={theme.textSecondary}
                                        />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
        </>
    );

    const renderPaymentsHistory = () => (
        <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={false} onRefresh={fetchHistory} colors={[theme.primary]} />}
        >
            {paymentHistory.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="card-outline" size={64} color={darkMode ? '#374151' : '#E5E7EB'} />
                    <Text style={styles.emptyText}>Aucun paiement trouvé</Text>
                </View>
            ) : (
                paymentHistory.map(day => (
                    <View key={day.id} style={styles.daySection}>
                        <Text style={styles.dayTitle}>{day.date}</Text>

                        {day.transactions.map(payment => (
                            <View key={payment.id} style={styles.paymentCard}>
                                <View style={styles.paymentHeader}>
                                    <View style={styles.paymentInfo}>
                                        <Ionicons name="time" size={14} color={theme.textSecondary} />
                                        <Text style={styles.paymentTime}>{payment.time}</Text>
                                    </View>
                                    <View style={[
                                        styles.paymentStatus,
                                        payment.status === 'success' && styles.successStatus
                                    ]}>
                                        <Text style={styles.paymentStatusText}>
                                            {payment.status === 'success' ? '✓ Payé' : 'En attente'}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.paymentAmountContainer}>
                                    <Text style={styles.paymentAmount}>{payment.amount}</Text>
                                    <View style={styles.paymentActions}>
                                        <View style={styles.paymentMethod}>
                                            {renderPaymentMethodLogo(payment.method)}
                                            <Text style={styles.paymentMethodText}>{payment.method?.replace('_', ' ')}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.viewPaymentBtn}
                                            onPress={() => setSelectedPayment(payment)}
                                        >
                                            <Ionicons name="eye-outline" size={18} color="#3B82F6" />
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <Text style={styles.paymentReference}>Réf: {payment.reference}</Text>
                            </View>
                        ))}
                    </View>
                ))
            )}
        </ScrollView>
    );

    const downloadInvoice = async (payment) => {
        try {
            // Trouver le trajet associé pour plus de détails (destination, etc)
            const allRides = rideHistory.flatMap(day => day.rides);
            const ride = allRides.find(r => r.id === payment.rideId || r.reservationId === payment.rideId) || {
                from: 'N/A',
                to: 'N/A',
                distance: '0 km',
                duration: '0 min',
                driver: 'Chauffeur',
                car: 'Véhicule',
                plate: ''
            };

            const clientName = user ? `${user.prenom} ${user.nom}` : 'Passager Taka Taka';
            const paymentMethodDisplay = payment.method.replace('_', ' ').toUpperCase();

            const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Facture Taka Taka</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px; color: #1e293b; }
        .invoice-box { max-width: 800px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; background: #ffffff; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
        .logo-section { display: flex; align-items: center; gap: 16px; }
        .logo { width: 60px; height: 60px; background-color: #10b981; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 24px; }
        .company-info h1 { margin: 0; color: #2563eb; font-size: 24px; }
        .company-info p { margin: 4px 0 0 0; color: #64748b; font-size: 12px; letter-spacing: 1px; }
        .invoice-status { text-align: right; }
        .status-badge { display: inline-block; padding: 6px 12px; background-color: #3b82f6; color: white; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 0.5px; }
        .reference { margin-top: 8px; font-size: 14px; color: #64748b; font-weight: bold; }
        .info-grid { display: flex; justify-content: space-between; margin-bottom: 40px; }
        .billing-info h3 { margin: 0 0 8px 0; font-size: 12px; color: #3b82f6; text-transform: uppercase; letter-spacing: 1px; }
        .billing-info p { margin: 4px 0; font-size: 14px; color: #0f172a; font-weight: 500; }
        .amount-box { background-color: #f8fafc; padding: 20px 30px; border-radius: 12px; text-align: center; border: 1px solid #e2e8f0; }
        .amount-box p { margin: 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .amount-box h2 { margin: 8px 0; font-size: 32px; color: #2563eb; }
        .success-badge { display: inline-block; padding: 6px 12px; background-color: #d1fae5; color: #059669; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 8px; }
        .cards-grid { display: flex; gap: 20px; margin-bottom: 40px; }
        .info-card { flex: 1; border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; }
        .card-header { display: flex; align-items: center; gap: 8px; margin-bottom: 16px; font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold; }
        .card-title { font-size: 18px; color: #0f172a; font-weight: bold; margin: 0 0 12px 0; }
        .card-detail { margin: 6px 0; font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 8px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; border-radius: 12px; overflow: hidden; }
        .table th { background-color: #3b82f6; color: white; padding: 16px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .table td { padding: 20px 16px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        .course-title { font-weight: bold; color: #0f172a; margin: 0 0 12px 0; font-size: 16px; }
        .course-point { margin: 4px 0; font-size: 13px; color: #64748b; display: flex; align-items: center; gap: 8px; }
        .dot { width: 6px; height: 6px; background-color: #3b82f6; border-radius: 50%; display: inline-block; }
        .totals { width: 300px; margin-left: auto; }
        .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #64748b; }
        .total-row.highlight { color: #ef4444; font-weight: 500; }
        .total-final { display: flex; justify-content: space-between; padding: 16px 0; margin-top: 8px; border-top: 2px solid #e2e8f0; font-size: 18px; font-weight: bold; color: #0f172a; }
        .total-final span:last-child { color: #2563eb; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
        .cert-badge { color: #10b981; font-weight: bold; font-size: 14px; display: flex; align-items: center; gap: 6px; margin-bottom: 8px; }
        .cert-text { font-size: 11px; color: #94a3b8; max-width: 300px; line-height: 1.5; }
        .signature { text-align: right; }
        .signature-name { font-family: 'Georgia', serif; font-size: 28px; color: #cbd5e1; margin: 0 0 4px 0; font-style: italic; }
        .signature-line { width: 150px; height: 2px; background-color: #10b981; margin-left: auto; }

        /* Styles Responsifs pour Mobile */
        @media (max-width: 600px) {
            body { padding: 5px; background-color: #ffffff; }
            .invoice-box { padding: 15px; border: none; box-shadow: none; border-radius: 0; }
            .header { flex-direction: column; align-items: flex-start; margin-bottom: 20px; gap: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; }
            .logo-section { width: 100%; margin-bottom: 5px; }
            .invoice-status { text-align: left; display: flex; width: 100%; justify-content: space-between; align-items: center; }
            .reference { margin-top: 0; }
            .info-grid { flex-direction: column; gap: 25px; margin-bottom: 25px; }
            .billing-info > div { gap: 20px !important; justify-content: space-between; }
            .amount-box { padding: 25px 20px; border: 1px solid #e2e8f0; border-radius: 12px; text-align: center; background-color: #f8fafc; }
            .cards-grid { flex-direction: column; gap: 12px; margin-bottom: 25px; }
            .info-card { padding: 16px; background-color: #ffffff; }
            .table { display: block; overflow-x: auto; white-space: nowrap; margin-bottom: 20px; }
            .table th, .table td { padding: 12px 15px; font-size: 13px; }
            .totals { width: 100%; margin-top: 15px; background: #f8fafc; padding: 20px; border-radius: 12px; box-sizing: border-box; }
            .total-final { font-size: 18px; padding-top: 15px; border-top: 1px solid #cbd5e1; }
            .footer { flex-direction: column; gap: 25px; align-items: flex-start; text-align: left; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 30px; }
            .signature { text-align: left; width: 100%; }
            .signature-line { margin-left: 0; width: 100px; }
            .company-info h1 { font-size: 22px; }
            .cert-badge { font-size: 12px; }
        }
    </style>
</head>
<body>
    <div class="invoice-box">
        <div class="header">
            <div class="logo-section">
                <div class="logo">
                   <span>TT</span>
                </div>
                <div class="company-info">
                    <h1>Taka Taka</h1>
                    <p>VOTRE PARTENAIRE VOYAGE</p>
                </div>
            </div>
            <div class="invoice-status">
                <div class="status-badge">REÇU DE PAIEMENT</div>
                <div class="reference">RÉF: ${payment.reference}</div>
            </div>
        </div>

        <div class="info-grid">
            <div class="billing-info">
                <h3>ÉMETTEUR DU REÇU</h3>
                <p><strong>Taka Taka</strong></p>
                <p style="color: #64748b; font-size: 13px;">📍 Conakry, Guinée</p>
                <div style="display: flex; gap: 40px; margin-top: 20px;">
                    <div>
                        <h3 style="color:#64748b; font-size: 10px;">DATE D'ÉMISSION</h3>
                        <p style="font-size: 13px;">${payment.time} - ${payment.date || 'Aujourd\'hui'}</p>
                    </div>
                    <div>
                        <h3 style="color:#64748b; font-size: 10px;">MODE DE PAIEMENT</h3>
                        <p style="font-size: 13px;">${paymentMethodDisplay}</p>
                    </div>
                </div>
            </div>
            
            <div class="amount-box">
                <p>TOTAL À RÉGLER</p>
                <h2>${payment.amount}</h2>
                <div class="success-badge">✓ PAIEMENT CONFIRMÉ</div>
            </div>
        </div>

        <div class="cards-grid">
            <div class="info-card">
                <div class="card-header">
                    <span>👤</span> CLIENT
                </div>
                <p class="card-title">${clientName}</p>
                <p class="card-detail">Compte : ${user?.email || 'Vérifié'}</p>
            </div>
            <div class="info-card">
                <div class="card-header">
                    <span>🚗</span> CHAUFFEUR
                </div>
                <p class="card-title">${ride.driver}</p>
                <p class="card-detail">${ride.car} ${ride.plate ? '• ' + ride.plate : ''}</p>
            </div>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th>${(t('ride_details') || 'DÉSIGNATION DU TRAJET').toUpperCase()}</th>
                    <th style="text-align: center;">${(t('history_distance') || 'DISTANCE').toUpperCase()}</th>
                    <th style="text-align: center;">${(t('history_duration') || 'DURÉE').toUpperCase()}</th>
                    <th style="text-align: right;">${(t('planning_total') || 'MONTANT').toUpperCase()}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>
                        <p class="course-title">COURSE TAKA TAKA CONFORT</p>
                        <p class="course-point"><span class="dot"></span> ${(t('ride_pickup') || 'DÉPART').toUpperCase()}: <br/> &nbsp;&nbsp;&nbsp; ${ride.from}</p>
                        <p class="course-point"><span class="dot" style="background-color: #ef4444;"></span> ${(t('ride_destination') || 'ARRIVÉE').toUpperCase()}: <br/> &nbsp;&nbsp;&nbsp; ${ride.to}</p>
                    </td>
                    <td style="text-align: center; font-weight: bold; color: #0f172a;">${ride.distance}</td>
                    <td style="text-align: center; font-weight: bold; color: #0f172a;">${ride.duration}</td>
                    <td style="text-align: right; font-weight: bold; color: #0f172a;">${payment.amount}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals">
            <div class="total-row">
                <span>SOUS-TOTAL</span>
                <span>${payment.amount}</span>
            </div>
            <div class="total-row highlight">
                <span>COMMISSION PLATEFORME</span>
                <span>-incl.</span>
            </div>
            <div class="total-row">
                <span>TAXES INCL.</span>
                <span>18%</span>
            </div>
            <div class="total-final">
                <span>TOTAL TTC</span>
                <span>${payment.amount}</span>
            </div>
        </div>

        <div class="footer">
            <div>
                <div class="cert-badge">🛡️ CERTIFIÉ TAKA TAKA</div>
                <p class="cert-text">Preuve numérique de paiement. Validité juridique pour toutes fins administratives sur la plateforme Taka Taka.</p>
            </div>
            <div class="signature">
                <p class="signature-name">Admin TakaTaka</p>
                <p style="font-size: 10px; color: #94a3b8; margin: 0 0 8px 0; letter-spacing: 1px;">SIGNATURE AUTORISAIRE</p>
                <div class="signature-line"></div>
            </div>
        </div>
    </div>
</body>
</html>`;

            // Au lieu d'imprimer directement, on affiche l'aperçu in-app
            setInvoicePreview(html);
        } catch (error) {
            console.error(error);
            Alert.alert('Erreur', 'La génération de la facture a échoué.');
        }
    };

    const renderPaymentDetailModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={!!selectedPayment}
            onRequestClose={() => setSelectedPayment(null)}
        >
            <View style={styles.modalOverlay}>
                <TouchableOpacity
                    style={styles.modalBackdrop}
                    activeOpacity={1}
                    onPress={() => setSelectedPayment(null)}
                />
                <View style={[styles.modalContent, { height: height * 0.75 }]}>
                    <View style={styles.modalHandle} />

                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>{t('payment_details') || 'Détails du paiement'}</Text>
                        <TouchableOpacity onPress={() => setSelectedPayment(null)}>
                            <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                        <View style={styles.paymentStatusFull}>
                            <View style={styles.successIconBg}>
                                <Ionicons name="checkmark-circle" size={60} color="#10B981" />
                            </View>
                            <Text style={styles.paymentStatusTitle}>{t('payment_success') || 'Paiement Réussi'}</Text>
                            <Text style={styles.paymentAmountLarge}>{selectedPayment?.amount}</Text>
                        </View>

                        <View style={styles.detailCard}>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{t('reference') || 'Référence'}</Text>
                                <Text style={styles.detailValue}>{selectedPayment?.reference}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{t('date_time') || 'Date & Heure'}</Text>
                                <Text style={styles.detailValue}>{selectedPayment?.time}</Text>
                            </View>
                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>{t('booking_payment_method') || 'Méthode'}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    {renderPaymentMethodLogo(selectedPayment?.method)}
                                    <Text style={styles.detailValue}>{selectedPayment?.method?.replace('_', ' ')}</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={styles.downloadBtn}
                            onPress={() => downloadInvoice(selectedPayment)}
                        >
                            <Ionicons name="document-text" size={20} color="#FFFFFF" />
                            <Text style={styles.downloadBtnText}>{t('download_receipt') || 'Télécharger le Reçu'}</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const renderInvoicePreviewModal = () => (
        <Modal
            animationType="slide"
            visible={!!invoicePreview}
            onRequestClose={() => setInvoicePreview(null)}
        >
            <View style={{ flex: 1, backgroundColor: darkMode ? theme.background : '#F8FAFC' }}>
                {/* Header Premium de la visionneuse de facture */}
                <LinearGradient
                    colors={['#10B981', '#2563EB']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingTop: Platform.OS === 'ios' ? 50 : 40,
                        paddingHorizontal: 20,
                        paddingBottom: 15,
                    }}
                >
                    <TouchableOpacity onPress={() => setInvoicePreview(null)} style={{ padding: 5 }}>
                        <Ionicons name="close" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 18, color: '#FFFFFF', fontWeight: 'bold' }}>Aperçu de la Facture</Text>
                    <View style={{ flexDirection: 'row', gap: 15 }}>
                        <TouchableOpacity
                            onPress={async () => {
                                try {
                                    const { uri } = await Print.printToFileAsync({ html: invoicePreview });
                                    if (await Sharing.isAvailableAsync()) {
                                        await Sharing.shareAsync(uri, { UTI: 'com.adobe.pdf', mimeType: 'application/pdf' });
                                    }
                                } catch (e) {
                                    console.error(e);
                                }
                            }}
                            style={{ padding: 5 }}
                        >
                            <Ionicons name="share-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => Print.printAsync({ html: invoicePreview })}
                            style={{ padding: 5 }}
                        >
                            <Ionicons name="print-outline" size={24} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                </LinearGradient>

                {/* Affichage Web de la Facture */}
                {invoicePreview && (
                    <WebView
                        source={{ html: invoicePreview }}
                        style={{ flex: 1, backgroundColor: darkMode ? theme.background : '#F8FAFC' }}
                        originWhitelist={['*']}
                        showsVerticalScrollIndicator={false}
                        bounces={false}
                    />
                )}
            </View>
        </Modal>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} backgroundColor={darkMode ? '#111827' : '#FFFFFF'} />

            {/* Header Amélioré avec Logo Centré */}
            <LinearGradient
                colors={['#10B981', '#2563EB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingHorizontal: 16,
                    paddingTop: Platform.OS === 'android' ? 50 : 20,
                    paddingBottom: 20,
                    borderBottomLeftRadius: 25,
                    borderBottomRightRadius: 25,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    elevation: 10,
                    zIndex: 100,
                }}
            >
                <TouchableOpacity
                    style={{ padding: 8 }}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>

                <View style={{ flex: 1, alignItems: 'center' }}>
                    <View style={{
                        width: 45,
                        height: 45,
                        borderRadius: 22.5,
                        backgroundColor: '#FFFFFF',
                        alignItems: 'center',
                        justifyContent: 'center',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 5,
                        overflow: 'hidden',
                        borderWidth: 1.5,
                        borderColor: '#10B981'
                    }}>
                        <Image
                            source={require('../../assets/logo/LogoTT.jpeg')}
                            style={{ width: 35, height: 35, resizeMode: 'contain' }}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        if (navigation?.navigate) {
                            navigation.navigate('ContactSupport');
                        } else {
                            Linking.openURL('tel:+224621456789');
                        }
                    }}
                    style={{ padding: 8 }}
                >
                    <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
                </TouchableOpacity>
            </LinearGradient>

            {/* Stats Summary - Design Premium */}
            <View style={styles.premiumStatsContainer}>
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.trips}</Text>
                    <Text style={styles.statLabel}>{t('profile_trips') || 'Trajets'}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.spending.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>GNF</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                    <Text style={styles.statValue}>{stats.rating}</Text>
                    <Text style={styles.statLabel}>{t('profile_rating') || 'Note'}</Text>
                </View>
            </View>

            {/* Tab Selector */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedTab === 'trips' && styles.tabButtonActive
                    ]}
                    onPress={() => setSelectedTab('trips')}
                >
                    <Text style={[
                        styles.tabText,
                        selectedTab === 'trips' && styles.tabTextActive
                    ]}>{t('history_tab_trips') || 'Trajets'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.tabButton,
                        selectedTab === 'payments' && styles.tabButtonActive
                    ]}
                    onPress={() => setSelectedTab('payments')}
                >
                    <Text style={[
                        styles.tabText,
                        selectedTab === 'payments' && styles.tabTextActive
                    ]}>{t('history_tab_payments') || 'Paiements'}</Text>
                </TouchableOpacity>
            </View>

            {/* Main Content */}
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={theme.primary} />
                    <Text style={{ marginTop: 12, color: theme.textSecondary }}>{t('history_loading') || 'Chargement de l\'historique...'}</Text>
                </View>
            ) : (
                selectedTab === 'trips' ? renderTripsHistory() : renderPaymentsHistory()
            )}

            {/* Modal de Détails Paiement */}
            {renderPaymentDetailModal()}

            {/* Modal de Visionneuse de la Facture */}
            {renderInvoicePreviewModal()}
        </View>
    );
}

const getStyles = (theme, darkMode) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    header: {
        backgroundColor: 'transparent',
    },
    premiumStatsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 22,
        marginHorizontal: 20,
        marginTop: -15, // Chevauchement léger sur le header pour l'effet premium
        borderRadius: 20,
        backgroundColor: theme.card,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: darkMode ? 0.3 : 0.08,
        shadowRadius: 20,
        elevation: 8,
        borderWidth: darkMode ? 1 : 0,
        borderColor: theme.border,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.text,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: theme.border,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginTop: 25,
        marginBottom: 16,
        backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: theme.border,
    },
    tabButton: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 8,
    },
    tabButtonActive: {
        backgroundColor: theme.primary,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.textSecondary,
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    filterContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
    },
    filterTabActive: {
        backgroundColor: theme.primary,
        borderColor: theme.primary,
    },
    filterText: {
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    filterTextActive: {
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
    },
    daySection: {
        marginBottom: 24,
    },
    dayHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dateBadge: {
        width: 48,
        height: 48,
        backgroundColor: theme.card,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 1,
    },
    dayText: {
        fontSize: 11,
        color: theme.textSecondary,
        fontWeight: '600',
    },
    dateNumber: {
        fontSize: 16,
        color: theme.text,
        fontWeight: 'bold',
    },
    dayTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: theme.text,
    },
    rideCard: {
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: darkMode ? 0.2 : 0.05,
        shadowRadius: 12,
        elevation: 3,
    },
    rideHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    rideInfoLeft: {
        flex: 1,
    },
    timeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    rideTime: {
        fontSize: 13,
        color: theme.primary,
        fontWeight: '600',
        marginLeft: 6,
    },
    ridePrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#10B981',
    },
    rideInfoRight: {
        alignItems: 'flex-end',
    },
    starsContainer: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    distanceText: {
        fontSize: 12,
        color: theme.textSecondary,
        fontWeight: '500',
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    routeDot: {
        width: 20,
        alignItems: 'center',
        marginTop: 2,
    },
    startDot: {
        width: 8,
        height: 8,
        backgroundColor: theme.primary,
        borderRadius: 4,
    },
    routeFrom: {
        flex: 1,
        fontSize: 14,
        color: theme.textSecondary,
        lineHeight: 20,
    },
    routeTo: {
        flex: 1,
        fontSize: 14,
        color: theme.text,
        fontWeight: '600',
        lineHeight: 20,
    },
    driverInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    driverAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: darkMode ? '#374151' : '#F8FAFC',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderWidth: 1,
        borderColor: theme.border,
    },
    driverDetails: {
        flex: 1,
    },
    driverName: {
        fontSize: 14,
        color: theme.text,
        fontWeight: '600',
        marginBottom: 2,
    },
    carInfo: {
        fontSize: 12,
        color: theme.textSecondary,
    },
    bookButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.primary,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        shadowColor: theme.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    bookButtonText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '600',
        marginLeft: 6,
    },
    rideDetails: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    detailsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailItem: {
        alignItems: 'center',
        flex: 1,
    },
    detailLabel: {
        fontSize: 11,
        color: theme.textSecondary,
        marginTop: 4,
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 14,
        color: theme.text,
        fontWeight: '600',
    },
    expandButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: theme.border,
    },
    expandText: {
        fontSize: 13,
        color: theme.textSecondary,
        fontWeight: '500',
        marginRight: 6,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
        paddingHorizontal: 40,
    },
    emptyText: {
        fontSize: 16,
        color: theme.textSecondary,
        marginTop: 16,
        textAlign: 'center',
    },
    paymentCard: {
        backgroundColor: theme.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    paymentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    paymentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentTime: {
        fontSize: 13,
        color: theme.textSecondary,
        marginLeft: 6,
        fontWeight: '500',
    },
    paymentStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: darkMode ? '#374151' : '#F1F5F9',
    },
    successStatus: {
        backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5',
    },
    paymentStatusText: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: '600',
    },
    paymentAmountContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    paymentAmount: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#10B981',
    },
    paymentMethod: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    paymentMethodText: {
        fontSize: 13,
        color: theme.textSecondary,
        marginLeft: 6,
        fontWeight: '500',
    },
    paymentReference: {
        fontSize: 12,
        color: theme.textSecondary,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    paymentActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    viewPaymentBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: darkMode ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    // Modal Styles
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
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: theme.border,
        borderRadius: 3,
        alignSelf: 'center',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.text,
    },
    modalScroll: {
        paddingBottom: 20,
    },
    paymentStatusFull: {
        alignItems: 'center',
        marginBottom: 30,
    },
    successIconBg: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: darkMode ? 'rgba(16, 185, 129, 0.2)' : '#D1FAE5', // Fond vert très clair
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    paymentStatusTitle: {
        fontSize: 16,
        color: theme.textSecondary,
        marginBottom: 8,
    },
    paymentAmountLarge: {
        fontSize: 36,
        fontWeight: 'bold',
        color: theme.text,
    },
    detailCard: {
        backgroundColor: theme.card,
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: theme.border,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    detailLabel: {
        fontSize: 14,
        color: theme.textSecondary,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.text,
    },
    downloadBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10B981',
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
    },
    downloadBtnText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
});