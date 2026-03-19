import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    StyleSheet,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const AddPlanningSlotModal = ({ visible, onClose, onSave, theme, darkMode }) => {
    const [date, setDate] = useState(new Date().getDate().toString());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState('08:00');
    const [pickup, setPickup] = useState('');
    const [destination, setDestination] = useState('');
    const [note, setNote] = useState('');
    const [showTimePicker, setShowTimePicker] = useState(false);

    // Liste d'heures courantes pour sélection rapide
    const timeSlots = React.useMemo(() => {
        const slots = [];
        for (let h = 6; h <= 22; h++) {
            const hour = h < 10 ? `0${h}` : `${h}`;
            slots.push(`${hour}:00`);
            slots.push(`${hour}:15`);
            slots.push(`${hour}:30`);
            slots.push(`${hour}:45`);
        }
        return slots;
    }, []);

    // Générer les 7 prochains jours pour le choix
    const dateOptions = React.useMemo(() => {
        const days = [];
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(now.getDate() + i);
            days.push({
                day: d.toLocaleDateString('fr-FR', { weekday: 'short' }),
                date: d.getDate().toString(),
                month: d.toLocaleDateString('fr-FR', { month: 'short' }),
                fullDate: d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
                isToday: i === 0,
                isTomorrow: i === 1
            });
        }
        return days;
    }, []);

    const selectedDateObj = dateOptions.find(d => d.date === date) || dateOptions[0];

    const handleSave = () => {
        if (!pickup || !time) return;

        let dateLabel = selectedDateObj.fullDate;
        if (selectedDateObj.isToday) dateLabel = "Aujourd'hui";
        if (selectedDateObj.isTomorrow) dateLabel = `Demain, ${selectedDateObj.fullDate}`;

        onSave({
            id: Date.now(),
            passengerName: 'Libre (Créneau ouvert)',
            date: dateLabel,
            time,
            pickup,
            destination: destination || 'À définir',
            price: 'À négocier',
            status: 'scheduled',
            isCustom: true // Pour différencier d'une vraie réservation
        });

        setPickup('');
        setDestination('');
        setNote('');
        onClose();
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={s.overlay}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    style={{ width: '100%' }}
                >
                    <View style={[s.container, { backgroundColor: theme.background }]}>
                        <View style={[s.header, { backgroundColor: darkMode ? '#1F2937' : '#F9FAFB', borderBottomColor: theme.border }]}>
                            <Text style={[s.title, { color: theme.text }]}>Nouveau Créneau</Text>
                            <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
                            
                            <Text style={[s.label, { color: theme.textSecondary }]}>Date du créneau</Text>
                            <TouchableOpacity 
                                style={[s.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Ionicons name="calendar-outline" size={20} color={theme.primary} />
                                <View style={{ flex: 1, marginLeft: 10 }}>
                                    <Text style={[s.inputText, { color: theme.text }]}>
                                        {selectedDateObj.isToday ? "Aujourd'hui" : selectedDateObj.isTomorrow ? "Demain" : `${selectedDateObj.day} ${selectedDateObj.fullDate}`}
                                    </Text>
                                </View>
                                <Ionicons name="chevron-down" size={20} color={theme.textSecondary} />
                            </TouchableOpacity>

                            <Text style={[s.label, { color: theme.textSecondary }]}>Heure du rendez-vous</Text>
                            <View style={[s.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="time-outline" size={20} color={theme.primary} />
                                <TextInput
                                    style={[s.input, { color: theme.text }]}
                                    value={time}
                                    onChangeText={setTime}
                                    placeholder="Ex: 09:15"
                                    keyboardType="numbers-and-punctuation"
                                    placeholderTextColor={theme.textSecondary}
                                />
                                <TouchableOpacity
                                    onPress={() => setShowTimePicker(true)}
                                    style={s.pickerTrigger}
                                >
                                    <Ionicons name="alarm-outline" size={22} color={theme.primary} />
                                </TouchableOpacity>
                            </View>

                            <Text style={[s.label, { color: theme.textSecondary }]}>Lieu de départ</Text>
                            <View style={[s.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="location-outline" size={20} color={theme.primary} />
                                <TextInput
                                    style={[s.input, { color: theme.text }]}
                                    value={pickup}
                                    onChangeText={setPickup}
                                    placeholder="Où commence la course ?"
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <Text style={[s.label, { color: theme.textSecondary }]}>Destination (Optionnel)</Text>
                            <View style={[s.inputWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <Ionicons name="flag-outline" size={20} color="#EF4444" />
                                <TextInput
                                    style={[s.input, { color: theme.text }]}
                                    value={destination}
                                    onChangeText={setDestination}
                                    placeholder="Où allez-vous ?"
                                    placeholderTextColor={theme.textSecondary}
                                />
                            </View>

                            <Text style={[s.label, { color: theme.textSecondary }]}>Notes particulières</Text>
                            <View style={[s.inputWrapper, s.textAreaWrapper, { backgroundColor: theme.card, borderColor: theme.border }]}>
                                <TextInput
                                    style={[s.input, s.textArea, { color: theme.text }]}
                                    value={note}
                                    onChangeText={setNote}
                                    placeholder="Détails supplémentaires..."
                                    placeholderTextColor={theme.textSecondary}
                                    multiline
                                    numberOfLines={3}
                                />
                            </View>

                            <View style={s.infoBox}>
                                <Ionicons name="information-circle-outline" size={18} color={theme.textSecondary} />
                                <Text style={[s.infoText, { color: theme.textSecondary }]}>
                                    Ce créneau sera affiché dans votre planning pour vous aider à organiser votre journée.
                                </Text>
                            </View>
                        </ScrollView>

                        {/* Modal de sélection de date */}
                        <Modal visible={showDatePicker} transparent animationType="fade">
                            <TouchableOpacity 
                                style={s.pickerOverlay} 
                                activeOpacity={1} 
                                onPress={() => setShowDatePicker(false)}
                            >
                                <View style={[s.datePickerContainer, { backgroundColor: theme.card }]}>
                                    <Text style={[s.pickerTitle, { color: theme.text }]}>Choisir une date</Text>
                                    <View style={s.dateGrid}>
                                        {dateOptions.map(item => (
                                            <TouchableOpacity
                                                key={item.date}
                                                style={[s.dateOptionItem, date === item.date && { backgroundColor: theme.primary }]}
                                                onPress={() => {
                                                    setDate(item.date);
                                                    setShowDatePicker(false);
                                                }}
                                            >
                                                <Text style={[s.dateOptionDay, { color: date === item.date ? 'white' : theme.textSecondary }]}>{item.day}</Text>
                                                <Text style={[s.dateOptionNum, { color: date === item.date ? 'white' : theme.text }]}>{item.date}</Text>
                                                <Text style={[s.dateOptionMonth, { color: date === item.date ? 'white' : theme.textSecondary }]}>{item.month}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        </Modal>

                        <View style={s.footer}>
                            <TouchableOpacity style={[s.cancelBtn, { borderColor: theme.border }]} onPress={onClose}>
                                <Text style={[s.cancelBtnText, { color: theme.textSecondary }]}>Annuler</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={s.saveBtn} onPress={handleSave}>
                                <LinearGradient colors={theme.gradientPrimary} style={s.saveBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                                    <Text style={s.saveBtnText}>Enregistrer le créneau</Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>

                {/* Sub-modal pour le choix de l'heure */}
                <Modal visible={showTimePicker} transparent animationType="fade">
                    <TouchableOpacity
                        style={s.pickerOverlay}
                        activeOpacity={1}
                        onPress={() => setShowTimePicker(false)}
                    >
                        <View style={[s.pickerContainer, { backgroundColor: theme.card }]}>
                            <Text style={[s.pickerTitle, { color: theme.text }]}>Sélectionner une heure</Text>
                            <ScrollView contentContainerStyle={s.timeGrid}>
                                {timeSlots.map(slot => (
                                    <TouchableOpacity
                                        key={slot}
                                        style={[s.timeItem, time === slot && { backgroundColor: theme.primary }]}
                                        onPress={() => {
                                            setTime(slot);
                                            setShowTimePicker(false);
                                        }}
                                    >
                                        <Text style={[s.timeText, { color: time === slot ? 'white' : theme.text }]}>{slot}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 20 },
    container: { borderRadius: 30, overflow: 'hidden', maxHeight: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 15 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
    title: { fontSize: 20, fontWeight: 'bold' },
    closeBtn: { padding: 5 },
    content: { padding: 20 },
    label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
    inputWrapper: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 15, height: 55, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
    input: { flex: 1, marginLeft: 10, fontSize: 16 },
    inputText: { fontSize: 16, fontWeight: '600' },
    textAreaWrapper: { height: 100, alignItems: 'flex-start', paddingVertical: 12 },
    textArea: { height: '100%', textAlignVertical: 'top' },
    infoBox: { flexDirection: 'row', gap: 10, paddingHorizontal: 10, marginBottom: 20 },
    infoText: { fontSize: 12, flex: 1, lineHeight: 18 },
    footer: { flexDirection: 'row', padding: 20, gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 15, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
    cancelBtnText: { fontWeight: 'bold' },
    saveBtn: { flex: 2, borderRadius: 15, overflow: 'hidden' },
    saveBtnGradient: { paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    pickerTrigger: { padding: 5, marginLeft: 10 },
    // Styles Picker
    pickerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    pickerContainer: { width: '85%', maxHeight: '60%', borderRadius: 25, padding: 20 },
    pickerTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    datePickerContainer: { width: '90%', borderRadius: 25, padding: 20 },
    dateGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
    dateOptionItem: { width: '30%', height: 80, justifyContent: 'center', alignItems: 'center', borderRadius: 15, backgroundColor: 'rgba(0,0,0,0.03)' },
    dateOptionDay: { fontSize: 11, marginBottom: 2, textTransform: 'capitalize' },
    dateOptionNum: { fontSize: 18, fontWeight: 'bold' },
    dateOptionMonth: { fontSize: 10, marginTop: 2 },
    timeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    timeItem: { width: '22%', paddingVertical: 12, margin: '1%', borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.03)' },
    timeText: { fontSize: 14, fontWeight: '600' }
});

export default AddPlanningSlotModal;
