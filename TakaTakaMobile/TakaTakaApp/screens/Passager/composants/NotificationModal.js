import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiClient } from '../../../services/apiClient';

export default function NotificationModal({ visible, onClose, darkMode }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (visible) {
            fetchNotifications();
        }
    }, [visible]);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await apiClient('/passager/notifications');
            if (res.succes) {
                setNotifications(res.donnees);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'SUCCESS': return { name: 'checkmark-circle', color: '#10B981' };
            case 'WARNING': return { name: 'warning', color: '#F59E0B' };
            case 'ERROR': return { name: 'alert-circle', color: '#EF4444' };
            default: return { name: 'notifications', color: '#3B82F6' };
        }
    };

    const renderItem = ({ item }) => {
        const icon = getIcon(item.type);
        return (
            <View style={[styles.notificationItem, { borderBottomColor: darkMode ? '#374151' : '#F3F4F6' }]}>
                <View style={[styles.iconContainer, { backgroundColor: icon.color + '20' }]}>
                    <Ionicons name={icon.name} size={22} color={icon.color} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.message, { color: darkMode ? '#F9FAFB' : '#1F2937' }]}>
                        {item.message}
                    </Text>
                    <Text style={styles.time}>
                        {new Date(item.createdAt).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                </View>
                {!item.lue && <View style={styles.unreadDot} />}
            </View>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <SafeAreaView style={[styles.modalContent, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF' }]}>
                    <View style={styles.header}>
                        <Text style={[styles.title, { color: darkMode ? '#FFFFFF' : '#1F2937' }]}>Notifications</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color={darkMode ? '#FFFFFF' : '#1F2937'} />
                        </TouchableOpacity>
                    </View>

                    {loading ? (
                        <View style={styles.center}>
                            <ActivityIndicator size="large" color="#3B82F6" />
                        </View>
                    ) : (
                        <FlatList
                            data={notifications}
                            renderItem={renderItem}
                            keyExtractor={item => item._id}
                            contentContainerStyle={styles.listContent}
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="notifications-off-outline" size={60} color="#9CA3AF" />
                                    <Text style={styles.emptyText}>Aucune notification</Text>
                                </View>
                            }
                        />
                    )}
                </SafeAreaView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        paddingTop: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    closeButton: {
        padding: 5,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    notificationItem: {
        flexDirection: 'row',
        paddingVertical: 15,
        borderBottomWidth: 1,
        alignItems: 'center',
    },
    iconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    textContainer: {
        flex: 1,
    },
    message: {
        fontSize: 14,
        lineHeight: 20,
        marginBottom: 4,
    },
    time: {
        fontSize: 11,
        color: '#9CA3AF',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#3B82F6',
        marginLeft: 10,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 15,
        color: '#9CA3AF',
        fontSize: 16,
    }
});