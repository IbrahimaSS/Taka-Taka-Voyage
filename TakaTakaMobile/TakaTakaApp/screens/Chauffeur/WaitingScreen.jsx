import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Easing,
    Dimensions,
    StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../../AppContext';

import { io } from 'socket.io-client';
import TakaAlertModal from './composants/TakaAlertModal';

const { width, height } = Dimensions.get('window');

export default function WaitingScreen({ onLogout }) {
    const { darkMode, theme, user } = useApp();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // États pour le modal de succès
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [statusData, setStatusData] = useState({ type: 'success', title: '', message: '' });

    useEffect(() => {
        // --- COUPLAGE SOCKET ---
        const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://taka-taka-voyage.onrender.com/api').trim();
        const SOCKET_URL = BASE_URL.replace('/api', '');
        
        const socket = io(SOCKET_URL, {
            path: "/socket.io/",
            transports: ["polling", "websocket"],
        });

        if (user?._id) {
            const userId = String(user._id);
            socket.on("connect", () => {
                console.log("Connecté au socket pour validation:", socket.id);
                // On rejoint les rooms correspondant à l'utilisateur
                socket.emit("join", `USER_${userId}`);
                socket.emit("join", `CHAUFFEUR_${userId}`);
            });

            // Écoute de la validation
            socket.on("chauffeur:valide", (data) => {
                setStatusData({
                    type: 'success',
                    title: 'Compte Validé !',
                    message: data.message || "Félicitations, votre compte a été validé par l'administration."
                });
                setStatusModalVisible(true);
            });

            // Écoute du rejet
            socket.on("chauffeur:rejete", (data) => {
                setStatusData({
                    type: 'error',
                    title: 'Demande Rejetée',
                    message: data.message || "Votre demande a été rejetée. Veuillez vérifier vos documents."
                });
                setStatusModalVisible(true);
            });
        }

        // --- ANIMATIONS ---
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.2,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease)
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease)
                })
            ])
        ).start();

        Animated.loop(
            Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                easing: Easing.linear,
                useNativeDriver: true
            })
        ).start();

        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true
        }).start();

        return () => {
            if (socket) socket.disconnect();
        };
    }, [user?._id]);

    const spin = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg']
    });

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />
            
            <LinearGradient
                colors={darkMode ? ['#1e3a8a20', 'transparent'] : ['#eff6ff', 'transparent']}
                style={styles.backgroundGradient}
            />

            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                {/* Icône animée */}
                <View style={styles.iconContainer}>
                    <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }], backgroundColor: theme.primary + '15' }]} />
                    <Animated.View style={[styles.pulseCircle, { transform: [{ scale: Animated.multiply(pulseAnim, 0.8) }], backgroundColor: theme.primary + '20' }]} />
                    
                    <View style={[styles.mainCircle, { backgroundColor: theme.card, borderColor: theme.primary }]}>
                        <Animated.View style={{ transform: [{ rotate: spin }] }}>
                            <Ionicons name="time-outline" size={80} color={theme.primary} />
                        </Animated.View>
                    </View>
                </View>

                {/* Texte principal */}
                <Text style={[styles.title, { color: theme.text }]}>Vérification en cours</Text>
                
                <View style={[styles.infoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    <Ionicons name="shield-checkmark" size={24} color="#10B981" style={styles.infoIcon} />
                    <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                        Bonjour <Text style={{ fontWeight: 'bold', color: theme.text }}>{user?.prenom || 'Partenaire'}</Text>, votre dossier est actuellement en cours d'examen par notre équipe de sécurité.
                    </Text>
                </View>

                <View style={styles.stepsContainer}>
                    <StepItem 
                        icon="document-text" 
                        title="Documents reçus" 
                        status="completed" 
                        theme={theme}
                    />
                    <StepItem 
                        icon="search" 
                        title="Analyse du profil" 
                        status="pending" 
                        theme={theme}
                    />
                    <StepItem 
                        icon="checkmark-circle" 
                        title="Validation finale" 
                        status="waiting" 
                        theme={theme}
                    />
                </View>

                <Text style={[styles.hint, { color: theme.textSecondary }]}>
                    Cette étape prend généralement moins de 24 heures. Vous recevrez une notification dès que votre compte sera prêt.
                </Text>

                {/* Bouton de déconnexion */}
                <TouchableOpacity 
                    style={[styles.logoutButton, { borderColor: theme.border }]} 
                    onPress={onLogout}
                >
                    <Ionicons name="log-out-outline" size={20} color={theme.textSecondary} />
                    <Text style={[styles.logoutText, { color: theme.textSecondary }]}>Se déconnecter</Text>
                </TouchableOpacity>
            </Animated.View>

            <TakaAlertModal 
                visible={statusModalVisible}
                type={statusData.type}
                title={statusData.title}
                message={statusData.message}
                buttonText="C'est compris"
                onClose={() => {
                    setStatusModalVisible(false);
                    if (statusData.type === 'success') {
                        // Si succès, on force la déconnexion ou on redirige vers login?
                        // Le backend dit "Vous pouvez maintenant vous connecter".
                        // Donc on le renvoie vers la home/login.
                        onLogout();
                    }
                }}
            />
        </View>
    );
}

function StepItem({ icon, title, status, theme }) {
    const isCompleted = status === 'completed';
    const isPending = status === 'pending';

    return (
        <View style={styles.stepItem}>
            <View style={[
                styles.stepIcon, 
                { backgroundColor: isCompleted ? '#10B98120' : isPending ? theme.primary + '15' : theme.border + '50' }
            ]}>
                <Ionicons 
                    name={isCompleted ? "checkmark" : icon} 
                    size={18} 
                    color={isCompleted ? "#10B981" : isPending ? theme.primary : theme.textSecondary} 
                />
            </View>
            <Text style={[
                styles.stepTitle, 
                { color: isCompleted ? theme.text : isPending ? theme.text : theme.textSecondary, fontWeight: isPending ? '700' : '400' }
            ]}>
                {title}
            </Text>
            {isPending && (
                <View style={[styles.statusBadge, { backgroundColor: theme.primary + '20' }]}>
                    <Text style={[styles.statusText, { color: theme.primary }]}>En cours</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    backgroundGradient: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: height * 0.4,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    iconContainer: {
        width: 200,
        height: 200,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
    },
    pulseCircle: {
        position: 'absolute',
        width: 160,
        height: 160,
        borderRadius: 80,
    },
    mainCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        borderWidth: 2,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoCard: {
        width: '100%',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
    },
    infoIcon: {
        marginRight: 15,
    },
    subtitle: {
        flex: 1,
        fontSize: 15,
        lineHeight: 22,
    },
    stepsContainer: {
        width: '100%',
        marginBottom: 30,
    },
    stepItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    stepIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15,
    },
    stepTitle: {
        fontSize: 16,
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    hint: {
        fontSize: 13,
        textAlign: 'center',
        lineHeight: 20,
        paddingHorizontal: 20,
        marginBottom: 40,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 15,
        borderWidth: 1,
    },
    logoutText: {
        marginLeft: 8,
        fontSize: 15,
        fontWeight: '600',
    }
});
