/**
 * NotificationModal - Centre de notifications
 * Affiche les notifications avec catégorisation et actions
 */
import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    Modal,
    StyleSheet,
    Platform,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const NotificationModal = ({ visible, onClose, darkMode = false }) => {
    const notifications = [
        { id: 1, title: 'Trajet confirmé', message: 'Votre chauffeur Mamadou est en route.', time: 'Il y a 2 min', icon: 'car', color: '#3B82F6', read: false },
        { id: 2, title: 'Promotion spéciale', message: '-20% sur votre prochain trajet avec le code TAKA20 !', time: 'Il y a 1h', icon: 'gift', color: '#8B5CF6', read: false },
        { id: 3, title: 'Paiement reçu', message: 'Votre paiement de 25 000 GNF a été confirmé.', time: 'Il y a 3h', icon: 'card', color: '#10B981', read: true },
        { id: 4, title: 'Nouveau service', message: 'Les courses partagées sont maintenant disponibles !', time: 'Hier', icon: 'people', color: '#F59E0B', read: true },
        { id: 5, title: 'Mise à jour', message: 'Nouvelle version de TakaTaka disponible.', time: 'Hier', icon: 'download', color: '#6366F1', read: true },
    ];

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
            <View style={s.overlay}>
                <TouchableOpacity style={s.backdrop} activeOpacity={1} onPress={onClose} />
                <View style={[s.content, darkMode && s.contentDark]}>
                    {/* Header */}
                    <View style={[s.header, darkMode && s.headerDark]}>
                        <View style={[s.handleBar, darkMode && s.handleBarDark]} />
                        <View style={s.headerRow}>
                            <View>
                                <Text style={[s.title, darkMode && s.titleDark]}>Notifications</Text>
                                <Text style={[s.subtitle, darkMode && s.subtitleDark]}>
                                    {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
                                </Text>
                            </View>
                            <TouchableOpacity onPress={onClose} style={[s.closeBtn, darkMode && s.closeBtnDark]}>
                                <Ionicons name="close" size={22} color={darkMode ? "#94A3B8" : "#64748B"} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Notifications list */}
                    <ScrollView style={s.list} showsVerticalScrollIndicator={false}>
                        {notifications.map(notif => (
                            <TouchableOpacity
                                key={notif.id}
                                style={[
                                    s.notifItem,
                                    darkMode && s.notifItemDark,
                                    !notif.read && (darkMode ? s.notifItemUnreadDark : s.notifItemUnread)
                                ]}
                                activeOpacity={0.7}
                            >
                                {!notif.read && <View style={[s.unreadDot, darkMode && s.unreadDotDark]} />}
                                <View style={[s.notifIcon, { backgroundColor: `${notif.color}15` }]}>
                                    <Ionicons name={notif.icon} size={20} color={notif.color} />
                                </View>
                                <View style={s.notifContent}>
                                    <View style={s.notifRow}>
                                        <Text style={[
                                            s.notifTitle,
                                            darkMode && s.notifTitleDark,
                                            !notif.read && (darkMode ? s.notifTitleBoldDark : s.notifTitleBold)
                                        ]}>{notif.title}</Text>
                                        <Text style={s.notifTime}>{notif.time}</Text>
                                    </View>
                                    <Text style={[s.notifMessage, darkMode && s.notifMessageDark]}>{notif.message}</Text>
                                </View>
                                <Ionicons name="chevron-forward" size={16} color={darkMode ? "#4B5563" : "#CBD5E1"} />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Footer */}
                    <View style={[s.footer, darkMode && s.footerDark]}>
                        <TouchableOpacity
                            style={[s.footerBtn, darkMode && s.footerBtnDark]}
                            onPress={() => Alert.alert('Marqué', 'Tout marqué comme lu')}
                        >
                            <Ionicons name="checkmark-done" size={18} color={darkMode ? "#94A3B8" : "#64748B"} />
                            <Text style={[s.footerBtnText, darkMode && s.footerBtnTextDark]}>Tout marquer comme lu</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[s.footerBtn, darkMode && s.footerBtnDark]}
                            onPress={() => Alert.alert('Paramètres', 'Fonctionnalité à venir')}
                        >
                            <Ionicons name="settings-outline" size={18} color={darkMode ? "#94A3B8" : "#64748B"} />
                            <Text style={[s.footerBtnText, darkMode && s.footerBtnTextDark]}>Paramètres</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    backdrop: { flex: 1 },
    content: {
        backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
        height: '85%', paddingBottom: Platform.OS === 'ios' ? 30 : 20,
    },
    contentDark: { backgroundColor: '#111827' },
    header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
    headerDark: { borderBottomColor: '#1F2937' },
    handleBar: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB', alignSelf: 'center', marginBottom: 16 },
    handleBarDark: { backgroundColor: '#374151' },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
    titleDark: { color: '#F9FAFB' },
    subtitle: { fontSize: 14, color: '#64748B', marginTop: 2 },
    subtitleDark: { color: '#94A3B8' },
    closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center' },
    closeBtnDark: { backgroundColor: '#1F2937' },

    list: { flex: 1, paddingHorizontal: 20, paddingTop: 12 },
    notifItem: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
        borderRadius: 14, padding: 14, marginBottom: 10,
        borderWidth: 1, borderColor: '#F1F5F9', position: 'relative',
    },
    notifItemDark: { backgroundColor: '#1F2937', borderColor: '#374151' },
    notifItemUnread: { backgroundColor: '#F8FAFC', borderColor: '#E2E8F0' },
    notifItemUnreadDark: { backgroundColor: '#1E3A8A20', borderColor: '#1E40AF40' },
    unreadDot: { position: 'absolute', top: 14, left: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#3B82F6' },
    unreadDotDark: { backgroundColor: '#60A5FA' },
    notifIcon: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    notifContent: { flex: 1 },
    notifRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
    notifTitle: { fontSize: 15, fontWeight: '500', color: '#1E293B', flex: 1, marginRight: 10 },
    notifTitleDark: { color: '#F9FAFB' },
    notifTitleBold: { fontWeight: '700' },
    notifTitleBoldDark: { fontWeight: '700', color: '#F9FAFB' },
    notifTime: { fontSize: 12, color: '#94A3B8' },
    notifMessage: { fontSize: 13, color: '#64748B', lineHeight: 18 },
    notifMessageDark: { color: '#94A3B8' },

    footer: {
        flexDirection: 'row', justifyContent: 'space-between',
        paddingHorizontal: 20, paddingTop: 14,
        borderTopWidth: 1, borderTopColor: '#F1F5F9',
    },
    footerDark: { borderTopColor: '#1F2937' },
    footerBtn: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 10, paddingHorizontal: 14,
        backgroundColor: '#F8FAFC', borderRadius: 10, gap: 6,
    },
    footerBtnDark: { backgroundColor: '#1F2937' },
    footerBtnText: { fontSize: 13, color: '#64748B', fontWeight: '500' },
    footerBtnTextDark: { color: '#94A3B8' },
});

export default NotificationModal;