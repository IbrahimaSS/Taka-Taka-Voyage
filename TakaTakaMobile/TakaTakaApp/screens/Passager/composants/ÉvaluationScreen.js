/**
 * ÉvaluationScreen - Écran de notation du chauffeur
 * Évaluation globale + détaillée + points forts + commentaire
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    TextInput,
    Modal,
    StyleSheet,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ÉvaluationScreen = ({ visible, onClose, onSubmit, rideData, darkMode = false }) => {
    const [overallRating, setOverallRating] = useState(5);
    const [detailedRatings, setDetailedRatings] = useState({
        driving: 5, punctuality: 5, cleanliness: 5, communication: 5,
    });
    const [selectedStrengths, setSelectedStrengths] = useState([]);
    const [comment, setComment] = useState('');

    const strengths = [
        { id: 'smooth_driving', label: 'Conduite fluide', icon: 'car-sport' },
        { id: 'clean_vehicle', label: 'Véhicule propre', icon: 'sparkles' },
        { id: 'punctual', label: 'Très ponctuel', icon: 'time' },
        { id: 'courteous', label: 'Service courtois', icon: 'heart' },
        { id: 'safe', label: 'Sécuritaire', icon: 'shield-checkmark' },
        { id: 'music', label: 'Bonne ambiance', icon: 'musical-notes' },
    ];

    const detailedCategories = [
        { key: 'driving', label: 'Conduite', icon: 'speedometer-outline' },
        { key: 'punctuality', label: 'Ponctualité', icon: 'time-outline' },
        { key: 'cleanliness', label: 'Propreté', icon: 'sparkles-outline' },
        { key: 'communication', label: 'Communication', icon: 'chatbubble-outline' },
    ];

    const handleStrengthToggle = (id) => {
        setSelectedStrengths(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleSubmit = () => {
        onSubmit({
            overallRating, detailedRatings,
            strengths: selectedStrengths, comment,
            driver: rideData?.driver || 'Mamadou Diallo',
        });
    };

    const getRatingText = (r) => {
        if (r === 5) return 'Excellent';
        if (r === 4) return 'Très bien';
        if (r === 3) return 'Bien';
        if (r === 2) return 'Correct';
        return 'Médiocre';
    };

    const getRatingColor = (r) => {
        if (r >= 4) return '#10B981';
        if (r === 3) return '#F59E0B';
        return '#EF4444';
    };

    const renderStars = (selected, onPress, size = 32) => (
        <View style={s.starsRow}>
            {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => onPress(star)} activeOpacity={0.7}>
                    <Ionicons
                        name={star <= selected ? 'star' : 'star-outline'}
                        size={size}
                        color={star <= selected ? '#FBBF24' : (darkMode ? '#4B5563' : '#D1D5DB')}
                        style={{ marginHorizontal: 2 }}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
            <View style={[s.container, darkMode && s.containerDark]}>
                {/* Header */}
                <LinearGradient
                    colors={['#3B82F6', '#2563EB']}
                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    style={s.header}
                >
                    <TouchableOpacity onPress={onClose} style={s.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>Évaluation</Text>
                    <View style={{ width: 40 }} />
                </LinearGradient>

                <ScrollView style={s.content} showsVerticalScrollIndicator={false}>
                    {/* Confirmation de paiement */}
                    <View style={s.paymentConfirm}>
                        <View style={s.paymentConfirmIcon}>
                            <Ionicons name="checkmark-circle" size={40} color="#10B981" />
                        </View>
                        <Text style={s.paymentConfirmTitle}>Paiement confirmé !</Text>
                        <Text style={[s.paymentConfirmSubtitle, darkMode && s.paymentConfirmSubtitleDark]}>
                            Votre paiement de 349 GNF a été effectué avec succès
                        </Text>
                    </View>

                    {/* Chauffeur card */}
                    <View style={[s.driverCard, darkMode && s.driverCardDark]}>
                        <View style={s.driverAvatar}>
                            <Text style={s.driverInitial}>M</Text>
                        </View>
                        <View style={s.driverInfo}>
                            <Text style={[s.driverName, darkMode && s.driverNameDark]}>{rideData?.driver || 'Mamadou Diallo'}</Text>
                            <Text style={[s.driverVehicle, darkMode && s.driverVehicleDark]}>Toyota Corolla · GK-1234</Text>
                        </View>
                    </View>

                    {/* Évaluation globale */}
                    <View style={[s.section, darkMode && s.sectionDark]}>
                        <Text style={[s.sectionTitle, darkMode && s.sectionTitleDark]}>Évaluez votre expérience</Text>
                        <Text style={[s.sectionSubtitle, darkMode && s.sectionSubtitleDark]}>Votre avis aide à améliorer notre service</Text>

                        <View style={s.overallRating}>
                            <Text style={[s.ratingTitle, darkMode && s.ratingTitleDark]}>Note globale</Text>
                            {renderStars(overallRating, setOverallRating, 38)}
                            <Text style={[s.ratingFeedback, { color: getRatingColor(overallRating) }]}>
                                {getRatingText(overallRating)}
                            </Text>
                        </View>
                    </View>

                    {/* Évaluation détaillée */}
                    <View style={[s.section, darkMode && s.sectionDark]}>
                        <Text style={[s.sectionTitle, darkMode && s.sectionTitleDark]}>Évaluation détaillée</Text>
                        {detailedCategories.map(cat => (
                            <View key={cat.key} style={s.detailItem}>
                                <View style={s.detailItemLeft}>
                                    <Ionicons name={cat.icon} size={18} color={darkMode ? "#94A3B8" : "#64748B"} />
                                    <Text style={[s.detailItemLabel, darkMode && s.detailItemLabelDark]}>{cat.label}</Text>
                                </View>
                                {renderStars(detailedRatings[cat.key], (v) => setDetailedRatings({ ...detailedRatings, [cat.key]: v }), 20)}
                            </View>
                        ))}
                    </View>

                    {/* Points forts */}
                    <View style={[s.section, darkMode && s.sectionDark]}>
                        <Text style={[s.sectionTitle, darkMode && s.sectionTitleDark]}>Points forts</Text>
                        <Text style={[s.sectionSubtitle, darkMode && s.sectionSubtitleDark]}>Sélectionnez ce qui vous a marqué</Text>
                        <View style={s.strengthsGrid}>
                            {strengths.map(str => {
                                const isSelected = selectedStrengths.includes(str.id);
                                return (
                                    <TouchableOpacity
                                        key={str.id}
                                        style={[
                                            s.strengthBtn,
                                            darkMode && s.strengthBtnDark,
                                            isSelected && (darkMode ? s.strengthBtnSelectedDark : s.strengthBtnSelected)
                                        ]}
                                        onPress={() => handleStrengthToggle(str.id)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name={str.icon} size={18} color={isSelected ? '#3B82F6' : (darkMode ? '#94A3B8' : '#64748B')} />
                                        <Text style={[
                                            s.strengthText,
                                            darkMode && s.strengthTextDark,
                                            isSelected && (darkMode ? s.strengthTextSelectedDark : s.strengthTextSelected)
                                        ]}>{str.label}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Commentaire */}
                    <View style={[s.section, darkMode && s.sectionDark]}>
                        <Text style={[s.sectionTitle, darkMode && s.sectionTitleDark]}>Commentaire (optionnel)</Text>
                        <TextInput
                            style={[s.commentInput, darkMode && s.commentInputDark]}
                            placeholder="Partagez votre expérience avec le chauffeur..."
                            placeholderTextColor={darkMode ? "#94A3B8" : "#94A3B8"}
                            value={comment}
                            onChangeText={setComment}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />
                    </View>

                    {/* Info */}
                    <View style={[s.infoBox, darkMode && s.infoBoxDark]}>
                        <Ionicons name="information-circle" size={20} color="#3B82F6" />
                        <Text style={[s.infoText, darkMode && s.infoTextDark]}>
                            Votre évaluation est anonyme et aide les autres passagers.
                        </Text>
                    </View>
                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* Footer */}
                <View style={[s.footer, darkMode && s.footerDark]}>
                    <TouchableOpacity style={[s.skipBtn, darkMode && s.skipBtnDark]} onPress={onClose}>
                        <Text style={[s.skipBtnText, darkMode && s.skipBtnTextDark]}>Passer</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} activeOpacity={0.85}>
                        <LinearGradient colors={['#3B82F6', '#2563EB']} style={s.submitBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Ionicons name="send" size={18} color="#FFFFFF" />
                            <Text style={s.submitBtnText}>Envoyer</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F8FAFC', paddingTop: Platform.OS === 'ios' ? 50 : 40 },
    containerDark: { backgroundColor: '#111827' },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingVertical: 18,
        borderBottomLeftRadius: 20, borderBottomRightRadius: 20,
    },
    backBtn: { padding: 8 },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF' },
    content: { flex: 1, paddingHorizontal: 20 },

    paymentConfirm: { alignItems: 'center', paddingVertical: 28 },
    paymentConfirmIcon: { marginBottom: 12 },
    paymentConfirmTitle: { fontSize: 22, fontWeight: 'bold', color: '#10B981', marginBottom: 6 },
    paymentConfirmSubtitle: { fontSize: 15, color: '#64748B', textAlign: 'center' },
    paymentConfirmSubtitleDark: { color: '#94A3B8' },

    driverCard: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderRadius: 16, padding: 16, marginBottom: 16,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    driverCardDark: { backgroundColor: '#1F2937', shadowColor: '#000' },
    driverAvatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#3B82F6', justifyContent: 'center', alignItems: 'center', marginRight: 14 },
    driverInitial: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF' },
    driverInfo: { flex: 1 },
    driverName: { fontSize: 17, fontWeight: '700', color: '#1E293B', marginBottom: 3 },
    driverNameDark: { color: '#F9FAFB' },
    driverVehicle: { fontSize: 14, color: '#64748B' },
    driverVehicleDark: { color: '#94A3B8' },

    section: {
        backgroundColor: '#FFFFFF', borderRadius: 18, padding: 20, marginBottom: 14,
        shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
    },
    sectionDark: { backgroundColor: '#1F2937', shadowColor: '#000' },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
    sectionTitleDark: { color: '#F9FAFB' },
    sectionSubtitle: { fontSize: 14, color: '#64748B', marginBottom: 16 },
    sectionSubtitleDark: { color: '#94A3B8' },

    overallRating: { alignItems: 'center', paddingVertical: 12 },
    ratingTitle: { fontSize: 15, fontWeight: '500', color: '#475569', marginBottom: 12 },
    ratingTitleDark: { color: '#94A3B8' },
    starsRow: { flexDirection: 'row', alignItems: 'center' },
    ratingFeedback: { fontSize: 16, fontWeight: '700', marginTop: 10 },

    detailItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
    detailItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    detailItemLabel: { fontSize: 15, color: '#475569', fontWeight: '500' },
    detailItemLabelDark: { color: '#94A3B8' },

    strengthsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    strengthBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 6,
        backgroundColor: '#F1F5F9', paddingHorizontal: 14, paddingVertical: 10,
        borderRadius: 24, borderWidth: 1.5, borderColor: '#E2E8F0',
    },
    strengthBtnDark: { backgroundColor: '#374151', borderColor: '#4B5563' },
    strengthBtnSelected: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
    strengthBtnSelectedDark: { backgroundColor: '#1E3A8A40', borderColor: '#3B82F6' },
    strengthText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    strengthTextDark: { color: '#94A3B8' },
    strengthTextSelected: { color: '#3B82F6', fontWeight: '600' },
    strengthTextSelectedDark: { color: '#60A5FA', fontWeight: '600' },

    commentInput: {
        backgroundColor: '#F8FAFC', borderRadius: 14, padding: 16,
        borderWidth: 1, borderColor: '#E2E8F0', fontSize: 15, color: '#1E293B',
        minHeight: 100, textAlignVertical: 'top',
    },
    commentInputDark: { backgroundColor: '#374151', borderColor: '#4B5563', color: '#F9FAFB' },

    infoBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#EFF6FF', borderRadius: 14, padding: 16, marginBottom: 20 },
    infoBoxDark: { backgroundColor: '#1E3A8A20' },
    infoText: { flex: 1, fontSize: 14, color: '#1E40AF', marginLeft: 12, lineHeight: 20 },
    infoTextDark: { color: '#60A5FA' },

    footer: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#FFFFFF',
        borderTopWidth: 1, borderTopColor: '#F1F5F9',
        paddingBottom: Platform.OS === 'ios' ? 30 : 16,
    },
    footerDark: { backgroundColor: '#111827', borderTopColor: '#1F2937' },
    skipBtn: {
        flex: 1, paddingVertical: 14, borderRadius: 12,
        backgroundColor: '#F1F5F9', alignItems: 'center',
    },
    skipBtnDark: { backgroundColor: '#374151' },
    skipBtnText: { fontSize: 15, color: '#64748B', fontWeight: '600' },
    skipBtnTextDark: { color: '#94A3B8' },
    submitBtn: { flex: 2, borderRadius: 12, overflow: 'hidden' },
    submitBtnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, gap: 8 },
    submitBtnText: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF' },
});

export default ÉvaluationScreen;