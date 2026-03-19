import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StatusBar,
    Alert,
    Dimensions,
    ActivityIndicator,
    Animated,
    Easing,
    Switch,
    Modal,
    RefreshControl,
    TextInput,
    FlatList
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import { styles } from './AdminDashboard.styles';
import { PLATFORM } from '../../constants/platform';
import { useApp } from '../../AppContext';

const { width, height } = Dimensions.get('window');

export default function AdminDashboard({ onLogout, setCurrentScreen }) {
    const { maintenanceMode, setMaintenanceMode, branding, setBranding } = useApp();
    const [activeTab, setActiveTab] = useState('dashboard');
    
    const [stats, setStats] = useState({
        totalDrivers: 347,
        activeDrivers: 245,
        pendingDocuments: 12,
        totalRides: 15289,
        todayRides: 324,
        totalEarnings: 125000000,
        pendingDisputes: 8,
        commissionRate: PLATFORM.commissionRatePercent,
    });
    
    const [pendingDrivers, setPendingDrivers] = useState([
        {
            id: 1,
            name: 'Mamadou Diallo',
            phone: '+224 621 45 67 89',
            car: 'Toyota Corolla 2020',
            plate: 'GK-AB-1234',
            documents: [
                { name: PLATFORM.driverDocuments[0].label, status: 'validé' },
                { name: PLATFORM.driverDocuments[1].label, status: 'validé' },
                { name: PLATFORM.driverDocuments[2].label, status: 'validé' },
                { name: PLATFORM.driverDocuments[3].label, status: 'en attente' },
                { name: PLATFORM.driverDocuments[4].label, status: 'validé' },
            ],
            joinDate: '2024-01-15',
            rating: 4.8,
            status: 'active',
        },
        {
            id: 2,
            name: 'Fatou Sylla',
            phone: '+224 623 78 90 12',
            car: 'Nissan Sunny 2019',
            plate: 'GK-CD-5678',
            documents: [
                { name: PLATFORM.driverDocuments[0].label, status: 'validé' },
                { name: PLATFORM.driverDocuments[1].label, status: 'en attente' },
                { name: PLATFORM.driverDocuments[2].label, status: 'en attente' },
                { name: PLATFORM.driverDocuments[3].label, status: 'en attente' },
                { name: PLATFORM.driverDocuments[4].label, status: 'en attente' },
            ],
            joinDate: '2024-01-10',
            rating: 4.5,
            status: 'active',
        },
        {
            id: 3,
            name: 'Ibrahim Bah',
            phone: '+224 624 56 78 90',
            car: 'Hyundai Accent 2021',
            plate: 'GK-EF-9012',
            documents: [
                { name: PLATFORM.driverDocuments[0].label, status: 'validé' },
                { name: PLATFORM.driverDocuments[1].label, status: 'validé' },
                { name: PLATFORM.driverDocuments[2].label, status: 'validé' },
                { name: PLATFORM.driverDocuments[3].label, status: 'validé' },
                { name: PLATFORM.driverDocuments[4].label, status: 'validé' },
            ],
            joinDate: '2024-01-05',
            rating: 4.9,
            status: 'suspended',
        },
    ]);
    
    // Trajets en cours
    const [activeRides, setActiveRides] = useState([
        {
            id: 1,
            driverName: 'Mamadou Diallo',
            passengerName: 'Abdoulaye Bah',
            pickup: 'Kaloum, Conakry',
            destination: 'Aéroport Gbessia',
            status: 'en_route',
            price: '15,000 GNF',
            commission: '2,250 GNF',
            duration: '25 min',
            driverLocation: { latitude: 9.5545, longitude: -13.6789 },
            passengerLocation: { latitude: 9.5789, longitude: -13.6678 }
        },
        {
            id: 2,
            driverName: 'Fatou Sylla',
            passengerName: 'Aissatou Barry',
            pickup: 'Matam',
            destination: 'Dixinn',
            status: 'pickup',
            price: '9,500 GNF',
            commission: '1,425 GNF',
            duration: '18 min',
            driverLocation: { latitude: 9.5489, longitude: -13.6889 },
            passengerLocation: { latitude: 9.5589, longitude: -13.6989 }
        }
    ]);
    
    // Litiges
    const [disputes, setDisputes] = useState([
        {
            id: 1,
            rideId: 'RIDE-12345',
            driverName: 'Mamadou Diallo',
            passengerName: 'Abdoulaye Bah',
            issue: 'Surfacturation',
            amount: '5,000 GNF',
            status: 'pending',
            date: 'Aujourd\'hui, 10:30',
            description: 'Le passager prétend avoir été facturé 5,000 GNF de plus que le prix convenu.'
        },
        {
            id: 2,
            rideId: 'RIDE-12346',
            driverName: 'Fatou Sylla',
            passengerName: 'Aissatou Barry',
            issue: 'Conduite dangereuse',
            amount: '0 GNF',
            status: 'in_progress',
            date: 'Hier, 18:15',
            description: 'Le passager se plaint d\'une conduite dangereuse et demande un remboursement.'
        }
    ]);
    
    // Transactions récentes
    const [transactions, setTransactions] = useState([
        {
            id: 1,
            driverName: 'Mamadou Diallo',
            amount: '125,000 GNF',
            commission: '18,750 GNF',
            netAmount: '106,250 GNF',
            date: 'Aujourd\'hui, 10:30',
            status: 'completed',
            type: 'payout'
        },
        {
            id: 2,
            driverName: 'Fatou Sylla',
            amount: '89,500 GNF',
            commission: '13,425 GNF',
            netAmount: '76,075 GNF',
            date: 'Hier, 18:15',
            status: 'completed',
            type: 'payout'
        }
    ]);
    
    const [pricing, setPricing] = useState({
        baseFare: '2,500 GNF',
        perKm: '1,200 GNF',
        perMinute: '200 GNF',
        commissionRate: `${PLATFORM.commissionRatePercent}%`,
        minFare: '4,000 GNF',
        surgeMultiplier: 1.5,
        fuelSurcharge: '500 GNF'
    });
    
    const [settings, setSettings] = useState({
        darkMode: false,
        language: 'fr',
        notifications: true,
        autoApproveDrivers: false,
        maxCommission: PLATFORM.commissionRatePercent,
        disputeResolutionDays: 7,
        currency: 'GNF'
    });
    
    // État pour les modals
    const [showDriverDetailsModal, setShowDriverDetailsModal] = useState(false);
    const [showDisputeModal, setShowDisputeModal] = useState(false);
    const [showRideTrackingModal, setShowRideTrackingModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showUserActionModal, setShowUserActionModal] = useState(false);
    
    // État pour les éléments sélectionnés
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [selectedDispute, setSelectedDispute] = useState(null);
    const [selectedRide, setSelectedRide] = useState(null);
    const [selectedUserAction, setSelectedUserAction] = useState(null);
    
    // États pour les nouvelles fonctionnalités
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [adminLocation, setAdminLocation] = useState({
        latitude: 9.5412,
        longitude: -13.6875,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
    });
    const [loadingLocation, setLoadingLocation] = useState(false);
    
    // Animations
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const mapRef = useRef(null);

    // Effets initiaux
    useEffect(() => {
        // Animation d'entrée
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic)
            })
        ]).start();

        requestLocationPermission();
        loadMockData();
    }, []);

    // ========== FONCTIONS DE GESTION ==========

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        setTimeout(() => {
            loadMockData();
            setRefreshing(false);
            Alert.alert('Actualisé', 'Les données ont été mises à jour');
        }, 2000);
    }, []);

    const requestLocationPermission = async () => {
        try {
            setLoadingLocation(true);
            let { status } = await Location.requestForegroundPermissionsAsync();
            
            if (status === 'granted') {
                let location = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High,
                });
                
                const { latitude, longitude } = location.coords;
                setAdminLocation({
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            }
        } catch (error) {
            console.error('Location error:', error);
        } finally {
            setLoadingLocation(false);
        }
    };

    const loadMockData = () => {
        // Simuler le chargement de données
        console.log('Données chargées');
    };

    // NOUVELLES FONCTIONS POUR SUSPENDRE/BLOQUER
    const handleSuspendDriver = (driverId) => {
        Alert.alert(
            'Suspendre le chauffeur',
            'Voulez-vous suspendre ce chauffeur ? Il ne pourra plus effectuer de courses temporairement.',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Suspendre', 
                    onPress: () => {
                        setPendingDrivers(pendingDrivers.map(d => 
                            d.id === driverId ? { ...d, status: 'suspended' } : d
                        ));
                        Alert.alert('Suspendu', 'Le chauffeur a été suspendu avec succès');
                        setShowUserActionModal(false);
                    }
                }
            ]
        );
    };

    const handleBlockDriver = (driverId) => {
        Alert.alert(
            'Bloquer le chauffeur',
            'Voulez-vous bloquer définitivement ce chauffeur ? Cette action est irréversible.',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Bloquer', 
                    onPress: () => {
                        setPendingDrivers(pendingDrivers.map(d => 
                            d.id === driverId ? { ...d, status: 'blocked' } : d
                        ));
                        Alert.alert('Bloqué', 'Le chauffeur a été bloqué avec succès');
                        setShowUserActionModal(false);
                    }
                }
            ]
        );
    };

    const handleActivateDriver = (driverId) => {
        Alert.alert(
            'Activer le chauffeur',
            'Voulez-vous réactiver ce chauffeur ? Il pourra à nouveau effectuer des courses.',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Activer', 
                    onPress: () => {
                        setPendingDrivers(pendingDrivers.map(d => 
                            d.id === driverId ? { ...d, status: 'active' } : d
                        ));
                        Alert.alert('Activé', 'Le chauffeur a été activé avec succès');
                        setShowUserActionModal(false);
                    }
                }
            ]
        );
    };

    const handleUserAction = (driver, action) => {
        setSelectedUserAction({ driver, action });
        setShowUserActionModal(true);
    };

    const handleApproveDriver = (driverId) => {
        Alert.alert(
            'Approuver le chauffeur',
            'Êtes-vous sûr de vouloir approuver ce chauffeur ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Approuver', 
                    onPress: () => {
                        setPendingDrivers(pendingDrivers.filter(d => d.id !== driverId));
                        setStats(prev => ({
                            ...prev,
                            activeDrivers: prev.activeDrivers + 1,
                            pendingDocuments: prev.pendingDocuments - 1
                        }));
                        Alert.alert('Succès', 'Le chauffeur a été approuvé avec succès');
                        setShowDriverDetailsModal(false);
                    }
                }
            ]
        );
    };

    const handleRejectDriver = (driverId) => {
        Alert.alert(
            'Rejeter le chauffeur',
            'Voulez-vous rejeter cette demande d\'inscription ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Rejeter', 
                    onPress: () => {
                        setPendingDrivers(pendingDrivers.filter(d => d.id !== driverId));
                        Alert.alert('Rejeté', 'La demande a été rejetée');
                        setShowDriverDetailsModal(false);
                    }
                }
            ]
        );
    };

    const handleResolveDispute = (disputeId, resolution) => {
        Alert.alert(
            'Résoudre le litige',
            `Êtes-vous sûr de vouloir ${resolution === 'resolved' ? 'résoudre' : 'rejeter'} ce litige ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Confirmer', 
                    onPress: () => {
                        setDisputes(disputes.map(d => 
                            d.id === disputeId ? { ...d, status: resolution === 'resolved' ? 'resolved' : 'rejected' } : d
                        ));
                        setStats(prev => ({
                            ...prev,
                            pendingDisputes: prev.pendingDisputes - 1
                        }));
                        Alert.alert('Succès', `Le litige a été ${resolution === 'resolved' ? 'résolu' : 'rejeté'}`);
                        setShowDisputeModal(false);
                    }
                }
            ]
        );
    };

    const handleUpdatePricing = () => {
        Alert.alert(
            'Tarifs mis à jour',
            'Les nouveaux tarifs ont été appliqués avec succès.',
            [{ text: 'OK' }]
        );
        setShowPricingModal(false);
    };

    const handleAdjustCommission = () => {
        Alert.alert(
            'Modifier la commission',
            'Entrez le nouveau taux de commission :',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Modifier', 
                    onPress: () => {
                        Alert.alert(
                            'Commission mise à jour',
                            'Le taux de commission a été modifié avec succès.',
                            [{ text: 'OK' }]
                        );
                    }
                }
            ]
        );
    };

    const handleExportData = () => {
        Alert.alert(
            'Exporter les données',
            'Sélectionnez le format d\'export :',
            [
                { text: 'CSV', onPress: () => handleExportFormat('csv') },
                { text: 'Excel', onPress: () => handleExportFormat('excel') },
                { text: 'PDF', onPress: () => handleExportFormat('pdf') },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const handleExportFormat = (format) => {
        Alert.alert(
            `Export ${format}`,
            'L\'exportation a été lancée. Vous recevrez un notification lorsque le fichier sera prêt.',
            [{ text: 'OK' }]
        );
    };

    const handleToggleSetting = (setting) => {
        setSettings(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
    };

    const handleChangeLanguage = () => {
        Alert.alert(
            'Changer la langue',
            'Sélectionnez votre langue préférée :',
            [
                { text: 'Français', onPress: () => setSettings(prev => ({ ...prev, language: 'fr' })) },
                { text: 'Anglais', onPress: () => setSettings(prev => ({ ...prev, language: 'en' })) },
                { text: 'Espagnol', onPress: () => setSettings(prev => ({ ...prev, language: 'es' })) },
                { text: 'Annuler', style: 'cancel' }
            ]
        );
    };

    const handleBackupDatabase = () => {
        Alert.alert(
            'Sauvegarde de la base de données',
            'Voulez-vous lancer une sauvegarde complète de la base de données ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { 
                    text: 'Sauvegarder', 
                    onPress: () => {
                        Alert.alert(
                            'Sauvegarde lancée',
                            'La sauvegarde est en cours. Vous serez notifié de son achèvement.',
                            [{ text: 'OK' }]
                        );
                    }
                }
            ]
        );
    };

    const handleViewDriverHistory = (driverId) => {
        Alert.alert(
            'Historique du chauffeur',
            'Ouverture de l\'historique des courses du chauffeur...',
            [{ text: 'OK' }]
        );
    };

    const handleViewRideDetails = (rideId) => {
        Alert.alert(
            'Détails de la course',
            'Ouverture des détails complets de la course...',
            [{ text: 'OK' }]
        );
    };

    // ========== MODALS ==========

    const renderUserActionModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showUserActionModal}
            onRequestClose={() => setShowUserActionModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Actions Utilisateur</Text>
                        <TouchableOpacity 
                            onPress={() => setShowUserActionModal(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                    
                    {selectedUserAction && (
                        <View style={styles.userActionModalContent}>
                            <Text style={styles.modalSectionTitle}>
                                Actions pour {selectedUserAction.driver.name}
                            </Text>
                            
                            <View style={styles.actionButtonsContainer}>
                                {selectedUserAction.driver.status === 'active' && (
                                    <>
                                        <TouchableOpacity 
                                            style={styles.suspendButton}
                                            onPress={() => handleSuspendDriver(selectedUserAction.driver.id)}
                                        >
                                            <Ionicons name="pause-circle" size={24} color="#F59E0B" />
                                            <Text style={styles.actionButtonText}>Suspendre</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={styles.blockButton}
                                            onPress={() => handleBlockDriver(selectedUserAction.driver.id)}
                                        >
                                            <Ionicons name="ban" size={24} color="#EF4444" />
                                            <Text style={styles.actionButtonText}>Bloquer</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                
                                {selectedUserAction.driver.status === 'suspended' && (
                                    <>
                                        <TouchableOpacity 
                                            style={styles.activateButton}
                                            onPress={() => handleActivateDriver(selectedUserAction.driver.id)}
                                        >
                                            <Ionicons name="play-circle" size={24} color="#10B981" />
                                            <Text style={styles.actionButtonText}>Activer</Text>
                                        </TouchableOpacity>
                                        
                                        <TouchableOpacity 
                                            style={styles.blockButton}
                                            onPress={() => handleBlockDriver(selectedUserAction.driver.id)}
                                        >
                                            <Ionicons name="ban" size={24} color="#EF4444" />
                                            <Text style={styles.actionButtonText}>Bloquer</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                
                                {selectedUserAction.driver.status === 'blocked' && (
                                    <TouchableOpacity 
                                        style={styles.activateButton}
                                        onPress={() => handleActivateDriver(selectedUserAction.driver.id)}
                                    >
                                        <Ionicons name="play-circle" size={24} color="#10B981" />
                                        <Text style={styles.actionButtonText}>Activer</Text>
                                    </TouchableOpacity>
                                )}
                                
                                <TouchableOpacity 
                                    style={styles.cancelButton}
                                    onPress={() => setShowUserActionModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Annuler</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );

    const renderDriverDetailsModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showDriverDetailsModal}
            onRequestClose={() => setShowDriverDetailsModal(false)}
        >
            <View style={styles.modalOverlay}>
                <ScrollView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Détails du chauffeur</Text>
                        <TouchableOpacity 
                            onPress={() => setShowDriverDetailsModal(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                    
                    {selectedDriver && (
                        <>
                            <View style={styles.driverModalContent}>
                                <View style={styles.driverModalHeader}>
                                    <View style={styles.driverModalAvatar}>
                                        <Text style={styles.driverModalInitial}>
                                            {selectedDriver.name.charAt(0)}
                                        </Text>
                                    </View>
                                    <View style={styles.driverModalInfo}>
                                        <Text style={styles.driverModalName}>{selectedDriver.name}</Text>
                                        <Text style={styles.driverModalPhone}>{selectedDriver.phone}</Text>
                                        <View style={styles.driverModalRating}>
                                            <Ionicons name="star" size={16} color="#FBBF24" />
                                            <Text style={styles.driverModalRatingText}>{selectedDriver.rating}</Text>
                                        </View>
                                        <View style={[
                                            styles.statusBadge,
                                            selectedDriver.status === 'active' && styles.statusActive,
                                            selectedDriver.status === 'suspended' && styles.statusSuspended,
                                            selectedDriver.status === 'blocked' && styles.statusBlocked
                                        ]}>
                                            <Text style={styles.statusBadgeText}>
                                                {selectedDriver.status === 'active' ? 'Actif' : 
                                                 selectedDriver.status === 'suspended' ? 'Suspendu' : 'Bloqué'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                
                                <View style={styles.driverModalSection}>
                                    <Text style={styles.modalSectionTitle}>Informations du véhicule</Text>
                                    <View style={styles.driverModalRow}>
                                        <Text style={styles.driverModalLabel}>Modèle:</Text>
                                        <Text style={styles.driverModalValue}>{selectedDriver.car}</Text>
                                    </View>
                                    <View style={styles.driverModalRow}>
                                        <Text style={styles.driverModalLabel}>Plaque:</Text>
                                        <Text style={styles.driverModalValue}>{selectedDriver.plate}</Text>
                                    </View>
                                    <View style={styles.driverModalRow}>
                                        <Text style={styles.driverModalLabel}>Date d'inscription:</Text>
                                        <Text style={styles.driverModalValue}>{selectedDriver.joinDate}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.driverModalSection}>
                                    <Text style={styles.modalSectionTitle}>Documents</Text>
                                    {selectedDriver.documents.map((doc, index) => (
                                        <View key={index} style={styles.documentItem}>
                                            <View style={styles.documentInfo}>
                                                <Ionicons name="document-text" size={20} color="#3B82F6" />
                                                <Text style={styles.documentName}>{doc.name}</Text>
                                            </View>
                                            <View style={[
                                                styles.documentStatusBadge,
                                                doc.status === 'validé' && styles.documentStatusValid,
                                                doc.status === 'en attente' && styles.documentStatusPending
                                            ]}>
                                                <Text style={styles.documentStatusText}>{doc.status}</Text>
                                            </View>
                                        </View>
                                    ))}
                                </View>
                                
                                <View style={styles.modalActions}>
                                    <TouchableOpacity 
                                        style={styles.actionButton}
                                        onPress={() => handleUserAction(selectedDriver, 'manage')}
                                    >
                                        <Ionicons name="settings" size={20} color="#3B82F6" />
                                        <Text style={styles.actionButtonText}>Gérer</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.rejectButton}
                                        onPress={() => handleRejectDriver(selectedDriver.id)}
                                    >
                                        <Text style={styles.rejectButtonText}>Rejeter</Text>
                                    </TouchableOpacity>
                                    
                                    <TouchableOpacity 
                                        style={styles.approveButton}
                                        onPress={() => handleApproveDriver(selectedDriver.id)}
                                    >
                                        <LinearGradient
                                            colors={['#10B981', '#059669']}
                                            style={styles.approveButtonGradient}
                                        >
                                            <Text style={styles.approveButtonText}>Approuver</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );

    const renderDisputeModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showDisputeModal}
            onRequestClose={() => setShowDisputeModal(false)}
        >
            <View style={styles.modalOverlay}>
                <ScrollView style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Détails du litige</Text>
                        <TouchableOpacity 
                            onPress={() => setShowDisputeModal(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                    
                    {selectedDispute && (
                        <>
                            <View style={styles.disputeModalContent}>
                                <View style={styles.disputeHeader}>
                                    <View style={styles.disputeBadge}>
                                        <Text style={styles.disputeBadgeText}>LIT-{selectedDispute.id}</Text>
                                    </View>
                                    <View style={[
                                        styles.disputeStatusBadge,
                                        selectedDispute.status === 'pending' && styles.disputeStatusPending,
                                        selectedDispute.status === 'in_progress' && styles.disputeStatusInProgress,
                                        selectedDispute.status === 'resolved' && styles.disputeStatusResolved
                                    ]}>
                                        <Text style={styles.disputeStatusText}>
                                            {selectedDispute.status === 'pending' ? 'En attente' : 
                                             selectedDispute.status === 'in_progress' ? 'En cours' : 'Résolu'}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.disputeSection}>
                                    <Text style={styles.modalSectionTitle}>Informations</Text>
                                    <View style={styles.disputeRow}>
                                        <Text style={styles.disputeLabel}>Course:</Text>
                                        <Text style={styles.disputeValue}>{selectedDispute.rideId}</Text>
                                    </View>
                                    <View style={styles.disputeRow}>
                                        <Text style={styles.disputeLabel}>Chauffeur:</Text>
                                        <Text style={styles.disputeValue}>{selectedDispute.driverName}</Text>
                                    </View>
                                    <View style={styles.disputeRow}>
                                        <Text style={styles.disputeLabel}>Passager:</Text>
                                        <Text style={styles.disputeValue}>{selectedDispute.passengerName}</Text>
                                    </View>
                                    <View style={styles.disputeRow}>
                                        <Text style={styles.disputeLabel}>Problème:</Text>
                                        <Text style={styles.disputeValue}>{selectedDispute.issue}</Text>
                                    </View>
                                    <View style={styles.disputeRow}>
                                        <Text style={styles.disputeLabel}>Montant:</Text>
                                        <Text style={styles.disputeValue}>{selectedDispute.amount}</Text>
                                    </View>
                                    <View style={styles.disputeRow}>
                                        <Text style={styles.disputeLabel}>Date:</Text>
                                        <Text style={styles.disputeValue}>{selectedDispute.date}</Text>
                                    </View>
                                </View>
                                
                                <View style={styles.disputeSection}>
                                    <Text style={styles.modalSectionTitle}>Description</Text>
                                    <Text style={styles.disputeDescription}>{selectedDispute.description}</Text>
                                </View>
                                
                                {selectedDispute.status !== 'resolved' && (
                                    <View style={styles.modalActions}>
                                        <TouchableOpacity 
                                            style={styles.rejectButton}
                                            onPress={() => handleResolveDispute(selectedDispute.id, 'rejected')}
                                        >
                                            <Text style={styles.rejectButtonText}>Rejeter</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity 
                                            style={styles.resolveButton}
                                            onPress={() => handleResolveDispute(selectedDispute.id, 'resolved')}
                                        >
                                            <LinearGradient
                                                colors={['#3B82F6', '#2563EB']}
                                                style={styles.resolveButtonGradient}
                                            >
                                                <Text style={styles.resolveButtonText}>Résoudre</Text>
                                            </LinearGradient>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </View>
                        </>
                    )}
                </ScrollView>
            </View>
        </Modal>
    );

    const renderRideTrackingModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={showRideTrackingModal}
            onRequestClose={() => setShowRideTrackingModal(false)}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.trackingModalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Suivi de course</Text>
                        <TouchableOpacity 
                            onPress={() => setShowRideTrackingModal(false)}
                            style={styles.closeButton}
                        >
                            <Ionicons name="close" size={24} color="#1F2937" />
                        </TouchableOpacity>
                    </View>
                    
                    {selectedRide && (
                        <>
                            <View style={styles.trackingModalContent}>
                                <View style={styles.rideTrackingHeader}>
                                    <View style={styles.rideTrackingInfo}>
                                        <Text style={styles.rideTrackingTitle}>Course #{selectedRide.id}</Text>
                                        <Text style={styles.rideTrackingSubtitle}>
                                            {selectedRide.driverName} → {selectedRide.passengerName}
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.rideStatusBadge,
                                        selectedRide.status === 'en_route' && styles.rideStatusActive,
                                        selectedRide.status === 'pickup' && styles.rideStatusPending
                                    ]}>
                                        <Text style={styles.rideStatusText}>
                                            {selectedRide.status === 'en_route' ? 'En route' : 'À récupérer'}
                                        </Text>
                                    </View>
                                </View>
                                
                                <View style={styles.trackingMapContainer}>
                                    <MapView
                                        ref={mapRef}
                                        style={styles.trackingMap}
                                        initialRegion={adminLocation}
                                        showsUserLocation={true}
                                        showsMyLocationButton={true}
                                    >
                                        {selectedRide.driverLocation && (
                                            <Marker coordinate={selectedRide.driverLocation} title="Chauffeur">
                                                <View style={styles.driverMarker}>
                                                    <Ionicons name="car" size={24} color="#3B82F6" />
                                                </View>
                                            </Marker>
                                        )}
                                        
                                        {selectedRide.passengerLocation && (
                                            <Marker coordinate={selectedRide.passengerLocation} title="Passager">
                                                <View style={styles.passengerMarker}>
                                                    <Ionicons name="person" size={20} color="#10B981" />
                                                </View>
                                            </Marker>
                                        )}
                                        
                                        {selectedRide.driverLocation && selectedRide.passengerLocation && (
                                            <Polyline
                                                coordinates={[selectedRide.driverLocation, selectedRide.passengerLocation]}
                                                strokeColor="#3B82F6"
                                                strokeWidth={3}
                                            />
                                        )}
                                    </MapView>
                                </View>
                                
                                <View style={styles.rideTrackingDetails}>
                                    <View style={styles.rideDetailItem}>
                                        <Ionicons name="location" size={20} color="#10B981" />
                                        <View style={styles.rideDetailContent}>
                                            <Text style={styles.rideDetailLabel}>Départ</Text>
                                            <Text style={styles.rideDetailValue}>{selectedRide.pickup}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rideDetailItem}>
                                        <Ionicons name="flag" size={20} color="#EF4444" />
                                        <View style={styles.rideDetailContent}>
                                            <Text style={styles.rideDetailLabel}>Destination</Text>
                                            <Text style={styles.rideDetailValue}>{selectedRide.destination}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rideDetailItem}>
                                        <Ionicons name="cash" size={20} color="#F59E0B" />
                                        <View style={styles.rideDetailContent}>
                                            <Text style={styles.rideDetailLabel}>Prix</Text>
                                            <Text style={styles.rideDetailValue}>{selectedRide.price}</Text>
                                        </View>
                                    </View>
                                    <View style={styles.rideDetailItem}>
                                        <MaterialIcons name="percent" size={20} color="#8B5CF6" />
                                        <View style={styles.rideDetailContent}>
                                            <Text style={styles.rideDetailLabel}>Commission</Text>
                                            <Text style={styles.rideDetailValue}>{selectedRide.commission}</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );

    // ========== COMPOSANTS DE RENDU ==========

    const renderHeader = () => (
        <LinearGradient
            colors={['#1E3A8A', '#3B82F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.headerGradient}
        >
            <View style={styles.headerContent}>
                <View style={styles.headerLeft}>
                    <View style={styles.adminAvatar}>
                        <Ionicons name="shield-checkmark" size={32} color="#FFFFFF" />
                    </View>
                    <View style={styles.headerInfo}>
                        <Text style={styles.welcomeText}>Tableau de bord Administrateur</Text>
                        <Text style={styles.adminName}>Administrateur Système</Text>
                        <Text style={styles.adminRole}>Superviseur principal • Connecté</Text>
                    </View>
                </View>
                
                <View style={styles.headerRight}>
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={handleExportData}
                    >
                        <Ionicons name="download" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={() => setActiveTab('settings')}
                    >
                        <Ionicons name="settings" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.headerButton}
                        onPress={onLogout}
                    >
                        <Ionicons name="log-out" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </LinearGradient>
    );

    const renderDashboardTab = () => (
        <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#3B82F6']}
                    tintColor="#3B82F6"
                />
            }
        >
            {/* Statistiques principales */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']}
                        style={styles.statIcon}
                    >
                        <Ionicons name="people" size={24} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.statValue}>{stats.totalDrivers}</Text>
                    <Text style={styles.statLabel}>Chauffeurs total</Text>
                </View>
                
                <View style={styles.statCard}>
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.statIcon}
                    >
                        <Ionicons name="car-sport" size={24} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.statValue}>{stats.activeDrivers}</Text>
                    <Text style={styles.statLabel}>Chauffeurs actifs</Text>
                </View>
                
                <View style={styles.statCard}>
                    <LinearGradient
                        colors={['#F59E0B', '#D97706']}
                        style={styles.statIcon}
                    >
                        <Ionicons name="document-text" size={24} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.statValue}>{stats.pendingDocuments}</Text>
                    <Text style={styles.statLabel}>Documents en attente</Text>
                </View>
                
                <View style={styles.statCard}>
                    <LinearGradient
                        colors={['#8B5CF6', '#7C3AED']}
                        style={styles.statIcon}
                    >
                        <MaterialIcons name="attach-money" size={24} color="#FFFFFF" />
                    </LinearGradient>
                    <Text style={styles.statValue}>{(stats.totalEarnings / 1000000).toFixed(1)}M</Text>
                    <Text style={styles.statLabel}>Revenus total</Text>
                </View>
            </View>

            {/* Cartes d'actions rapides */}
            <View style={styles.quickActionsSection}>
                <Text style={styles.sectionTitle}>Actions rapides</Text>
                <View style={styles.quickActionsGrid}>
                    <TouchableOpacity 
                        style={styles.quickActionCard}
                        onPress={() => setActiveTab('drivers')}
                    >
                        <LinearGradient
                            colors={['#EFF6FF', '#DBEAFE']}
                            style={styles.quickActionIcon}
                        >
                            <Ionicons name="person-add" size={24} color="#3B82F6" />
                        </LinearGradient>
                        <Text style={styles.quickActionText}>Valider chauffeurs</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionCard}
                        onPress={() => setActiveTab('disputes')}
                    >
                        <LinearGradient
                            colors={['#FEF3C7', '#FDE68A']}
                            style={styles.quickActionIcon}
                        >
                            <Ionicons name="warning" size={24} color="#D97706" />
                        </LinearGradient>
                        <Text style={styles.quickActionText}>Gérer litiges</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionCard}
                        onPress={() => setActiveTab('pricing')}
                    >
                        <LinearGradient
                            colors={['#D1FAE5', '#A7F3D0']}
                            style={styles.quickActionIcon}
                        >
                            <MaterialIcons name="price-change" size={24} color="#059669" />
                        </LinearGradient>
                        <Text style={styles.quickActionText}>Modifier tarifs</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.quickActionCard}
                        onPress={() => setActiveTab('rides')}
                    >
                        <LinearGradient
                            colors={['#FCE7F3', '#FBCFE8']}
                            style={styles.quickActionIcon}
                        >
                            <Ionicons name="map" size={24} color="#DB2777" />
                        </LinearGradient>
                        <Text style={styles.quickActionText}>Suivre trajets</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Chauffeurs en attente */}
            <View style={styles.pendingSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Chauffeurs en attente</Text>
                    <TouchableOpacity onPress={() => setActiveTab('drivers')}>
                        <Text style={styles.viewAllText}>Tout voir</Text>
                    </TouchableOpacity>
                </View>
                
                {pendingDrivers.slice(0, 2).map(driver => (
                    <View key={driver.id} style={styles.pendingDriverCard}>
                        <View style={styles.pendingDriverInfo}>
                            <View style={styles.pendingDriverAvatar}>
                                <Text style={styles.pendingDriverInitial}>
                                    {driver.name.charAt(0)}
                                </Text>
                            </View>
                            <View style={styles.pendingDriverDetails}>
                                <Text style={styles.pendingDriverName}>{driver.name}</Text>
                                <Text style={styles.pendingDriverCar}>{driver.car} • {driver.plate}</Text>
                                <View style={styles.pendingDriverDocs}>
                                    {driver.documents.map((doc, index) => (
                                        <View key={index} style={[
                                            styles.docBadge,
                                            doc.status === 'validé' && styles.docBadgeValid,
                                            doc.status === 'en attente' && styles.docBadgePending
                                        ]}>
                                            <Text style={styles.docBadgeText}>{doc.name}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                        
                        <TouchableOpacity 
                            style={styles.reviewButton}
                            onPress={() => {
                                setSelectedDriver(driver);
                                setShowDriverDetailsModal(true);
                            }}
                        >
                            <Text style={styles.reviewButtonText}>Examiner</Text>
                        </TouchableOpacity>
                    </View>
                ))}
            </View>

            {/* Litiges récents */}
            <View style={styles.disputesSection}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Litiges récents</Text>
                    <TouchableOpacity onPress={() => setActiveTab('disputes')}>
                        <Text style={styles.viewAllText}>Tout voir</Text>
                    </TouchableOpacity>
                </View>
                
                {disputes.slice(0, 2).map(dispute => (
                    <TouchableOpacity 
                        key={dispute.id} 
                        style={styles.disputeCard}
                        onPress={() => {
                            setSelectedDispute(dispute);
                            setShowDisputeModal(true);
                        }}
                    >
                        <View style={styles.disputeHeader}>
                            <Text style={styles.disputeTitle}>{dispute.issue}</Text>
                            <View style={[
                                styles.disputeStatus,
                                dispute.status === 'pending' && styles.disputeStatusPending,
                                dispute.status === 'in_progress' && styles.disputeStatusInProgress
                            ]}>
                                <Text style={styles.disputeStatusText}>
                                    {dispute.status === 'pending' ? 'En attente' : 'En cours'}
                                </Text>
                            </View>
                        </View>
                        <Text style={styles.disputeDescription} numberOfLines={2}>
                            {dispute.description}
                        </Text>
                        <View style={styles.disputeFooter}>
                            <Text style={styles.disputeDate}>{dispute.date}</Text>
                            <Text style={styles.disputeAmount}>{dispute.amount}</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const renderDriversTab = () => (
        <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* En-tête avec recherche */}
            <View style={styles.searchSection}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#6B7280" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un chauffeur..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <Ionicons name="filter" size={20} color="#3B82F6" />
                </TouchableOpacity>
            </View>

            {/* Filtres */}
            <View style={styles.filterSection}>
                <TouchableOpacity 
                    style={[styles.filterTab, filterStatus === 'all' && styles.filterTabActive]}
                    onPress={() => setFilterStatus('all')}
                >
                    <Text style={[styles.filterTabText, filterStatus === 'all' && styles.filterTabTextActive]}>
                        Tous ({pendingDrivers.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterTab, filterStatus === 'pending' && styles.filterTabActive]}
                    onPress={() => setFilterStatus('pending')}
                >
                    <Text style={[styles.filterTabText, filterStatus === 'pending' && styles.filterTabTextActive]}>
                        En attente ({pendingDrivers.length})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterTab, filterStatus === 'approved' && styles.filterTabActive]}
                    onPress={() => setFilterStatus('approved')}
                >
                    <Text style={[styles.filterTabText, filterStatus === 'approved' && styles.filterTabTextActive]}>
                        Approuvés ({stats.activeDrivers})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[styles.filterTab, filterStatus === 'suspended' && styles.filterTabActive]}
                    onPress={() => setFilterStatus('suspended')}
                >
                    <Text style={[styles.filterTabText, filterStatus === 'suspended' && styles.filterTabTextActive]}>
                        Suspendus ({pendingDrivers.filter(d => d.status === 'suspended').length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Liste des chauffeurs */}
            <View style={styles.driversList}>
                {pendingDrivers.map(driver => (
                    <View key={driver.id} style={styles.driverCard}>
                        <View style={styles.driverCardHeader}>
                            <View style={styles.driverInfo}>
                                <View style={styles.driverAvatar}>
                                    <Text style={styles.driverInitial}>
                                        {driver.name.charAt(0)}
                                    </Text>
                                </View>
                                <View style={styles.driverDetails}>
                                    <Text style={styles.driverName}>{driver.name}</Text>
                                    <Text style={styles.driverPhone}>{driver.phone}</Text>
                                    <View style={styles.driverMeta}>
                                        <Text style={styles.driverCar}>{driver.car}</Text>
                                        <Text style={styles.driverPlate}>• {driver.plate}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={styles.driverRating}>
                                <Ionicons name="star" size={16} color="#FBBF24" />
                                <Text style={styles.driverRatingText}>{driver.rating}</Text>
                            </View>
                        </View>
                        
                        {/* Badge de statut */}
                        <View style={[
                            styles.statusBadge,
                            driver.status === 'active' && styles.statusActive,
                            driver.status === 'suspended' && styles.statusSuspended,
                            driver.status === 'blocked' && styles.statusBlocked
                        ]}>
                            <Text style={styles.statusBadgeText}>
                                {driver.status === 'active' ? 'Actif' : 
                                 driver.status === 'suspended' ? 'Suspendu' : 'Bloqué'}
                            </Text>
                        </View>
                        
                        <View style={styles.driverDocuments}>
                            {driver.documents.map((doc, index) => (
                                <View key={index} style={styles.documentItem}>
                                    <Ionicons 
                                        name={doc.status === 'validé' ? "checkmark-circle" : "time"} 
                                        size={16} 
                                        color={doc.status === 'validé' ? "#10B981" : "#F59E0B"} 
                                    />
                                    <Text style={styles.documentText}>{doc.name}</Text>
                                </View>
                            ))}
                        </View>
                        
                        <View style={styles.driverActions}>
                            <TouchableOpacity 
                                style={styles.driverActionButton}
                                onPress={() => handleViewDriverHistory(driver.id)}
                            >
                                <Ionicons name="time" size={20} color="#6B7280" />
                                <Text style={styles.driverActionText}>Historique</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.manageButton}
                                onPress={() => handleUserAction(driver, 'manage')}
                            >
                                <Ionicons name="settings" size={20} color="#3B82F6" />
                                <Text style={styles.manageButtonText}>Gérer</Text>
                            </TouchableOpacity>
                            
                            <TouchableOpacity 
                                style={styles.driverActionButton}
                                onPress={() => {
                                    setSelectedDriver(driver);
                                    setShowDriverDetailsModal(true);
                                }}
                            >
                                <Ionicons name="eye" size={20} color="#3B82F6" />
                                <Text style={styles.driverActionText}>Examiner</Text>
                            </TouchableOpacity>
                            
                            {driver.status === 'active' && (
                                <TouchableOpacity 
                                    style={styles.approveDriverButton}
                                    onPress={() => handleApproveDriver(driver.id)}
                                >
                                    <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                                    <Text style={styles.approveDriverText}>Approuver</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                ))}
            </View>
        </ScrollView>
    );

    const renderRidesTab = () => (
        <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* En-tête */}
            <View style={styles.ridesHeader}>
                <Text style={styles.sectionTitle}>Trajets en cours</Text>
                <Text style={styles.ridesCount}>{activeRides.length} actifs</Text>
            </View>

            {/* Carte de suivi */}
            <View style={styles.trackingSection}>
                <View style={styles.mapContainer}>
                    <MapView
                        ref={mapRef}
                        style={styles.map}
                        initialRegion={adminLocation}
                    >
                        {activeRides.map(ride => (
                            <Marker 
                                key={ride.id}
                                coordinate={ride.driverLocation}
                                title={ride.driverName}
                                onPress={() => {
                                    setSelectedRide(ride);
                                    setShowRideTrackingModal(true);
                                }}
                            >
                                <View style={styles.rideMarker}>
                                    <Ionicons name="car" size={20} color="#3B82F6" />
                                </View>
                            </Marker>
                        ))}
                    </MapView>
                </View>
            </View>

            {/* Liste des trajets */}
            <View style={styles.activeRidesList}>
                {activeRides.map(ride => (
                    <TouchableOpacity 
                        key={ride.id} 
                        style={styles.activeRideCard}
                        onPress={() => {
                            setSelectedRide(ride);
                            setShowRideTrackingModal(true);
                        }}
                    >
                        <View style={styles.activeRideHeader}>
                            <View style={styles.rideInfo}>
                                <Text style={styles.rideDriver}>{ride.driverName}</Text>
                                <Text style={styles.ridePassenger}>→ {ride.passengerName}</Text>
                            </View>
                            <View style={[
                                styles.rideStatus,
                                ride.status === 'en_route' && styles.rideStatusActive,
                                ride.status === 'pickup' && styles.rideStatusPickup
                            ]}>
                                <Text style={styles.rideStatusText}>
                                    {ride.status === 'en_route' ? 'En route' : 'À récupérer'}
                                </Text>
                            </View>
                        </View>
                        
                        <View style={styles.rideRoute}>
                            <View style={styles.routePoint}>
                                <Ionicons name="location" size={16} color="#10B981" />
                                <Text style={styles.routeText} numberOfLines={1}>{ride.pickup}</Text>
                            </View>
                            <View style={styles.routePoint}>
                                <Ionicons name="flag" size={16} color="#EF4444" />
                                <Text style={styles.routeText} numberOfLines={1}>{ride.destination}</Text>
                            </View>
                        </View>
                        
                        <View style={styles.rideFooter}>
                            <View style={styles.rideMeta}>
                                <View style={styles.metaItem}>
                                    <Ionicons name="cash" size={14} color="#10B981" />
                                    <Text style={styles.metaText}>{ride.price}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <MaterialIcons name="percent" size={14} color="#8B5CF6" />
                                    <Text style={styles.metaText}>{ride.commission}</Text>
                                </View>
                                <View style={styles.metaItem}>
                                    <Ionicons name="time" size={14} color="#F59E0B" />
                                    <Text style={styles.metaText}>{ride.duration}</Text>
                                </View>
                            </View>
                            <TouchableOpacity 
                                style={styles.trackButton}
                                onPress={() => {
                                    setSelectedRide(ride);
                                    setShowRideTrackingModal(true);
                                }}
                            >
                                <Ionicons name="navigate" size={16} color="#3B82F6" />
                                <Text style={styles.trackButtonText}>Suivre</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const renderDisputesTab = () => (
        <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* En-tête avec statistiques */}
            <View style={styles.disputesStats}>
                <View style={styles.disputeStatCard}>
                    <Text style={styles.disputeStatValue}>{disputes.length}</Text>
                    <Text style={styles.disputeStatLabel}>Litiges total</Text>
                </View>
                <View style={styles.disputeStatCard}>
                    <Text style={styles.disputeStatValue}>
                        {disputes.filter(d => d.status === 'pending').length}
                    </Text>
                    <Text style={styles.disputeStatLabel}>En attente</Text>
                </View>
                <View style={styles.disputeStatCard}>
                    <Text style={styles.disputeStatValue}>
                        {disputes.filter(d => d.status === 'in_progress').length}
                    </Text>
                    <Text style={styles.disputeStatLabel}>En cours</Text>
                </View>
            </View>

            {/* Liste des litiges */}
            <View style={styles.disputesList}>
                {disputes.map(dispute => (
                    <TouchableOpacity 
                        key={dispute.id} 
                        style={styles.disputeCardLarge}
                        onPress={() => {
                            setSelectedDispute(dispute);
                            setShowDisputeModal(true);
                        }}
                    >
                        <View style={styles.disputeCardHeader}>
                            <View>
                                <Text style={styles.disputeCardTitle}>{dispute.issue}</Text>
                                <Text style={styles.disputeCardSubtitle}>
                                    {dispute.driverName} • {dispute.rideId}
                                </Text>
                            </View>
                            <View style={[
                                styles.disputeCardStatus,
                                dispute.status === 'pending' && styles.disputeCardStatusPending,
                                dispute.status === 'in_progress' && styles.disputeCardStatusInProgress,
                                dispute.status === 'resolved' && styles.disputeCardStatusResolved
                            ]}>
                                <Text style={styles.disputeCardStatusText}>
                                    {dispute.status === 'pending' ? 'En attente' : 
                                     dispute.status === 'in_progress' ? 'En cours' : 'Résolu'}
                                </Text>
                            </View>
                        </View>
                        
                        <Text style={styles.disputeCardDescription} numberOfLines={2}>
                            {dispute.description}
                        </Text>
                        
                        <View style={styles.disputeCardFooter}>
                            <View style={styles.disputeCardInfo}>
                                <Text style={styles.disputeCardDate}>{dispute.date}</Text>
                                <Text style={styles.disputeCardAmount}>{dispute.amount}</Text>
                            </View>
                            <TouchableOpacity 
                                style={styles.resolveNowButton}
                                onPress={() => {
                                    setSelectedDispute(dispute);
                                    setShowDisputeModal(true);
                                }}
                            >
                                <Text style={styles.resolveNowText}>
                                    {dispute.status === 'resolved' ? 'Voir détails' : 'Résoudre'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const renderPricingTab = () => (
        <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Tarification */}
            <View style={styles.pricingSection}>
                <Text style={styles.sectionTitle}>Paramètres de tarification</Text>
                <View style={styles.pricingCard}>
                    <View style={styles.pricingItem}>
                        <Text style={styles.pricingLabel}>Tarif de base</Text>
                        <TextInput
                            style={styles.pricingInput}
                            value={pricing.baseFare}
                            onChangeText={(text) => setPricing({...pricing, baseFare: text})}
                            placeholder="2,500 GNF"
                        />
                    </View>
                    <View style={styles.pricingItem}>
                        <Text style={styles.pricingLabel}>Prix par km</Text>
                        <TextInput
                            style={styles.pricingInput}
                            value={pricing.perKm}
                            onChangeText={(text) => setPricing({...pricing, perKm: text})}
                            placeholder="1,200 GNF"
                        />
                    </View>
                    <View style={styles.pricingItem}>
                        <Text style={styles.pricingLabel}>Prix par minute</Text>
                        <TextInput
                            style={styles.pricingInput}
                            value={pricing.perMinute}
                            onChangeText={(text) => setPricing({...pricing, perMinute: text})}
                            placeholder="200 GNF"
                        />
                    </View>
                    <View style={styles.pricingItem}>
                        <Text style={styles.pricingLabel}>Tarif minimum</Text>
                        <TextInput
                            style={styles.pricingInput}
                            value={pricing.minFare}
                            onChangeText={(text) => setPricing({...pricing, minFare: text})}
                            placeholder="4,000 GNF"
                        />
                    </View>
                    <View style={styles.pricingItem}>
                        <Text style={styles.pricingLabel}>Majoration carburant</Text>
                        <TextInput
                            style={styles.pricingInput}
                            value={pricing.fuelSurcharge}
                            onChangeText={(text) => setPricing({...pricing, fuelSurcharge: text})}
                            placeholder="500 GNF"
                        />
                    </View>
                    <View style={styles.pricingItem}>
                        <Text style={styles.pricingLabel}>Multiplicateur de pointe</Text>
                        <TextInput
                            style={styles.pricingInput}
                            value={pricing.surgeMultiplier.toString()}
                            onChangeText={(text) => setPricing({...pricing, surgeMultiplier: parseFloat(text) || 1.5})}
                            placeholder="1.5"
                            keyboardType="numeric"
                        />
                    </View>
                </View>
                
                <TouchableOpacity 
                    style={styles.updatePricingButton}
                    onPress={handleUpdatePricing}
                >
                    <LinearGradient
                        colors={['#10B981', '#059669']}
                        style={styles.updatePricingGradient}
                    >
                        <Ionicons name="save" size={20} color="#FFFFFF" />
                        <Text style={styles.updatePricingText}>Mettre à jour les tarifs</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* Commission */}
            <View style={styles.commissionSection}>
                <Text style={styles.sectionTitle}>Commission</Text>
                <View style={styles.commissionCard}>
                    <View style={styles.commissionHeader}>
                        <Text style={styles.commissionTitle}>Taux de commission actuel</Text>
                        <Text style={styles.commissionValue}>{stats.commissionRate}%</Text>
                    </View>
                    <View style={styles.commissionSlider}>
                        <View style={styles.sliderTrack}>
                            <View style={[styles.sliderProgress, { width: `${stats.commissionRate}%` }]} />
                        </View>
                        <View style={styles.sliderLabels}>
                            <Text style={styles.sliderLabel}>0%</Text>
                            <Text style={styles.sliderLabel}>10%</Text>
                            <Text style={styles.sliderLabel}>20%</Text>
                            <Text style={styles.sliderLabel}>30%</Text>
                        </View>
                    </View>
                    <TouchableOpacity 
                        style={styles.adjustCommissionButton}
                        onPress={handleAdjustCommission}
                    >
                        <Text style={styles.adjustCommissionText}>Ajuster la commission</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );

    const renderSettingsTab = () => (
        <ScrollView 
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
        >
            {/* Mode maintenance (comme sur le web) */}
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Maintenance</Text>
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="construct" size={24} color="#EF4444" />
                        <View>
                            <Text style={styles.settingText}>Mode maintenance</Text>
                            <Text style={styles.settingDescription}>Suspend les réservations pour tous les utilisateurs</Text>
                        </View>
                    </View>
                    <Switch
                        value={maintenanceMode}
                        onValueChange={(v) => setMaintenanceMode(v)}
                        trackColor={{ false: '#D1D5DB', true: '#EF4444' }}
                    />
                </View>
            </View>

            {/* Branding (nom, slogan - comme sur le web) */}
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Branding</Text>
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="color-palette" size={24} color="#8B5CF6" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.settingText}>Nom de la plateforme</Text>
                            <TextInput
                                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginTop: 6, fontSize: 14 }}
                                value={branding.platformName || ''}
                                onChangeText={(t) => setBranding({ platformName: t })}
                                placeholder="Taka-Taka Voyage"
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="text" size={24} color="#3B82F6" />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.settingText}>Slogan</Text>
                            <TextInput
                                style={{ borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, padding: 10, marginTop: 6, fontSize: 14 }}
                                value={branding.slogan || ''}
                                onChangeText={(t) => setBranding({ slogan: t })}
                                placeholder="Déplacements intelligents en Guinée"
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* Paramètres système */}
            <View style={styles.settingsSection}>
                <Text style={styles.sectionTitle}>Paramètres système</Text>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="moon" size={24} color="#8B5CF6" />
                        <View>
                            <Text style={styles.settingText}>Mode sombre</Text>
                            <Text style={styles.settingDescription}>Activer l'interface sombre</Text>
                        </View>
                    </View>
                    <Switch
                        value={settings.darkMode}
                        onValueChange={() => handleToggleSetting('darkMode')}
                        trackColor={{ false: '#D1D5DB', true: '#8B5CF6' }}
                    />
                </View>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="language" size={24} color="#3B82F6" />
                        <View>
                            <Text style={styles.settingText}>Langue</Text>
                            <Text style={styles.settingDescription}>
                                {settings.language === 'fr' ? 'Français' : 
                                 settings.language === 'en' ? 'Anglais' : 'Espagnol'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleChangeLanguage}>
                        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                    </TouchableOpacity>
                </View>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="notifications" size={24} color="#F59E0B" />
                        <View>
                            <Text style={styles.settingText}>Notifications</Text>
                            <Text style={styles.settingDescription}>Recevoir des alertes système</Text>
                        </View>
                    </View>
                    <Switch
                        value={settings.notifications}
                        onValueChange={() => handleToggleSetting('notifications')}
                        trackColor={{ false: '#D1D5DB', true: '#F59E0B' }}
                    />
                </View>
                
                <View style={styles.settingItem}>
                    <View style={styles.settingLeft}>
                        <Ionicons name="shield-checkmark" size={24} color="#10B981" />
                        <View>
                            <Text style={styles.settingText}>Approbation automatique</Text>
                            <Text style={styles.settingDescription}>Approuver automatiquement les nouveaux chauffeurs</Text>
                        </View>
                    </View>
                    <Switch
                        value={settings.autoApproveDrivers}
                        onValueChange={() => handleToggleSetting('autoApproveDrivers')}
                        trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                    />
                </View>
            </View>

            {/* Gestion des données */}
            <View style={styles.dataManagementSection}>
                <Text style={styles.sectionTitle}>Gestion des données</Text>
                
                <TouchableOpacity 
                    style={styles.dataActionButton}
                    onPress={handleExportData}
                >
                    <View style={styles.dataActionIcon}>
                        <Ionicons name="download" size={24} color="#3B82F6" />
                    </View>
                    <View style={styles.dataActionInfo}>
                        <Text style={styles.dataActionTitle}>Exporter les données</Text>
                        <Text style={styles.dataActionDescription}>Exporter toutes les données au format CSV/Excel</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.dataActionButton}
                    onPress={handleBackupDatabase}
                >
                    <View style={styles.dataActionIcon}>
                        <Ionicons name="server" size={24} color="#10B981" />
                    </View>
                    <View style={styles.dataActionInfo}>
                        <Text style={styles.dataActionTitle}>Sauvegarde de la base</Text>
                        <Text style={styles.dataActionDescription}>Créer une sauvegarde complète de la base de données</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
                
                <TouchableOpacity 
                    style={styles.dataActionButton}
                    onPress={() => Alert.alert('Archivage', 'Fonctionnalité d\'archivage')}
                >
                    <View style={styles.dataActionIcon}>
                        <Ionicons name="archive" size={24} color="#F59E0B" />
                    </View>
                    <View style={styles.dataActionInfo}>
                        <Text style={styles.dataActionTitle}>Archivage automatique</Text>
                        <Text style={styles.dataActionDescription}>Archiver les données de plus de 6 mois</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#6B7280" />
                </TouchableOpacity>
            </View>

            {/* Bouton de réinitialisation */}
            <TouchableOpacity 
                style={styles.resetSettingsButton}
                onPress={() => Alert.alert(
                    'Réinitialiser les paramètres',
                    'Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?',
                    [
                        { text: 'Annuler', style: 'cancel' },
                        { text: 'Réinitialiser', style: 'destructive' }
                    ]
                )}
            >
                <Text style={styles.resetSettingsText}>Réinitialiser les paramètres</Text>
            </TouchableOpacity>
        </ScrollView>
    );

    // ========== RENDU PRINCIPAL ==========

    const renderMainContent = () => {
        switch(activeTab) {
            case 'dashboard':
                return renderDashboardTab();
            case 'drivers':
                return renderDriversTab();
            case 'rides':
                return renderRidesTab();
            case 'disputes':
                return renderDisputesTab();
            case 'pricing':
                return renderPricingTab();
            case 'settings':
                return renderSettingsTab();
            default:
                return renderDashboardTab();
        }
    };

    const renderBottomNavigation = () => (
        <View style={styles.bottomNavigation}>
            <TouchableOpacity 
                style={[
                    styles.navItem,
                    activeTab === 'dashboard' && styles.navItemActive
                ]}
                onPress={() => setActiveTab('dashboard')}
            >
                <Ionicons 
                    name={activeTab === 'dashboard' ? 'home' : 'home-outline'} 
                    size={24} 
                    color={activeTab === 'dashboard' ? '#1E3A8A' : '#6B7280'} 
                />
                <Text style={[
                    styles.navText,
                    activeTab === 'dashboard' && styles.navTextActive
                ]}>Tableau</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[
                    styles.navItem,
                    activeTab === 'drivers' && styles.navItemActive
                ]}
                onPress={() => setActiveTab('drivers')}
            >
                <Ionicons 
                    name={activeTab === 'drivers' ? 'people' : 'people-outline'} 
                    size={24} 
                    color={activeTab === 'drivers' ? '#1E3A8A' : '#6B7280'} 
                />
                <Text style={[
                    styles.navText,
                    activeTab === 'drivers' && styles.navTextActive
                ]}>Chauffeurs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[
                    styles.navItem,
                    activeTab === 'rides' && styles.navItemActive
                ]}
                onPress={() => setActiveTab('rides')}
            >
                <Ionicons 
                    name={activeTab === 'rides' ? 'car' : 'car-outline'} 
                    size={24} 
                    color={activeTab === 'rides' ? '#1E3A8A' : '#6B7280'} 
                />
                <Text style={[
                    styles.navText,
                    activeTab === 'rides' && styles.navTextActive
                ]}>Trajets</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[
                    styles.navItem,
                    activeTab === 'disputes' && styles.navItemActive
                ]}
                onPress={() => setActiveTab('disputes')}
            >
                <Ionicons 
                    name={activeTab === 'disputes' ? 'warning' : 'warning-outline'} 
                    size={24} 
                    color={activeTab === 'disputes' ? '#1E3A8A' : '#6B7280'} 
                />
                <Text style={[
                    styles.navText,
                    activeTab === 'disputes' && styles.navTextActive
                ]}>Litiges</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
                style={[
                    styles.navItem,
                    activeTab === 'settings' && styles.navItemActive
                ]}
                onPress={() => setActiveTab('settings')}
            >
                <Ionicons 
                    name={activeTab === 'settings' ? 'settings' : 'settings-outline'} 
                    size={24} 
                    color={activeTab === 'settings' ? '#1E3A8A' : '#6B7280'} 
                />
                <Text style={[
                    styles.navText,
                    activeTab === 'settings' && styles.navTextActive
                ]}>Paramètres</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#1E3A8A" />
            
            <Animated.View
                style={[
                    styles.contentContainer,
                    {
                        opacity: fadeAnim,
                        transform: [{
                            translateY: slideAnim.interpolate({
                                inputRange: [0, 1],
                                outputRange: [20, 0]
                            })
                        }]
                    }
                ]}
            >
                {/* Header */}
                {renderHeader()}
                
                {/* Main Content */}
                {renderMainContent()}
                
                {/* Bottom Navigation */}
                {renderBottomNavigation()}
            </Animated.View>
            
            {/* Modals */}
            {renderUserActionModal()}
            {renderDriverDetailsModal()}
            {renderDisputeModal()}
            {renderRideTrackingModal()}
        </SafeAreaView>
    );
}