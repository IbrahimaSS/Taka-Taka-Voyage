import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    ScrollView,
    StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const DriverNotificationsModal = ({ visible, onClose, notifications, onNotificationPress, markAllAsRead, darkMode, theme }) => {
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
                        <Text style={[s.title, { color: theme.text }]}>Notifications</Text>
                        <TouchableOpacity onPress={onClose} style={s.closeBtn}>
                            <Ionicons name="close" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={s.list}>
                        {notifications.length > 0 ? (
                            notifications.map((notif, index) => (
                                <TouchableOpacity
                                    key={notif.id + '-' + index}
                                    style={[
                                        s.item,
                                        !notif.read && (darkMode ? { backgroundColor: 'rgba(59, 130, 246, 0.15)' } : s.itemUnread),
                                        { borderBottomColor: theme.border }
                                    ]}
                                    onPress={() => onNotificationPress(notif)}
                                >
                                    <View style={[s.iconBox, { backgroundColor: darkMode ? '#374151' : '#F3F4F6' }]}>
                                        {notif.type === 'ride' && <Ionicons name="car" size={24} color={theme.primary} />}
                                        {notif.type === 'payment' && <Ionicons name="cash" size={24} color="#10B981" />}
                                        {notif.type === 'account' && <Ionicons name="document-text" size={24} color="#F59E0B" />}
                                        {notif.type === 'system' && <Ionicons name="information-circle" size={24} color="#8B5CF6" />}
                                    </View>
                                    <View style={s.content}>
                                        <Text style={[s.notifTitle, { color: theme.text }]}>{notif.title}</Text>
                                        <Text style={[s.message, { color: theme.textSecondary }]}>{notif.message}</Text>
                                        <Text style={[s.time, { color: theme.textSecondary }]}>{notif.time}</Text>
                                    </View>
                                    {!notif.read && <View style={s.unreadDot} />}
                                </TouchableOpacity>
                            ))
                        ) : (
                            <View style={s.emptyState}>
                                <Ionicons name="notifications-off-outline" size={48} color={theme.textSecondary} />
                                <Text style={[s.emptyText, { color: theme.textSecondary }]}>Aucune notification</Text>
                            </View>
                        )}
                    </ScrollView>

                    <View style={[s.footer, { borderTopColor: theme.border }]}>
                        <TouchableOpacity style={s.markBtn} onPress={markAllAsRead}>
                            <Text style={[s.markText, { color: theme.primary }]}>Tout marquer comme lu</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    container: { height: '80%', borderTopLeftRadius: 25, borderTopRightRadius: 25, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
    title: { fontSize: 20, fontWeight: 'bold' },
    closeBtn: { padding: 4 },
    list: { flex: 1 },
    item: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, alignItems: 'center' },
    itemUnread: { backgroundColor: '#EFF6FF' },
    iconBox: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    content: { flex: 1 },
    notifTitle: { fontSize: 15, fontWeight: 'bold', marginBottom: 2 },
    message: { fontSize: 13, lineHeight: 18 },
    time: { fontSize: 11, marginTop: 4, opacity: 0.7 },
    unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#3B82F6', marginLeft: 8 },
    footer: { padding: 16, alignItems: 'center', borderTopWidth: 1 },
    markBtn: { padding: 10 },
    markText: { fontWeight: '600', fontSize: 14 },
    emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
    emptyText: { marginTop: 12, fontSize: 16 },
});

export default DriverNotificationsModal;
