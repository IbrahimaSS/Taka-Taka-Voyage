import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    SafeAreaView,
    ActivityIndicator,
    Image,
    Modal,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext';
import { apiClient } from '../../services/apiClient';

const { width } = Dimensions.get('window');

export default function TicketsScreen({ navigation }) {
    const { theme, darkMode } = useApp();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const res = await apiClient('/tickets/mes-tickets'); 
            if (res && res.succes) {
                const formatted = res.data.map(t => ({
                    id: t._id,
                    date: new Date(t.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }),
                    time: new Date(t.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    pickup: t.depart?.adresse || 'Position actuelle',
                    destination: t.destination?.adresse || 'Destination',
                    price: `${t.prix ? t.prix.toLocaleString() : 0} GNF`,
                    status: t.statut.toLowerCase(), // GENERE, VALIDE, EXPIRE
                    qrData: t.codeUnique,
                    qrImage: t.qrCodeBase64
                }));
                setTickets(formatted);
            }
        } catch (error) {
            console.error('Fetch tickets error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return '#10B981';
            case 'cancelled': return '#EF4444';
            case 'accepted': return '#3B82F6';
            case 'en_route': return '#F59E0B';
            default: return '#9CA3AF';
        }
    };

    const renderTicket = ({ item }) => (
        <TouchableOpacity 
            style={[s.ticketCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={() => setSelectedTicket(item)}
        >
            <View style={s.ticketLeft}>
                <View style={[s.iconBg, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Ionicons name="qr-code" size={24} color={getStatusColor(item.status)} />
                </View>
            </View>
            <View style={s.ticketRight}>
                <View style={s.ticketHeader}>
                    <Text style={[s.ticketDate, { color: theme.textSecondary }]}>{item.date} • {item.time}</Text>
                    <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
                        <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>{item.status.toUpperCase()}</Text>
                    </View>
                </View>
                <Text style={[s.location, { color: theme.text }]} numberOfLines={1}>De: {item.pickup}</Text>
                <Text style={[s.location, { color: theme.text }]} numberOfLines={1}>À: {item.destination}</Text>
                <Text style={[s.price, { color: theme.primary }]}>{item.price}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" style={s.chevron} />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={[s.container, { backgroundColor: theme.background }]}>
            <View style={[s.header, { borderBottomColor: theme.border }]}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[s.title, { color: theme.text }]}>Mes Tickets</Text>
                <View style={{ width: 40 }} />
            </View>

            {loading ? (
                <View style={s.center}>
                    <ActivityIndicator size="large" color={theme.primary} />
                </View>
            ) : (
                <FlatList
                    data={tickets}
                    renderItem={renderTicket}
                    keyExtractor={item => item.id}
                    contentContainerStyle={s.list}
                    ListEmptyComponent={
                        <View style={s.empty}>
                            <Ionicons name="receipt-outline" size={64} color={theme.textSecondary} />
                            <Text style={[s.emptyText, { color: theme.textSecondary }]}>Aucun ticket trouvé</Text>
                        </View>
                    }
                />
            )}

            {/* Modal pour afficher le QR Code */}
            <Modal visible={!!selectedTicket} transparent animationType="fade">
                <TouchableOpacity 
                    style={s.modalOverlay} 
                    activeOpacity={1} 
                    onPress={() => setSelectedTicket(null)}
                >
                    <View style={[s.modalContent, { backgroundColor: theme.card }]}>
                        <TouchableOpacity style={s.closeBtn} onPress={() => setSelectedTicket(null)}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                        
                        <Text style={[s.modalTitle, { color: theme.text }]}>Ticket de voyage</Text>
                        <Text style={[s.modalSubtitle, { color: theme.textSecondary }]}>Présentez ce code au chauffeur</Text>

                        <View style={s.qrContainer}>
                            <Image 
                                source={{ uri: selectedTicket?.qrImage || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedTicket?.qrData}` }} 
                                style={s.qrImage}
                            />
                        </View>

                        <View style={s.detailsBox}>
                            <View style={s.detailRow}>
                                <Text style={[s.detailLabel, { color: theme.textSecondary }]}>Référence</Text>
                                <Text style={[s.detailVal, { color: theme.text }]}>{selectedTicket?.id.substring(0, 8).toUpperCase()}</Text>
                            </View>
                            <View style={s.detailRow}>
                                <Text style={[s.detailLabel, { color: theme.textSecondary }]}>Montant</Text>
                                <Text style={[s.detailVal, { color: theme.primary }]}>{selectedTicket?.price}</Text>
                            </View>
                            <View style={s.detailRow}>
                                <Text style={[s.detailLabel, { color: theme.textSecondary }]}>Départ</Text>
                                <Text style={[s.detailVal, { color: theme.text }]} numberOfLines={1}>{selectedTicket?.pickup}</Text>
                            </View>
                        </View>

                        <TouchableOpacity 
                            style={[s.mainBtn, { backgroundColor: theme.primary }]} 
                            onPress={() => setSelectedTicket(null)}
                        >
                            <Text style={s.mainBtnText}>Fermer</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const s = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: { padding: 8 },
    title: { fontSize: 18, fontWeight: 'bold' },
    list: { padding: 16 },
    ticketCard: {
        flexDirection: 'row',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        alignItems: 'center',
    },
    ticketLeft: { marginRight: 15 },
    iconBg: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ticketRight: { flex: 1 },
    ticketHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    ticketDate: { fontSize: 11, fontWeight: '500' },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: { fontSize: 9, fontWeight: 'bold' },
    location: { fontSize: 13, fontWeight: '500', marginBottom: 2 },
    price: { fontSize: 14, fontWeight: 'bold', marginTop: 4 },
    chevron: { marginLeft: 10 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    empty: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16 },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: width * 0.85,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    closeBtn: { alignSelf: 'flex-end', padding: 5 },
    modalTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 10 },
    modalSubtitle: { fontSize: 14, marginBottom: 25 },
    qrContainer: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 20,
        marginBottom: 25,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    qrImage: { width: 180, height: 180 },
    detailsBox: { width: '100%', marginBottom: 25, gap: 12 },
    detailRow: { flexDirection: 'row', justifyContent: 'space-between' },
    detailLabel: { fontSize: 13 },
    detailVal: { fontSize: 13, fontWeight: 'bold', flex: 1, textAlign: 'right', marginLeft: 15 },
    mainBtn: { width: '100%', paddingVertical: 14, borderRadius: 14, alignItems: 'center' },
    mainBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});
