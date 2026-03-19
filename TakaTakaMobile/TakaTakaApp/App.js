import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import * as Font from 'expo-font';
import { styles } from './App.styles';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import LoginScreen from './screens/Login/LoginScreen';
import PassagerHome from './screens/Passager/PassagerHome';
import DriverHome from './screens/Chauffeur/DriverHome';
import DriverRegister from './screens/Chauffeur/DriverRegister';
import WaitingScreen from './screens/Chauffeur/WaitingScreen';
import PassagerRegister from './screens/Passager/PassagerRegister';
import FeaturesScreen from './screens/Fonctionnalités/Features';
import ContactScreen from './screens/Contact/ContactScreen';
import PassagerDashboard from './screens/Passager/PassagerDashboard';
import { AppProvider } from './AppContext';
import SearchScreen from './screens/Passager/SearchScreen';
import RideOptionsScreen from './screens/Passager/RideOptionsScreen';
import DriverDashboard from './screens/Chauffeur/DriverDashboard';
import AdminDashboard from './screens/Admin/AdminDashboard';
import UserDetailsScreen from './screens/Admin/UserDetailsScreen';
import TakaAssistantScreen from './screens/Assistant/TakaAssistantScreen';
import ForgotPasswordScreen from './screens/Login/ForgotPasswordScreen';
import { colors } from './constants/colors';
import { SCREENS } from './constants/screens';
import { PLATFORM } from './constants/platform';
import ProfileChoiceModal from './components/ProfileChoiceModal';
import { useApp } from './AppContext';
import { apiClient } from './services/apiClient';
import { io } from 'socket.io-client';

const { width, height } = Dimensions.get('window');

// Données pour le slider - MISE À JOUR avec l'image et le texte fourni
const heroImages = [
  {
    id: 1,
    title: 'Délacements Intelligents',
    subtitle: 'Optimisez vos trajets, économisez du temps',
    // Utilisation de l'image fournie dans la description
    image: 'https://z-cdn-media.chatglm.cn/files/7f4faee2-1078-461d-97ea-b79a5a849367.jpeg?auth_key=1870136680-5eb8b3e2950e4aed97bd20cf3acfb1eb-0-1aee1e1f7171e8c9d3c515e333551a4b',
  },
  {
    id: 2,
    title: 'Voyagez Sereinement',
    subtitle: 'Chauffeurs vérifiés, suivi en temps réel',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb',
  },
  {
    id: 3,
    title: 'Votre Solution de mobilité en Guinée',
    subtitle: 'Rapide, Sécurisé, Abordable',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
  },
];

const benefits = [
  {
    icon: 'flash',
    iconColor: colors.primaryGreenStart,
    iconBg: colors.primaryGreenStart20,
    title: 'Rapide',
    text: 'Trajet en moins de 30 secondes'
  },
  {
    icon: 'shield-checkmark',
    iconColor: colors.primaryBlueStart,
    iconBg: colors.primaryBlueStart20,
    title: 'Sécurisé',
    text: 'Chauffeurs vérifiés, suivi en direct'
  },
  {
    icon: 'wallet',
    iconColor: colors.primaryGreenStart,
    iconBg: colors.primaryGreenStart20,
    title: 'Flexible',
    text: 'Paiement cash, mobile money, carte'
  }
];

const statsData = [
  { value: '10', label: 'Utilisateurs satisfaits' },
  { value: '5', label: 'Chauffeurs actifs' },
  { value: '50', label: 'Trajets effectués' },
  { value: '4.8', label: 'Note moyenne', rating: true }
];

const testimonials = [
  {
    date: 'Il y a 2 jours',
    text: 'Je prends Taka Taka tous les jours pour aller au travail. Rapide, fiable et les chauffeurs sont toujours polis !',
    author: 'Fatou, Conakry'
  },
  {
    date: 'Il y a 1 semaine',
    text: 'Devenir chauffeur Taka Taka a changé mes revenus. Les paiements sont quotidiens et le support est excellent.',
    author: 'Mamadou, Kindia'
  }
];

const contactFormFields = [
  {
    keyName: 'name',
    label: 'Nom complet *',
    placeholder: 'Votre nom',
    keyboardType: 'default',
    autoCapitalize: 'words'
  },
  {
    keyName: 'email',
    label: 'Adresse email *',
    placeholder: 'votre@email.com',
    keyboardType: 'email-address',
    autoCapitalize: 'none'
  },
  {
    keyName: 'subject',
    label: 'Sujet *',
    placeholder: 'De quoi souhaitez-vous parler ?',
    isSelect: true,
    options: [
      { label: 'Support technique', value: 'support' },
      { label: 'Devenir chauffeur', value: 'driver' },
      { label: 'Partenariat', value: 'partner' },
      { label: 'Autre', value: 'other' }
    ]
  },
  {
    keyName: 'message',
    label: 'Votre message *',
    placeholder: 'Décrivez-nous votre demande en détail...',
    keyboardType: 'default',
    autoCapitalize: 'sentences',
    multiline: true
  }
];

const contactInfo = [
  { icon: 'call', detail: '+224 621 45 67 89' },
  { icon: 'mail', detail: 'contact@takataka.gn' }
];

// Composant AppContent qui contient toute la logique
function AppContent() {
  const { darkMode, theme, user } = useApp();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [previousScreen, setPreviousScreen] = useState(null);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const sliderRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;

  const [appStats, setAppStats] = useState({
    utilisateurs: 50000,
    chauffeurs: 10000,
    trajets: 100000,
    satisfaction: 4.8
  });

  const [contactData, setContactData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [contactSuccessModalVisible, setContactSuccessModalVisible] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [adminReply, setAdminReply] = useState(null);
  const [sentMessageId, setSentMessageId] = useState(null);

  useEffect(() => {
    let socket;
    if (contactSuccessModalVisible && sentMessageId) {
      const BASE_URL = (process.env.EXPO_PUBLIC_API_URL || 'https://taka-taka-voyage.onrender.com/api').trim();
      const SOCKET_URL = BASE_URL.replace('/api', '');

      console.log("Tentative de connexion Socket sur :", SOCKET_URL);
      console.log("En attente de la réponse sur :", `contact:reply:${sentMessageId}`);

      socket = io(SOCKET_URL, {
        path: "/socket.io/",
        transports: ["polling", "websocket"],
        reconnection: true,
        extraHeaders: {
          Origin: "https://taka-taka-voyage-pi.vercel.app"
        },
      });

      socket.on("connect", () => {
        console.log("🟢 Socket connecté avec succès ! ID:", socket.id);
      });

      socket.on("connect_error", (err) => {
        console.log("❌ Erreur Socket:", err.message);
      });

      socket.on(`contact:reply:${sentMessageId}`, (data) => {
        console.log("🎉 Réponse reçue de l'Admin :", data);
        setAdminReply(data.reply);
      });
    }

    return () => {
      if (socket) {
        console.log("🔴 Déconnexion du socket");
        socket.disconnect();
      }
    };
  }, [contactSuccessModalVisible, sentMessageId]);

  useEffect(() => {
    // Fetch global stats
    const fetchGlobalStats = async () => {
      try {
        const res = await apiClient('/common/stats');
        if (res && res.succes && res.stats) {
          setAppStats(prev => ({
            ...prev,
            utilisateurs: res.stats.utilisateurs || prev.utilisateurs,
            chauffeurs: res.stats.chauffeurs || prev.chauffeurs,
            trajets: res.stats.trajets || prev.trajets,
          }));
        }
      } catch (error) {
        console.error("Erreur stats (App):", error);
      }
    };
    fetchGlobalStats();

    // Animation d'entrée principale
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Animation pulsée pour le logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(logoAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  // Redirection automatique pour les chauffeurs en attente
  useEffect(() => {
    if (user && user.role === 'CHAUFFEUR' && user.statut === 'EN_ATTENTE') {
      if (currentScreen !== SCREENS.DRIVER_WAITING_APPROVAL) {
        setCurrentScreen(SCREENS.DRIVER_WAITING_APPROVAL);
      }
    }
  }, [user, currentScreen]);

  useEffect(() => {
    async function loadFonts() {
      try {
        await Font.loadAsync({
          ...Ionicons.font,
          ...MaterialCommunityIcons.font,
        });
        setFontsLoaded(true);
      } catch (error) {
        console.error('Erreur de chargement des polices:', error);
        setFontsLoaded(true); // Toujours mettre à true pour ne pas bloquer l'app en cas d'erreur
      }
    }
    loadFonts();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex =
        currentIndex === heroImages.length - 1 ? 0 : currentIndex + 1;

      sliderRef.current?.scrollTo({
        x: nextIndex * width,
        animated: true,
      });

      setCurrentIndex(nextIndex);
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleLoginSuccess = (userType, user) => {
    if (user?.statut === 'EN_ATTENTE' && user?.role === 'CHAUFFEUR') {
      setCurrentScreen(SCREENS.DRIVER_WAITING_APPROVAL);
      return;
    }
    if (userType === 'passager') setCurrentScreen(SCREENS.PASSAGER_DASHBOARD);
    else if (userType === 'chauffeur') setCurrentScreen(SCREENS.DRIVER_DASHBOARD);
    else if (userType === 'admin') setCurrentScreen(SCREENS.ADMIN_DASHBOARD);
  };

  const handleSignupSelection = (profileType) => {
    setProfileModalVisible(false);
    if (profileType === 'passager') setCurrentScreen(SCREENS.PASSAGER_REGISTER);
    else if (profileType === 'chauffeur') setCurrentScreen(SCREENS.DRIVER_REGISTER);
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <LinearGradient
          colors={[colors.primaryBlueStart, colors.primaryGreenEnd]}
          style={styles.loadingGradient}
        >
          <Text style={styles.loadingText}>Chargement de {PLATFORM.name}...</Text>
          <View style={styles.loadingSpinner}>
            <Ionicons name="car-sport" size={40} color="white" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  // SYSTEME DE NAVIGATION COMPLET
  const renderCurrentScreen = () => {
    if (currentScreen === SCREENS.LOGIN) {
      return <LoginScreen
        onBack={() => setCurrentScreen(SCREENS.HOME)}
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={() => setCurrentScreen(SCREENS.FORGOT_PASSWORD)}
        onSelectProfile={(profileType) => {
          if (profileType === 'passager') setCurrentScreen(SCREENS.PASSAGER_REGISTER);
          else if (profileType === 'chauffeur') setCurrentScreen(SCREENS.DRIVER_REGISTER);
        }}
      />;
    }

    if (currentScreen === SCREENS.PASSAGER_DASHBOARD) {
      return <PassagerDashboard
        onBack={() => setCurrentScreen(SCREENS.HOME)}
        onLogout={() => setCurrentScreen(SCREENS.HOME)}
        setCurrentScreen={setCurrentScreen}
      />;
    }

    if (currentScreen === SCREENS.PASSAGER) {
      return <PassagerHome
        onBack={() => setCurrentScreen(SCREENS.HOME)}
        onRegister={() => setCurrentScreen(SCREENS.PASSAGER_REGISTER)}
        onLogin={() => setCurrentScreen(SCREENS.LOGIN)}
      />;
    }

    if (currentScreen === SCREENS.PASSAGER_REGISTER) {
      return <PassagerRegister
        onBack={() => setCurrentScreen(SCREENS.HOME)}
        onLogin={() => setCurrentScreen(SCREENS.LOGIN)}
      />;
    }

    if (currentScreen === SCREENS.DRIVER_DASHBOARD) {
      return (
        <DriverDashboard
          onBack={() => setCurrentScreen(SCREENS.HOME)}
          onLogout={() => setCurrentScreen(SCREENS.HOME)}
          setCurrentScreen={setCurrentScreen}
        />
      );
    }

    if (currentScreen === SCREENS.CHAUFFEUR) {
      return (
        <DriverHome
          onBack={() => setCurrentScreen(SCREENS.HOME)}
          onRegister={() => setCurrentScreen(SCREENS.DRIVER_REGISTER)}
          onLogin={() => setCurrentScreen(SCREENS.LOGIN)}
        />
      );
    }

    if (currentScreen === SCREENS.DRIVER_REGISTER) {
      return (
        <DriverRegister 
          onBack={() => setCurrentScreen(SCREENS.HOME)} 
          onLogin={() => setCurrentScreen(SCREENS.LOGIN)} 
          onSuccess={() => setCurrentScreen(SCREENS.DRIVER_WAITING_APPROVAL)}
        />
      );
    }

    if (currentScreen === SCREENS.DRIVER_WAITING_APPROVAL) {
      return (
        <WaitingScreen 
          onLogout={() => {
            setCurrentScreen(SCREENS.HOME);
            // Optionnel: vider le storage si nécessaire via useApp
          }} 
        />
      );
    }

    if (currentScreen === SCREENS.FEATURES) {
      return <FeaturesScreen setCurrentScreen={setCurrentScreen} />;
    }

    if (currentScreen === SCREENS.CONTACT) {
      return <ContactScreen setCurrentScreen={setCurrentScreen} />;
    }

    if (currentScreen === SCREENS.DOWNLOAD) {
      alert("Page de téléchargement - Liens vers App Store et Google Play");
      setCurrentScreen(SCREENS.HOME);
      return null;
    }

    if (currentScreen === SCREENS.ADMIN_DASHBOARD) {
      return (
        <AdminDashboard
          onBack={() => setCurrentScreen(SCREENS.HOME)}
          onLogout={() => setCurrentScreen(SCREENS.HOME)}
          setCurrentScreen={setCurrentScreen}
        />
      );
    }

    if (currentScreen === SCREENS.USER_DETAILS) {
      return (
        <UserDetailsScreen
          navigation={{
            goBack: () => setCurrentScreen(SCREENS.ADMIN_DASHBOARD),
          }}
        />
      );
    }

    if (currentScreen === SCREENS.SEARCH) {
      return (
        <SearchScreen
          navigation={{
            goBack: () => setCurrentScreen(SCREENS.PASSAGER_DASHBOARD),
            navigate: (screenName) => {
              if (screenName === 'RideOptions') setCurrentScreen(SCREENS.RIDE_OPTIONS);
            },
          }}
        />
      );
    }

    if (currentScreen === SCREENS.RIDE_OPTIONS) {
      return (
        <RideOptionsScreen
          navigation={{
            goBack: () => setCurrentScreen(SCREENS.SEARCH),
            navigate: (screenName) => {
              if (screenName === 'search') setCurrentScreen(SCREENS.SEARCH);
            },
          }}
          route={{
            params: {}
          }}
        />
      );
    }

    if (currentScreen === SCREENS.ASSISTANT) {
      return (
        <TakaAssistantScreen 
          onBack={() => setCurrentScreen(previousScreen || SCREENS.HOME)} 
          setCurrentScreen={setCurrentScreen}
        />
      );
    }

    if (currentScreen === SCREENS.FORGOT_PASSWORD) {
      return <ForgotPasswordScreen onBack={() => setCurrentScreen(SCREENS.LOGIN)} />;
    }

    // ÉCRAN PRINCIPAL
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <ProfileChoiceModal
          visible={profileModalVisible}
          onClose={() => setProfileModalVisible(false)}
          onSelectPassager={() => handleSignupSelection('passager')}
          onSelectChauffeur={() => handleSignupSelection('chauffeur')}
        />
        {/* MODAL DU MENU HAMBURGER */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={menuVisible}
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.menuOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <Header
              menuVisible={menuVisible}
              setMenuVisible={setMenuVisible}
              setCurrentScreen={setCurrentScreen}
            />
          </TouchableOpacity>
        </Modal>

        {/* MODAL SUCCÈS CONTACT & RÉPONSE ADMIN */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={contactSuccessModalVisible}
          onRequestClose={() => {
            setContactSuccessModalVisible(false);
            setAdminReply(null);
            setSentMessageId(null);
          }}
        >
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{
              width: width * 0.85,
              backgroundColor: darkMode ? '#1F2937' : '#FFFFFF',
              borderRadius: 20,
              padding: 24,
              alignItems: 'center',
              shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5
            }}>
              {!adminReply ? (
                <>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(16, 185, 129, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    <Ionicons name="checkmark-circle" size={48} color="#10B981" />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 12, textAlign: 'center' }}>
                    Message envoyé !
                  </Text>
                  <Text style={{ fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 24 }}>
                    Votre message a été transmis avec succès. Notre équipe vous répondra par email ou directement ici. Restez sur cette page si vous attendez une réponse rapide !
                  </Text>
                </>
              ) : (
                <>
                  <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(59, 130, 246, 0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    <Ionicons name="mail" size={40} color="#3B82F6" />
                  </View>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme.text, marginBottom: 12, textAlign: 'center' }}>
                    L'équipe a répondu !
                  </Text>
                  <View style={{ width: '100%', padding: 16, backgroundColor: darkMode ? '#374151' : '#F3F4F6', borderRadius: 12, marginBottom: 24 }}>
                    <Text style={{ fontSize: 15, color: theme.text, fontWeight: '500' }}>
                      {adminReply}
                    </Text>
                  </View>
                </>
              )}
              <TouchableOpacity
                style={{ width: '100%' }}
                activeOpacity={0.8}
                onPress={() => {
                  setContactSuccessModalVisible(false);
                  setAdminReply(null);
                  setSentMessageId(null);
                }}
              >
                <LinearGradient
                  colors={['#10B981', '#2563EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ borderRadius: 12, paddingVertical: 14, alignItems: 'center' }}
                >
                  <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>C'est compris</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* MODAL SÉLECTION SUJET CONTACT */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSubjectModal}
          onRequestClose={() => setShowSubjectModal(false)}
        >
          <TouchableOpacity
            style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 }}
            activeOpacity={1}
            onPress={() => setShowSubjectModal(false)}
          >
            <View style={{ backgroundColor: darkMode ? '#1F2937' : 'white', borderRadius: 12, padding: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: theme.text, mb: 15, marginBottom: 16 }}>
                Sélectionnez un sujet
              </Text>
              {contactFormFields.find(f => f.keyName === 'subject')?.options.map((opt, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    paddingVertical: 14,
                    borderBottomWidth: i === 3 ? 0 : 1,
                    borderBottomColor: theme.border
                  }}
                  onPress={() => {
                    setContactData({ ...contactData, subject: opt.value });
                    setShowSubjectModal(false);
                  }}
                >
                  <Text style={{ fontSize: 16, color: contactData.subject === opt.value ? colors.primaryBlueStart : theme.text }}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* ÉCRAN PRINCIPAL AVEC DÉGRADÉ */}
        <LinearGradient
          colors={darkMode ? ['#111827', '#1F2937'] : [
            colors.primaryGreenStart + '40',
            colors.primaryBlueEnd + '40'
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientBackground}
        >
          {/* EN-TÊTE AVEC LOGO À GAUCHE ET MENU À DROITE */}
          <View style={styles.headerContainer}>
            <LinearGradient
              colors={[colors.primaryBlueStart, colors.primaryBlueEnd]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientHeader}
            >
              <View style={styles.headerContent}>
                {/* TEXTE TAKA TAKA À GAUCHE (ABSOLU POUR NE PAS POUSSER LE LOGO) */}
                <View style={{ position: 'absolute', left: 16, height: 40, justifyContent: 'center', zIndex: 10 }}>
                  <MaskedView
                    style={{ width: 120, height: 40 }}
                    maskElement={
                      <Text style={{ fontSize: 24, fontWeight: '900', letterSpacing: -0.5 }}>
                        Taka Taka
                      </Text>
                    }
                  >
                    <LinearGradient
                      colors={[colors.white, colors.primaryGreenStart, colors.white]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={{ flex: 1 }}
                    />
                  </MaskedView>
                </View>

                {/* SPACER POUR LE CENTRAGE DU LOGO */}
                <View style={{ width: 48 }} />

                {/* LOGO AU CENTRE */}
                <View style={styles.logoContainer}>
                  <Animated.View style={{
                    transform: [{
                      scale: logoAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.05]
                      })
                    }],
                  }}>
                    <View style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: '#FFFFFF',
                      alignItems: 'center',
                      justifyContent: 'center',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 5,
                      overflow: 'hidden',
                      borderWidth: 2.5,
                      borderColor: '#10B981'
                    }}>
                      <Image
                        source={require('./assets/logo/LogoTT.jpeg')}
                        style={{ width: 45, height: 45, resizeMode: 'contain' }}
                      />
                    </View>
                  </Animated.View>

                  {/* MISE À JOUR DU TAGLINE POUR CORRESPONDRE À L'IMAGE */}
                  <Text style={styles.tagline}>
                    Votre Confort notre priorité
                  </Text>
                </View>

                {/* MENU HAMBURGER À DROITE */}
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setMenuVisible(true)}
                >
                  <Ionicons name="menu-outline" size={24} color="white" />
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </View>

          <ScrollView
            style={[styles.scrollContainer, { backgroundColor: 'transparent' }]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >

            {/* SECTION HERO */}
            <View style={styles.heroSection}>
              <ScrollView
                ref={sliderRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={(e) => {
                  const index = Math.round(e.nativeEvent.contentOffset.x / width);
                  setCurrentIndex(index);
                }}
              >
                {heroImages.map((item) => (
                  <View key={item.id} style={{ width }}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.heroImage}
                      resizeMode="cover"
                    />
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.7)']}
                      style={styles.heroOverlay}
                    >
                      <View style={styles.heroContent}>
                        <Text style={styles.heroTitle}>{item.title}</Text>
                        <Text style={styles.heroSubtitle}>{item.subtitle}</Text>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </ScrollView>
              {/* Indicateurs de diapositive */}
              <View style={styles.sliderIndicators}>
                {heroImages.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.sliderIndicator,
                      currentIndex === index && styles.sliderIndicatorActive
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* DESCRIPTION PROFESSIONNELLE */}
            <View style={styles.section}>
              <Text style={[styles.description, {
                color: theme.text,
                fontSize: 18,
                lineHeight: 28,
                fontWeight: '500'
              }]}>
                Taka Taka connecte passagers et chauffeurs pour des trajets rapides,
                sécurisés et abordables en Guinée. Une solution de mobilité moderne
                pour vos déplacements quotidiens.
              </Text>
            </View>

            {/* AVANTAGES - RAPIDE, SÉCURISÉ, FLEXIBLE */}
            <View style={styles.benefitsSection}>
              {benefits.map((benefit, index) => (
                <View key={index} style={[styles.benefitCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                  <View style={[styles.benefitIcon, { backgroundColor: darkMode ? `${benefit.iconColor}20` : benefit.iconBg }]}>
                    <Ionicons name={benefit.icon} size={32} color={benefit.iconColor} />
                  </View>
                  <Text style={[styles.benefitTitle, { color: theme.text }]}>
                    {benefit.title}
                  </Text>
                  <Text style={[styles.benefitText, { color: theme.textSecondary }]}>
                    {benefit.text}
                  </Text>
                </View>
              ))}
            </View>

            {/* STATISTIQUES */}
            <View style={[styles.statsSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
              {/* Utilisateurs */}
              <View style={[styles.statCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>
                  {appStats.utilisateurs}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Utilisateurs</Text>
              </View>
              {/* Chauffeurs */}
              <View style={[styles.statCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>
                  {appStats.chauffeurs}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Chauffeurs</Text>
              </View>
              {/* Trajets */}
              <View style={[styles.statCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                <Text style={[styles.statNumber, { color: theme.primary }]}>
                  {appStats.trajets}
                </Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Trajets</Text>
              </View>
              {/* Evaluation */}
              <View style={[styles.statCard, { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border }]}>
                <View style={styles.ratingContainer}>
                  <Text style={[styles.statNumber, { color: theme.primary }]}>
                    {appStats.satisfaction}
                  </Text>
                  <Ionicons name="star" size={20} color="#FBBF24" />
                </View>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Note moyenne</Text>
              </View>
            </View>

            {/* CHOIX DU RÔLE */}
            <View style={styles.roleSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                Comment voulez-vous utiliser Taka Taka ?
              </Text>

              <TouchableOpacity
                onPress={() => setCurrentScreen(SCREENS.PASSAGER)}
                activeOpacity={0.9}
                style={styles.roleButtonWrapper}
              >
                <LinearGradient
                  colors={[colors.primaryGreenStart, colors.primaryGreenEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.roleButton, styles.passengerButton]}
                >
                  <View style={styles.roleIconContainer}>
                    <Ionicons name="person" size={32} color="white" />
                  </View>
                  <View style={styles.roleTextContainer}>
                    <Text style={styles.roleTitle}>JE SUIS PASSAGER</Text>
                    <Text style={styles.roleSubtitle}>Trouvez un trajet en quelques secondes</Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={28} color="white" />
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setCurrentScreen(SCREENS.CHAUFFEUR)}
                activeOpacity={0.9}
                style={styles.roleButtonWrapper}
              >
                <LinearGradient
                  colors={[colors.primaryBlueStart, colors.primaryBlueEnd]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.roleButton, styles.driverButton]}
                >
                  <View style={styles.roleIconContainer}>
                    <Ionicons name="car" size={32} color="white" />
                  </View>
                  <View style={styles.roleTextContainer}>
                    <Text style={styles.roleTitle}>JE SUIS CHAUFFEUR</Text>
                    <Text style={styles.roleSubtitle}>Gagnez jusqu'à 30% de plus</Text>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={28} color="white" />
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* SECTION INSCRIRE ET CONNECTER */}
            <View style={[styles.authSection, { backgroundColor: darkMode ? 'transparent' : '#FFFFFF', paddingBottom: 30 }]}>
              <Text style={[styles.sectionTitle, { color: colors.gray700 }]}>
                Commencez dès maintenant
              </Text>
              <Text style={[styles.authSubtitle, { color: colors.gray600 }]}>
                Rejoignez notre communauté de mobilité
              </Text>

              <View style={styles.authButtons}>
                <TouchableOpacity
                  style={[styles.authButton, styles.signupButton]}
                  onPress={() => setProfileModalVisible(true)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[colors.primaryGreenStart, colors.primaryGreenEnd]}
                    style={styles.authButtonGradient}
                  >
                    <Ionicons name="person-add" size={24} color="white" />
                    <Text style={styles.authButtonText}>S'inscrire</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.authButton, styles.loginButton]}
                  onPress={() => setCurrentScreen(SCREENS.LOGIN)}
                  activeOpacity={0.9}
                >
                  <View style={styles.authButtonContent}>
                    <Ionicons name="log-in" size={24} color={colors.primaryBlueStart} />
                    <Text style={[styles.authButtonText, { color: colors.primaryBlueStart }]}>
                      Se connecter
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {/* TÉMOIGNAGES */}
            <View style={styles.testimonialsSection}>
              <Text style={[styles.sectionTitle, { color: colors.gray700 }]}>
                Ce que disent nos utilisateurs
              </Text>

              {testimonials.map((testimonial, index) => (
                <View key={index} style={[styles.testimonialCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.testimonialHeader}>
                    <View style={styles.ratingStars}>
                      {[...Array(5)].map((_, i) => (
                        <Ionicons key={i} name="star" size={18} color="#FBBF24" />
                      ))}
                    </View>
                    <Text style={[styles.testimonialDate, { color: colors.gray500 }]}>
                      {testimonial.date}
                    </Text>
                  </View>
                  <Text style={[styles.testimonialText, { color: colors.gray600 }]}>
                    {testimonial.text}
                  </Text>
                  <Text style={[styles.testimonialAuthor, { color: colors.gray700 }]}>
                    {testimonial.author}
                  </Text>
                </View>
              ))}
            </View>

            {/* FORMULAIRE DE CONTACT */}
            <View style={styles.contactSection}>
              <Text style={[styles.sectionTitle, { color: colors.gray700 }]}>
                Contactez-nous
              </Text>
              <Text style={[styles.contactText, { color: colors.gray600 }]}>
                Une question ? Notre équipe est à votre disposition pour vous aider !
              </Text>

              <View style={styles.form}>
                {contactFormFields.map((field, index) => (
                  <View key={index} style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, { color: colors.gray700 }]}>
                      {field.label}
                    </Text>
                    {field.isSelect ? (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => setShowSubjectModal(true)}
                        style={[
                          styles.textInput,
                          { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', borderColor: theme.border, justifyContent: 'center' }
                        ]}
                      >
                        <Text style={{ color: contactData[field.keyName] ? theme.text : colors.gray400 }}>
                          {contactData[field.keyName]
                            ? field.options?.find(o => o.value === contactData[field.keyName])?.label
                            : field.placeholder}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <TextInput
                        style={[
                          styles.textInput,
                          field.multiline && styles.textArea,
                          { backgroundColor: darkMode ? '#1F2937' : '#FFFFFF', color: theme.text, borderColor: theme.border }
                        ]}
                        placeholder={field.placeholder}
                        placeholderTextColor={colors.gray400}
                        keyboardType={field.keyboardType}
                        autoCapitalize={field.autoCapitalize}
                        multiline={field.multiline}
                        numberOfLines={field.multiline ? 4 : 1}
                        textAlignVertical={field.multiline ? 'top' : 'center'}
                        value={contactData[field.keyName]}
                        onChangeText={(val) => setContactData({ ...contactData, [field.keyName]: val })}
                      />
                    )}
                  </View>
                ))}

                <TouchableOpacity
                  activeOpacity={0.9}
                  disabled={isSending}
                  onPress={async () => {
                    if (!contactData.name || !contactData.email || !contactData.subject || !contactData.message) {
                      alert("Veuillez remplir tous les champs !");
                      return;
                    }
                    setIsSending(true);
                    setAdminReply(null);
                    try {
                      const res = await apiClient('/common/contact', {
                        method: 'POST',
                        body: contactData
                      });
                      if (res && res.succes) {
                        setSentMessageId(res.messageId);
                        setContactSuccessModalVisible(true);
                        setContactData({ name: '', email: '', subject: '', message: '' });
                      } else {
                        alert(res?.message || 'Erreur lors de l’envoi. Veuillez réessayer.');
                      }
                    } catch (err) {
                      alert('Erreur serveur. Veuillez réessayer plus tard.');
                    } finally {
                      setIsSending(false);
                    }
                  }}
                  style={{ marginTop: 10 }}
                >
                  <LinearGradient
                    colors={isSending ? [colors.gray400, colors.gray500] : [colors.primaryGreenStart, colors.primaryBlueEnd]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitButtonGradient}
                  >
                    <Text style={styles.submitButtonText}>
                      {isSending ? "Envoi en cours..." : "Envoyer le message"}
                    </Text>
                    {!isSending && <Ionicons name="send" size={22} color="white" />}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* CONTACT INFO AMÉLIORÉ - NE DÉBORDE PLUS */}
              <View style={styles.quickContact}>
                {contactInfo.map((info, index) => (
                  <View key={index} style={styles.contactItem}>
                    <View style={[styles.contactIcon, { backgroundColor: darkMode ? '#1F2937' : colors.primaryBlueStart20 }]}>
                      <Ionicons name={info.icon} size={18} color={colors.primaryBlueStart} />
                    </View>
                    <Text style={[styles.contactDetail, {
                      color: theme.text,
                      maxWidth: '80%',
                    }]}>
                      {info.detail}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <Footer setCurrentScreen={setCurrentScreen} />
          </ScrollView>
        </LinearGradient>
      </Animated.View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {renderCurrentScreen()}

      {/* BOUTON FLOTTANT GLOBAL ASSISTANT IA */}
      {currentScreen !== SCREENS.ASSISTANT && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 100 : 90,
            right: 20,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: '#10B981',
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 6,
            zIndex: 9999
          }}
          onPress={() => {
            setPreviousScreen(currentScreen);
            setCurrentScreen(SCREENS.ASSISTANT);
          }}
        >
          <LinearGradient
            colors={['#10B981', '#2563EB']}
            style={{
              width: 60,
              height: 60,
              borderRadius: 30,
              justifyContent: 'center',
              alignItems: 'center'
            }}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="robot-outline" size={30} color="#FFFFFF" />
            <View style={{
              position: 'absolute',
              top: 12,
              right: 12,
              width: 12,
              height: 12,
              borderRadius: 6,
              backgroundColor: '#10B981',
              borderWidth: 2,
              borderColor: '#FFFFFF'
            }} />
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Fonction App principale qui enveloppe tout avec AppProvider
export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}