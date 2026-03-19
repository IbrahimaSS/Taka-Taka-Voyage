import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    Animated,
    Easing,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../AppContext";

export default function ForgotPasswordScreen({ onBack }) {
    const { darkMode, theme } = useApp();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Email, 2: OTP/Success message

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 400,
                useNativeDriver: true,
                easing: Easing.out(Easing.cubic),
            }),
        ]).start();
    }, []);

    const handleResetRequest = () => {
        if (!email) {
            Alert.alert("Erreur", "Veuillez entrer votre adresse email.");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Erreur", "Veuillez entrer un email valide.");
            return;
        }

        setLoading(true);
        // Simulation d'envoi d'email de récupération
        setTimeout(() => {
            setLoading(false);
            setStep(2);
        }, 1500);
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? "#111827" : "#F8FAFC" }]}>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <View style={styles.content}>
                    <TouchableOpacity onPress={onBack} style={[styles.backBtn, { backgroundColor: darkMode ? "#1F2937" : "#E2E8F0" }]}>
                        <Ionicons name="arrow-back" size={24} color={theme.text} />
                    </TouchableOpacity>

                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
                        <View style={styles.header}>
                            <View style={[styles.iconContainer, { backgroundColor: theme.primary + "15" }]}>
                                <Ionicons name="lock-open-outline" size={40} color={theme.primary} />
                            </View>
                            <Text style={[styles.title, { color: theme.text }]}>Mot de passe oublié ?</Text>
                            <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                                {step === 1
                                    ? "Pas d'inquiétude. Entrez votre email et nous vous enverrons les instructions."
                                    : "Vérifiez votre boîte de réception. Nous vous avons envoyé un lien de réinitialisation."
                                }
                            </Text>
                        </View>

                        {step === 1 ? (
                            <View style={styles.form}>
                                <View style={styles.inputWrapper}>
                                    <View style={[styles.inputContainer, { backgroundColor: darkMode ? "#1F2937" : "#FFF", borderColor: theme.border }]}>
                                        <Ionicons name="mail-outline" size={20} color={theme.textSecondary} style={styles.inputIcon} />
                                        <TextInput
                                            style={[styles.input, { color: theme.text }]}
                                            placeholder="Entrez votre email"
                                            placeholderTextColor={darkMode ? "#4B5563" : "#9CA3AF"}
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                        />
                                    </View>
                                </View>

                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={handleResetRequest}
                                    disabled={loading}
                                >
                                    <LinearGradient
                                        colors={theme.gradientPrimary}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={styles.gradient}
                                    >
                                        {loading ? (
                                            <ActivityIndicator color="#FFF" />
                                        ) : (
                                            <>
                                                <Text style={styles.submitText}>Réinitialiser le mot de passe</Text>
                                                <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
                                            </>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>

                                <View style={styles.infoNote}>
                                    <Ionicons name="information-circle-outline" size={16} color={theme.textSecondary} />
                                    <Text style={[styles.infoNoteText, { color: theme.textSecondary }]}>
                                        Nous vous enverrons un lien pour créer un nouveau mot de passe.
                                    </Text>
                                </View>
                            </View>
                        ) : (
                            <View style={styles.successContainer}>
                                <View style={[styles.successBadge, { backgroundColor: "#DCFCE7" }]}>
                                    <Ionicons name="checkmark-circle" size={60} color="#10B981" />
                                </View>
                                <Text style={[styles.successTitle, { color: theme.text }]}>Email envoyé !</Text>
                                <Text style={[styles.successSubtitle, { color: theme.textSecondary }]}>
                                    Si vous ne voyez pas l'email dans quelques minutes, vérifiez votre dossier de courriers indésirables (spams).
                                </Text>

                                <TouchableOpacity
                                    style={[styles.backToLoginBtn, { backgroundColor: theme.primary }]}
                                    onPress={onBack}
                                >
                                    <Text style={styles.backToLoginText}>Retour à la connexion</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => setStep(1)} style={styles.resendBtn}>
                                    <Text style={[styles.resendText, { color: theme.textSecondary }]}>
                                        Mauvaise adresse ? <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Réessayer</Text>
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { flex: 1, padding: 24 },
    backBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
    },
    header: { alignItems: "center", marginBottom: 40 },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    title: { fontSize: 28, fontWeight: "800", marginBottom: 12, textAlign: "center" },
    subtitle: { fontSize: 16, textAlign: "center", lineHeight: 24, paddingHorizontal: 20 },
    form: { width: "100%" },
    inputWrapper: { marginBottom: 24 },
    label: { fontSize: 14, fontWeight: "600", marginBottom: 8, marginLeft: 4 },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 16,
        borderWidth: 1,
        paddingHorizontal: 16,
        height: 56,
    },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16 },
    submitBtn: {
        height: 56,
        borderRadius: 16,
        overflow: "hidden",
        marginTop: 8,
    },
    gradient: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    submitText: { color: "#FFF", fontSize: 18, fontWeight: "700" },
    successContainer: { alignItems: "center", marginTop: 20, width: '100%' },
    successBadge: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
    successTitle: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
    successSubtitle: { fontSize: 16, textAlign: 'center', color: '#6B7280', lineHeight: 22, marginBottom: 32 },
    backToLoginBtn: { width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    backToLoginText: { fontSize: 18, color: '#FFF', fontWeight: '700' },
    resendBtn: { marginTop: 24, padding: 8 },
    resendText: { fontSize: 14 },
    infoNote: { flexDirection: 'row', alignItems: 'center', marginTop: 24, justifyContent: 'center', gap: 8 },
    infoNoteText: { fontSize: 13, textAlign: 'center' },
});
