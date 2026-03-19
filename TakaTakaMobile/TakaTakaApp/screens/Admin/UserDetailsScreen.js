import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function UserDetailsScreen({ route, navigation }) {
    const { user, userType } = route.params; // 'driver' ou 'passenger'

    return (
        <ScrollView style={styles.container}>
            {/* Header avec photo et infos */}
            <View style={styles.header}>
                <Text style={styles.name}>{user.name}</Text>
                <Text style={styles.phone}>{user.phone}</Text>
            </View>

            {/* Section statistiques */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Statistiques</Text>
                <View style={styles.statsGrid}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{user.rides}</Text>
                        <Text style={styles.statLabel}>Trajets</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{user.rating || 0}/5</Text>
                        <Text style={styles.statLabel}>Note</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{user.joined}</Text>
                        <Text style={styles.statLabel}>Date d'inscription</Text>
                    </View>
                </View>
            </View>

            {/* Section historique des actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Historique des actions</Text>
                {/* Liste des actions */}
            </View>

            {/* Section actions admin */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Actions administratives</Text>
                <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionButton, styles.warnButton]}>
                        <Ionicons name="warning" size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Envoyer avertissement</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.suspendButton]}>
                        <Ionicons name="pause-circle" size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Suspendre le compte</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, styles.blockButton]}>
                        <Ionicons name="ban" size={24} color="#FFF" />
                        <Text style={styles.actionButtonText}>Bloquer définitivement</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}