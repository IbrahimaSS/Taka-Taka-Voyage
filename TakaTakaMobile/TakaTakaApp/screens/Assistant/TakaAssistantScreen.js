import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useApp } from "../../AppContext";
import { apiClient } from "../../services/apiClient";
import { SCREENS } from "../../constants/screens";

export default function TakaAssistantScreen({ onBack, setCurrentScreen, activeTab }) {
    const { darkMode, theme, user, language, toggleDarkMode, changeLanguage, t } = useApp();
    const chatScrollRef = useRef(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([
        {
            id: 1,
            from: "assistant",
            text: "Bonjour je suis Taka assistant ;\nComment puis-je vous aider aujourd'hui ?",
            time: "maintenant"
        },
    ]);
    const [loading, setLoading] = useState(false);

    const handleAction = async (actionData, userText = "") => {
        try {
            const { name, confirmationMessage } = actionData;
            const commandText = userText.toLowerCase();

            // 1. Valider l'action avec le backend
            const valRes = await apiClient("/ai/validate", {
                method: "POST",
                body: { action: name }
            });

            if (!valRes.succes) {
                // Ajouter le message d'erreur dans le chat au lieu d'une alerte intrusive
                setMessages(prev => [...prev, {
                    id: Date.now(),
                    from: "assistant",
                    text: `⚠️ Désolé : ${valRes.raison || "Cette action ne peut pas être effectuée."}`,
                    time: "maintenant"
                }]);
                return;
            }

            // 2. Gérer l'exécution
            const executeAction = () => {
                const isDriver = user?.role === "CHAUFFEUR";
                const targetScreen = isDriver ? SCREENS.DRIVER_DASHBOARD : SCREENS.PASSAGER_DASHBOARD;
                
                switch (name) {
                    case "voir_profil":
                        setNavigationIntent({ tab: 'profile' });
                        setCurrentScreen(targetScreen);
                        break;
                    case "voir_historique":
                        setNavigationIntent({ tab: isDriver ? 'rides' : 'history' });
                        setCurrentScreen(targetScreen);
                        break;
                    case "voir_mon_solde":
                        setNavigationIntent({ 
                            tab: isDriver ? 'earnings' : 'history',
                            subTab: isDriver ? null : 'payments'
                        });
                        setCurrentScreen(targetScreen);
                        break;
                    case "voir_planning":
                        setNavigationIntent({ tab: isDriver ? 'rides' : 'planning' });
                        setCurrentScreen(targetScreen);
                        break;
                    case "voir_parametres":
                        setNavigationIntent({ tab: 'profile' });
                        setCurrentScreen(targetScreen);
                        break;
                    case "rechercher_taxi":
                        setNavigationIntent({ tab: 'home' });
                        setCurrentScreen(targetScreen);
                        break;
                    case "changer_theme":
                        const isLight = commandText.includes("clair") || commandText.includes("light");
                        const isDark = commandText.includes("sombre") || commandText.includes("dark") || commandText.includes("noir");
                        
                        if (isLight) toggleDarkMode(false);
                        else if (isDark) toggleDarkMode(true);
                        else toggleDarkMode();
                        
                        setMessages(prev => [...prev, {
                            id: Date.now(),
                            from: "assistant",
                            text: `✅ Mode ${darkMode ? "clair" : "sombre"} activé.`,
                            time: "maintenant"
                        }]);
                        break;
                    case "changer_langue":
                        const toEn = commandText.includes("anglais") || commandText.includes("english") || commandText.includes(" en ");
                        const toFr = commandText.includes("français") || commandText.includes("french") || commandText.includes(" fr ");
                        
                        let targetLang = language === "fr" ? "en" : "fr";
                        if (toEn) targetLang = "en";
                        else if (toFr) targetLang = "fr";
                        
                        changeLanguage(targetLang);
                        setMessages(prev => [...prev, {
                            id: Date.now(),
                            from: "assistant",
                            text: targetLang === "en" ? "✅ Language changed to English." : "✅ Langue changée en Français.",
                            time: "maintenant"
                        }]);
                        break;
                    case "deconnexion":
                        setCurrentScreen(SCREENS.HOME);
                        break;
                    default:
                        // Pour les autres actions (démarrer trajet, etc.)
                        setMessages(prev => [...prev, {
                            id: Date.now(),
                            from: "assistant",
                            text: confirmationMessage || `✅ Action exécutée : ${name.replace(/_/g, " ")}`,
                            time: "maintenant"
                        }]);
                }
            };

            if (valRes.needsConfirmation) {
                Alert.alert("Confirmation", confirmationMessage || "Voulez-vous vraiment effectuer cette action ?", [
                    { text: "Annuler", style: "cancel" },
                    { text: "Confirmer", onPress: executeAction }
                ], { cancelable: true });
            } else {
                executeAction();
            }
        } catch (error) {
            console.error("Erreur exécution action IA:", error);
        }
    };

    const handleSend = async () => {
        const textToSearch = message.trim();
        if (!textToSearch || loading) return;

        // Ajouter le message utilisateur
        const userMsg = { id: Date.now(), from: "user", text: textToSearch, time: "maintenant" };
        setMessages(prev => [...prev, userMsg]);
        setMessage("");
        setLoading(true);

        try {
            // Préparer le contexte (historique)
            const historyContext = messages.map(m => ({
                role: m.from === "user" ? "user" : "assistant",
                content: m.text
            }));

            // Préparer le smartContext
            const smartContext = `Utilisateur: ${user?.prenom || "Utilisateur"} ${user?.nom || ""}
Rôle: ${user?.role || "Inconnu"}
Langue: ${language}
Thème: ${darkMode ? "Sombre" : "Clair"}
Écran actuel: Assistant
Tab actif: ${activeTab || "N/A"}`;

            // Appel API
            const res = await apiClient("/ai/chat", {
                method: "POST",
                body: {
                    message: textToSearch,
                    context: historyContext,
                    smartContext: smartContext
                }
            });

            if (res.succes) {
                // Ajouter la réponse de l'IA
                setMessages(prev => [...prev, {
                    id: Date.now() + 1,
                    from: "assistant",
                    text: res.reponse,
                    time: "maintenant"
                }]);

                // Gérer les actions détectées
                if (res.actionDetected) {
                    handleAction(res.actionDetected, textToSearch);
                }
            } else {
                Alert.alert("Erreur", res.message || "L'assistant ne répond pas.");
            }
        } catch (error) {
            console.error("Erreur Assistant IA:", error);
            Alert.alert("Erreur", "Impossible de contacter l'assistant.");
        } finally {
            setLoading(false);
        }
    };

    const handleMic = () => {
        Alert.alert("Microphone", "La saisie vocale sera bientôt disponible.");
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: darkMode ? "#111827" : "#F8FAFC" }]}>
            <LinearGradient
                colors={theme.gradientPrimary}
                style={[styles.header, { paddingTop: Platform.OS === "android" ? 50 : 20 }]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
            >
                <View style={styles.headerTopRow}>
                    <TouchableOpacity onPress={onBack} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Taka-Assistant</Text>
                    </View>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <ScrollView
                ref={chatScrollRef}
                style={styles.chatArea}
                contentContainerStyle={styles.chatContent}
                onContentSizeChange={() => chatScrollRef.current?.scrollToEnd({ animated: true })}
            >
                {messages.map((m) => (
                    <View
                        key={m.id}
                        style={[
                            styles.bubble,
                            m.from === "user" ? styles.bubbleUser : styles.bubbleAssistant,
                            m.from === "user" ? { backgroundColor: theme.primary } : {
                                backgroundColor: darkMode ? "#1F2937" : "#FFFFFF",
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2
                            }
                        ]}
                    >
                        <Text style={[
                            styles.bubbleText,
                            m.from === "user" ? styles.bubbleTextUser : { color: darkMode ? "#F9FAFB" : "#1E293B" }
                        ]}>{m.text}</Text>
                    </View>
                ))}
                {loading && (
                    <View style={[styles.bubble, styles.bubbleAssistant, { backgroundColor: darkMode ? "#1F2937" : "#FFFFFF", paddingVertical: 15 }]}>
                        <ActivityIndicator size="small" color={theme.primary} />
                    </View>
                )}
            </ScrollView>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
                <View style={[styles.inputRow, {
                    backgroundColor: darkMode ? "#1F2937" : "#FFF",
                    borderTopColor: darkMode ? "#374151" : "#E2E8F0",
                    paddingBottom: Platform.OS === "ios" ? 25 : 12
                }]}>
                    <TouchableOpacity onPress={handleMic} style={styles.micButton}>
                        <Ionicons name="mic" size={24} color={theme.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.input, {
                            backgroundColor: darkMode ? "#374151" : "#F1F5F9",
                            color: darkMode ? "#F9FAFB" : "#1E293B"
                        }]}
                        placeholder="Posez votre question..."
                        placeholderTextColor={darkMode ? "#9CA3AF" : "#94A3B8"}
                        value={message}
                        onChangeText={setMessage}
                        onSubmitEditing={handleSend}
                        returnKeyType="send"
                    />
                    <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
                        <LinearGradient colors={theme.gradientPrimary} style={styles.sendGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Ionicons name="send" size={20} color="#FFF" />
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { paddingHorizontal: 16, paddingBottom: 16 },
    headerTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "rgba(255, 255, 255, 0.2)",
        justifyContent: "center",
        alignItems: "center"
    },
    headerTextContainer: { flex: 1, alignItems: "center" },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#FFF" },
    chatArea: { flex: 1 },
    chatContent: { padding: 16, paddingBottom: 16 },
    bubble: { maxWidth: "85%", padding: 10, borderRadius: 16, marginBottom: 4 },
    bubbleUser: { alignSelf: "flex-end", borderBottomRightRadius: 4 },
    bubbleAssistant: { alignSelf: "flex-start", borderBottomLeftRadius: 4 },
    bubbleText: { fontSize: 15, lineHeight: 18 },
    bubbleTextUser: { color: "#FFF" },
    inputRow: { flexDirection: "row", alignItems: "center", padding: 10, borderTopWidth: 1, gap: 8 },
    micButton: { padding: 8 },
    input: { flex: 1, borderRadius: 24, paddingHorizontal: 18, paddingVertical: 10, fontSize: 16 },
    sendButton: { borderRadius: 24, overflow: "hidden" },
    sendGradient: { padding: 12 },
});
