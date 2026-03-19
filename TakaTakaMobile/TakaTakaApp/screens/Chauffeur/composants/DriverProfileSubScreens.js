import React from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    TextInput,
    Switch,
    Image,
    Modal,
    Alert,
    Platform,
    Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export const MonProfil = ({ userData, setUserData, pickProfileImage, profileImage, handleUpdateProfile, setActiveProfileSubTab, theme, darkMode }) => {
    const [localUserData, setLocalUserData] = React.useState({ ...userData });

    // Synchroniser si userData change de l'extérieur
    React.useEffect(() => {
        setLocalUserData({ ...userData });
    }, [userData]);

    const handleSave = () => {
        handleUpdateProfile(localUserData);
    };

    return (
        <ScrollView style={[s.scrollView, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false} contentContainerStyle={s.subTabContent}>
            <View style={[s.subTabHeader, { borderBottomColor: theme.border }]}>
                <TouchableOpacity style={s.backButton} onPress={() => setActiveProfileSubTab('main')}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[s.subTabTitle, { color: theme.text }]}>Modifier mon Profil</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={s.profilePhotoSection}>
                <TouchableOpacity style={s.profilePhotoContainer} onPress={pickProfileImage}>
                    <View style={[s.profileAvatar, { backgroundColor: darkMode ? theme.card : '#FFFFFF', borderColor: theme.primary, borderWidth: 2 }]}>
                        {profileImage ? (
                            <Image source={{ uri: profileImage }} style={{ width: '100%', height: '100%', borderRadius: 60 }} />
                        ) : (
                            <Text style={[s.profileAvatarText, { color: theme.primary, fontSize: 40 }]}>{localUserData.name.charAt(0)}</Text>
                        )}
                        <View style={[s.editAvatarBadge, { backgroundColor: theme.primary }]}>
                            <Ionicons name="camera" size={16} color="white" />
                        </View>
                    </View>
                    <Text style={[s.profilePhotoText, { color: theme.textSecondary, marginTop: 10 }]}>Changer la photo</Text>
                </TouchableOpacity>
            </View>

            <View style={s.formContainer}>
                <Text style={[s.sectionHeader, { color: theme.textSecondary }]}>INFORMATIONS PERSONNELLES</Text>
                <View style={[s.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {[
                        { label: 'Nom complet', key: 'name', icon: 'person-outline' },
                        { label: 'Téléphone', key: 'phone', icon: 'call-outline', kb: 'phone-pad' },
                        { label: 'Email', key: 'email', icon: 'mail-outline', kb: 'email-address' },
                        { label: 'Adresse', key: 'address', icon: 'location-outline' },
                    ].map((item, idx, arr) => (
                        <View key={item.key} style={[s.inputGroup, idx !== arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                            <View style={s.inputHeader}>
                                <Ionicons name={item.icon} size={18} color={theme.primary} />
                                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                            </View>
                            <TextInput
                                style={[s.textInput, { color: theme.text }]}
                                value={localUserData[item.key]}
                                onChangeText={(text) => setLocalUserData({ ...localUserData, [item.key]: text })}
                                placeholder={item.label}
                                placeholderTextColor={theme.textSecondary}
                                keyboardType={item.kb || 'default'}
                            />
                        </View>
                    ))}
                </View>

                <Text style={[s.sectionHeader, { color: theme.textSecondary, marginTop: 25 }]}>VÉHICULE</Text>
                <View style={[s.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                    {[
                        { label: 'Modèle du véhicule', key: 'car', icon: 'car-outline' },
                        { label: 'Plaque d\'immatriculation', key: 'plate', icon: 'barcode-outline' },
                    ].map((item, idx, arr) => (
                        <View key={item.key} style={[s.inputGroup, idx !== arr.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                            <View style={s.inputHeader}>
                                <Ionicons name={item.icon} size={18} color={theme.primary} />
                                <Text style={[s.inputLabel, { color: theme.textSecondary }]}>{item.label}</Text>
                            </View>
                            <TextInput
                                style={[s.textInput, { color: theme.text }]}
                                value={localUserData[item.key]}
                                onChangeText={(text) => setLocalUserData({ ...localUserData, [item.key]: text })}
                                placeholder={item.label}
                                placeholderTextColor={theme.textSecondary}
                            />
                        </View>
                    ))}
                </View>

                <View style={s.actionButtons}>
                    <TouchableOpacity style={[s.btnCancel, { borderColor: theme.border }]} onPress={() => setActiveProfileSubTab('main')}>
                        <Text style={[s.btnCancelText, { color: theme.textSecondary }]}>Annuler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={s.btnSave} onPress={handleSave}>
                        <LinearGradient colors={theme.gradientPrimary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={s.btnSaveGradient}>
                            <Ionicons name="checkmark-circle" size={20} color="white" />
                            <Text style={s.btnSaveText}>Enregistrer</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

export const Documents = ({ documents, handleUploadDocument, setActiveProfileSubTab, theme, darkMode }) => {
    const [selectedDoc, setSelectedDoc] = React.useState(null);

    // Calculer les stats réelles
    const stats = {
        valide: documents.filter(d => d.status === 'validé').length,
        attente: documents.filter(d => d.status === 'en attente').length,
        expire: documents.filter(d => d.status === 'refusé').length, // On utilise "refusé" pour les erreurs ou expirés
    };

    const formatImageUrl = (path) => {
        if (!path) return null;
        // Remplacer localhost:5000 par l'URL de production
        if (path.includes('localhost:5000')) {
            path = path.replace(/http:\/\/localhost:5000/g, 'https://taka-taka-voyage.onrender.com');
        }
        if (path.startsWith('http')) return path;
        let BASE = 'https://taka-taka-voyage.onrender.com';
        const cleanPath = path.startsWith('/') ? path : `/${path}`;
        return `${BASE}${cleanPath}`;
    };

    return (
        <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={s.subTabContent}>
            <View style={[s.subTabHeader, { borderBottomColor: theme.border }]}>
                <TouchableOpacity style={s.backButton} onPress={() => setActiveProfileSubTab('main')}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[s.subTabTitle, { color: theme.text }]}>Mes Documents</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={[s.documentsStats, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={s.documentStat}>
                    <Text style={[s.documentStatNumber, { color: '#10B981' }]}>{stats.valide}</Text>
                    <Text style={[s.documentStatLabel, { color: theme.textSecondary }]}>Validés</Text>
                </View>
                <View style={[s.documentStatDivider, { backgroundColor: theme.border }]} />
                <View style={s.documentStat}>
                    <Text style={[s.documentStatNumber, { color: '#F59E0B' }]}>{stats.attente}</Text>
                    <Text style={[s.documentStatLabel, { color: theme.textSecondary }]}>En attente</Text>
                </View>
                <View style={[s.documentStatDivider, { backgroundColor: theme.border }]} />
                <View style={s.documentStat}>
                    <Text style={[s.documentStatNumber, { color: '#EF4444' }]}>{stats.expire}</Text>
                    <Text style={[s.documentStatLabel, { color: theme.textSecondary }]}>Refusés</Text>
                </View>
            </View>

            <View style={s.documentsList}>
                {documents.length === 0 ? (
                    <View style={s.emptyDocs}>
                        <Ionicons name="document-text-outline" size={60} color={theme.textSecondary} />
                        <Text style={[s.emptyDocsText, { color: theme.textSecondary }]}>Aucun document trouvé</Text>
                    </View>
                ) : (
                    documents.map((doc) => (
                        <View key={doc.id} style={[s.documentCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                            <View style={s.documentHeader}>
                                <View style={[s.documentIcon, { backgroundColor: darkMode ? '#1E2937' : '#EFF6FF' }]}>
                                    <Ionicons name="document-text" size={24} color={theme.primary} />
                                </View>
                                <View style={[s.documentInfo, { flex: 1 }]}>
                                    <Text style={[s.documentName, { color: theme.text }]}>{doc.name}</Text>
                                    <View style={[s.documentStatus, doc.status === 'validé' ? s.documentStatusValid : s.documentStatusPending]}>
                                        <Text style={[s.documentStatusText, { color: doc.status === 'validé' ? '#10B981' : '#F59E0B' }]}>{doc.status}</Text>
                                    </View>
                                </View>
                            </View>
                            <View style={[s.documentDetails, { borderTopColor: theme.border }]}>
                                <Text style={[s.documentExpiry, { color: theme.textSecondary }]}>Mis à jour : {doc.expiry}</Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                                    {doc.url && (
                                        <TouchableOpacity 
                                            onPress={() => setSelectedDoc(doc)}
                                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                        >
                                            <Ionicons name="eye-outline" size={22} color="#D4A017" />
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity 
                                        onPress={() => handleUploadDocument(doc.id)}
                                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                    >
                                        <Ionicons name="create-outline" size={22} color="#2563EB" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Modal de visualisation directe */}
            <Modal visible={!!selectedDoc} animationType="slide">
                <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
                    {/* Header */}
                    <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        paddingHorizontal: 16,
                        paddingTop: Platform.OS === 'ios' ? 50 : 30,
                        paddingBottom: 12,
                        backgroundColor: '#111'
                    }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold', flex: 1 }} numberOfLines={1}>
                            {selectedDoc?.name}
                        </Text>
                        <TouchableOpacity onPress={() => setSelectedDoc(null)} style={{ padding: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20 }}>
                            <Ionicons name="close" size={24} color="white" />
                        </TouchableOpacity>
                    </View>
                    {/* Contenu */}
                    <View style={{ flex: 1 }}>
                        {selectedDoc && selectedDoc.url && (() => {
                            const url = formatImageUrl(selectedDoc.url);
                            const isPdf = url && (url.endsWith('.pdf') || url.includes('.pdf'));
                            if (isPdf) {
                                const WebView = require('react-native-webview').WebView;
                                const pdfHtml = `
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0">
                                        <style>
                                            * { margin: 0; padding: 0; }
                                            body { background: #1a1a1a; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
                                            iframe { width: 100vw; height: 100vh; border: none; }
                                            .loading { color: white; font-family: sans-serif; text-align: center; padding: 40px; }
                                            .loading h2 { font-size: 18px; margin-bottom: 10px; }
                                            .loading p { font-size: 14px; color: #aaa; }
                                        </style>
                                    </head>
                                    <body>
                                        <iframe src="https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}" 
                                            frameborder="0" 
                                            onload="document.getElementById('loader').style.display='none'"
                                            onerror="document.getElementById('loader').innerHTML='<p>Impossible de charger</p>'">
                                        </iframe>
                                        <div id="loader" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)">
                                            <div class="loading">
                                                <h2>📄 Chargement...</h2>
                                                <p>Veuillez patienter</p>
                                            </div>
                                        </div>
                                    </body>
                                    </html>
                                `;
                                return (
                                    <WebView
                                        source={{ html: pdfHtml }}
                                        style={{ flex: 1, backgroundColor: '#1a1a1a' }}
                                        originWhitelist={['*']}
                                        javaScriptEnabled={true}
                                        domStorageEnabled={true}
                                        allowsFullscreenVideo={true}
                                        scalesPageToFit={true}
                                        onError={() => {
                                            Linking.openURL(url);
                                            setSelectedDoc(null);
                                        }}
                                    />
                                );
                            }
                            return (
                                <Image 
                                    source={{ uri: url }} 
                                    style={{ flex: 1, width: '100%' }}
                                    resizeMode="contain"
                                />
                            );
                        })()}
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
};

export const AideSupport = ({ setActiveProfileSubTab, theme, darkMode, showAlert }) => {
    const handleContact = (type, val) => {
        let url = '';
        if (type === 'call') url = `tel:${val.replace(/\s/g, '')}`;
        else if (type === 'mail') url = `mailto:${val}`;
        else if (type === 'whatsapp') url = `https://wa.me/${val.replace(/\D/g, '')}`;

        Linking.canOpenURL(url).then(supported => {
            if (supported) Linking.openURL(url);
            else showAlert('Erreur', 'Impossible d\'ouvrir l\'application correspondante.', 'error');
        }).catch(() => showAlert('Erreur', 'Une erreur est survenue lors de l\'ouverture du lien.', 'error'));
    };

    return (
        <ScrollView style={[s.scrollView, { backgroundColor: theme.background }]} showsVerticalScrollIndicator={false} contentContainerStyle={s.subTabContent}>
            <View style={[s.subTabHeader, { borderBottomColor: theme.border }]}>
                <TouchableOpacity style={s.backButton} onPress={() => setActiveProfileSubTab('main')}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[s.subTabTitle, { color: theme.text }]}>Aide & Support</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={s.helpSection}>
                <Text style={[s.sectionTitle, { color: theme.text }]}>Contacter l'assistance</Text>
                {[
                    { title: 'Appeler le support', sub: '+224 621 12 34 56', icon: 'call', color: '#3B82F6', type: 'call' },
                    { title: 'Envoyer un email', sub: 'support@takataka.gn', icon: 'mail', color: '#10B981', type: 'mail' },
                    { title: 'Chat WhatsApp', sub: '+224 666 00 00 00', icon: 'logo-whatsapp', color: '#25D366', type: 'whatsapp' },
                ].map((item, idx) => (
                    <TouchableOpacity key={idx} style={[s.contactMethod, { backgroundColor: theme.card, borderColor: theme.border }]} onPress={() => handleContact(item.type, item.sub)}>
                        <View style={[s.contactIcon, { backgroundColor: item.color + '15' }]}><Ionicons name={item.icon} size={24} color={item.color} /></View>
                        <View style={s.contactInfo}>
                            <Text style={[s.contactTitle, { color: theme.text }]}>{item.title}</Text>
                            <Text style={[s.contactSubtitle, { color: theme.textSecondary }]}>{item.sub}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
};

export const Parametres = ({ settings, handleToggleSetting, darkMode, toggleDarkMode, setActiveProfileSubTab, theme, showAlert }) => (
    <ScrollView style={s.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={s.subTabContent}>
        <View style={[s.subTabHeader, { borderBottomColor: theme.border }]}>
            <TouchableOpacity style={s.backButton} onPress={() => setActiveProfileSubTab('main')}>
                <Ionicons name="arrow-back" size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={[s.subTabTitle, { color: theme.text }]}>Paramètres</Text>
            <View style={{ width: 40 }} />
        </View>

        <View style={s.settingsSection}>
            <Text style={[s.sectionTitle, { color: theme.textSecondary }]}>Préférences de l'application</Text>
            <View style={[s.settingItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <View style={s.settingLeft}><Ionicons name="moon" size={24} color="#8B5CF6" /><Text style={[s.settingText, { color: theme.text }]}>Mode sombre</Text></View>
                <Switch value={darkMode} onValueChange={toggleDarkMode} trackColor={{ false: '#D1D5DB', true: theme.primary }} />
            </View>
            <View style={[s.settingItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <View style={s.settingLeft}><Ionicons name="notifications" size={24} color="#F59E0B" /><Text style={[s.settingText, { color: theme.text }]}>Notifications</Text></View>
                <Switch value={settings.notifications} onValueChange={() => handleToggleSetting('notifications')} trackColor={{ false: '#D1D5DB', true: theme.primary }} />
            </View>
            <View style={[s.settingItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <View style={s.settingLeft}><Ionicons name="volume-high" size={24} color={theme.primary} /><Text style={[s.settingText, { color: theme.text }]}>Alertes de course</Text></View>
                <Switch value={settings.sound} onValueChange={() => handleToggleSetting('sound')} trackColor={{ false: '#D1D5DB', true: theme.primary }} />
            </View>
        </View>

        <TouchableOpacity style={s.resetButton} onPress={() => showAlert('Réinitialiser', 'Confirmer la réinitialisation des paramètres ?', 'warning', () => console.log('Reset confirm'))}>
            <Text style={{ color: '#EF4444', fontWeight: 'bold' }}>Réinitialiser les paramètres</Text>
        </TouchableOpacity>
    </ScrollView>
);

const s = StyleSheet.create({
    scrollView: { flex: 1 },
    subTabContent: { paddingBottom: 50 },
    subTabHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: Platform.OS === 'ios' ? 20 : 40, paddingBottom: 20, borderBottomWidth: 1, marginBottom: 10 },
    backButton: { padding: 8 },
    subTabTitle: { fontSize: 18, fontWeight: 'bold' },
    profilePhotoSection: { alignItems: 'center', paddingVertical: 30 },
    profileAvatar: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', position: 'relative', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10 },
    profileAvatarText: { fontWeight: 'bold' },
    editAvatarBadge: { position: 'absolute', bottom: 5, right: 5, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFFFFF' },
    profilePhotoText: { fontSize: 14, fontWeight: '600' },
    formContainer: { paddingHorizontal: 20 },
    sectionHeader: { fontSize: 12, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10, marginLeft: 5 },
    formCard: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 20 },
    inputGroup: { paddingHorizontal: 15, paddingVertical: 12 },
    inputHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 5 },
    inputLabel: { fontSize: 12, fontWeight: '600' },
    textInput: { fontSize: 16, fontWeight: '500', paddingVertical: 5 },
    actionButtons: { flexDirection: 'row', gap: 15, marginTop: 10, marginBottom: 30 },
    btnSave: { flex: 2, borderRadius: 15, overflow: 'hidden' },
    btnSaveGradient: { paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
    btnSaveText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    btnCancel: { flex: 1, borderRadius: 15, borderWidth: 1, justifyContent: 'center', alignItems: 'center' },
    btnCancelText: { fontWeight: '600', fontSize: 16 },

    // Styles Documents
    documentsStats: { flexDirection: 'row', padding: 18, borderRadius: 16, borderWidth: 1, margin: 20, justifyContent: 'space-between' },
    documentStat: { flex: 1, alignItems: 'center' },
    documentStatNumber: { fontSize: 20, fontWeight: 'bold' },
    documentStatLabel: { fontSize: 11 },
    documentStatDivider: { width: 1, height: '80%', alignSelf: 'center' },
    documentsList: { paddingHorizontal: 20, gap: 12 },
    documentCard: { padding: 16, borderRadius: 16, borderWidth: 1 },
    documentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    documentIcon: { width: 44, height: 44, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    documentInfo: { flex: 1 },
    documentName: { fontSize: 15, fontWeight: 'bold', marginBottom: 4 },
    documentStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, alignSelf: 'flex-start' },
    documentStatusValid: { backgroundColor: '#DCFCE7' },
    documentStatusPending: { backgroundColor: '#FEF3C7' },
    documentStatusText: { fontSize: 11, fontWeight: 'bold' },
    documentDetails: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, paddingTop: 12 },
    documentExpiry: { fontSize: 12 },

    // Styles Aide
    helpSection: { paddingHorizontal: 20, gap: 12 },
    contactMethod: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderWidth: 1 },
    contactIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
    contactInfo: { flex: 1 },
    contactTitle: { fontSize: 15, fontWeight: 'bold' },
    contactSubtitle: { fontSize: 13 },

    // Styles Paramètres
    settingsSection: { paddingHorizontal: 20, marginBottom: 25 },
    settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 18, borderBottomWidth: 1 },
    settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
    settingText: { fontSize: 15, fontWeight: '600' },
    resetButton: { marginHorizontal: 20, padding: 18, alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 20, marginTop: 10 },
    docTitleRow: { flexDirection: 'row', alignItems: 'center' },
    emptyDocs: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
    emptyDocsText: { marginTop: 15, fontSize: 16 },
    viewerOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    closeViewer: { position: 'absolute', top: 50, right: 25, zIndex: 10 },
    viewerContainer: { width: '100%', height: '80%', justifyContent: 'center', alignItems: 'center' },
    viewerImage: { width: '90%', height: '100%' },
    viewerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 20 },
});
