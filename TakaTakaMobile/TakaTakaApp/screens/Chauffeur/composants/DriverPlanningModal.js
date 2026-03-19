import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    ScrollView,
    FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DriverPlanningModal = ({ visible, onClose, plannings, onPlanningDetails, onAddSlot, theme, darkMode }) => {
    // Générer les 7 prochains jours
    const calendarDays = React.useMemo(() => {
        const days = [{ day: 'Tout', date: 'all' }];
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(now.getDate() + i);
            days.push({
                day: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                date: d.getDate().toString(),
                fullDate: d.toDateString()
            });
        }
        return days;
    }, []);

    const [selectedDate, setSelectedDate] = React.useState('all');

    const filteredPlannings = React.useMemo(() => {
        if (selectedDate === 'all') return plannings;
        return plannings.filter(p => {
            // On vérifie si le numéro du jour correspond (attention au format "13 Mars")
            const dayNum = p.date.match(/\d+/);
            return dayNum && dayNum[0] === selectedDate;
        });
    }, [plannings, selectedDate]);

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={s.overlay}>
                <View style={[s.container, { backgroundColor: theme.background }]}>
                    <View style={[s.header, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderBottomColor: theme.border }]}>
                        <Text style={[s.title, { color: theme.text }]}>Mon Planning</Text>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <View style={s.content}>
                        {/* Calendrier Horizontal */}
                        <View style={s.calendarContainer}>
                            <FlatList
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                data={calendarDays}
                                renderItem={({ item }) => {
                                    const isActive = selectedDate === item.date;
                                    return (
                                        <TouchableOpacity
                                            onPress={() => setSelectedDate(item.date)}
                                            style={[s.dateItem, isActive && { backgroundColor: theme.primary }]}
                                        >
                                            <Text style={[s.dateDay, { color: isActive ? 'white' : theme.textSecondary, textTransform: 'capitalize' }]}>{item.day}</Text>
                                            {item.date !== 'all' && (
                                                <Text style={[s.dateNum, { color: isActive ? 'white' : theme.text }]}>{item.date}</Text>
                                            )}
                                        </TouchableOpacity>
                                    );
                                }}
                                keyExtractor={(item, index) => index.toString()}
                            />
                        </View>

                        <FlatList
                            data={filteredPlannings}
                            keyExtractor={item => item.id.toString()}
                            ListEmptyComponent={() => (
                                <View style={s.emptyState}>
                                    <Ionicons name="calendar-outline" size={60} color={theme.textSecondary} opacity={0.3} />
                                    <Text style={[s.emptyText, { color: theme.textSecondary }]}>Aucun planning pour cette sélection</Text>
                                </View>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[s.planningCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                                    onPress={() => onPlanningDetails(item)}
                                >
                                    <View style={s.planningTime}>
                                        <Text style={[s.timeText, { color: theme.primary }]}>{item.time}</Text>
                                        <Text style={[s.dateText, { color: theme.textSecondary }]}>{item.date}</Text>
                                    </View>
                                    <View style={s.planningInfo}>
                                        <Text style={[s.passengerName, { color: theme.text }]}>{item.passengerName}</Text>
                                        <View style={s.routeRow}>
                                            <Ionicons name="location" size={14} color={theme.primary} />
                                            <Text style={[s.routeText, { color: theme.textSecondary }]} numberOfLines={1}>{item.pickup}</Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    <View style={s.footer}>
                        <TouchableOpacity style={[s.addBtn, { backgroundColor: theme.primary }]} onPress={onAddSlot}>
                            <Ionicons name="add" size={20} color="white" />
                            <Text style={s.addBtnText}>Ajouter un créneau</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    container: { height: '80%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
    title: { fontSize: 20, fontWeight: 'bold' },
    closeBtn: { padding: 5 },
    content: { flex: 1, padding: 20 },
    calendarContainer: { marginBottom: 25, paddingVertical: 10 },
    dateItem: { width: 50, height: 70, justifyContent: 'center', alignItems: 'center', borderRadius: 15, marginRight: 15, backgroundColor: 'rgba(0,0,0,0.02)' },
    dateDay: { fontSize: 12, marginBottom: 5 },
    dateNum: { fontSize: 18, fontWeight: 'bold' },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    emptyText: { marginTop: 10, fontSize: 16 },
    planningCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
    planningTime: { width: 80, borderRightWidth: 1, borderRightColor: 'rgba(0,0,0,0.05)', marginRight: 15 },
    timeText: { fontSize: 16, fontWeight: 'bold' },
    dateText: { fontSize: 11 },
    planningInfo: { flex: 1 },
    passengerName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    routeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    routeText: { fontSize: 12 },
    footer: { padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, gap: 8 },
    addBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default DriverPlanningModal;
