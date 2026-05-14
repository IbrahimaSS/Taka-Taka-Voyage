import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Platform
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Font from 'expo-font';
import LoginScreen from './screens/Login/LoginScreen';
import PassagerRegister from './screens/Passager/PassagerRegister';
import PassagerDashboard from './screens/Passager/PassagerDashboard';
import DriverRegister from './screens/Chauffeur/DriverRegister';
import DriverDashboard from './screens/Chauffeur/DriverDashboard';
import WaitingScreen from './screens/Chauffeur/WaitingScreen';
import AdminDashboard from './screens/Admin/AdminDashboard';
import UserDetailsScreen from './screens/Admin/UserDetailsScreen';
import SearchScreen from './screens/Passager/SearchScreen';
import RideOptionsScreen from './screens/Passager/RideOptionsScreen';
import WalletScreen from './screens/Passager/WalletScreen';
import ForumScreen from './screens/Forum/ForumScreen';
import TakaAssistantScreen from './screens/Assistant/TakaAssistantScreen';
import ForgotPasswordScreen from './screens/Login/ForgotPasswordScreen';
import { AppProvider } from './AppContext';
import { colors } from './constants/colors';
import { SCREENS } from './constants/screens';
import { useApp } from './AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Composant AppContent qui contient toute la logique
function AppContent() {
  const { darkMode, theme, user, updateUser } = useApp();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [currentScreen, setCurrentScreen] = useState(null); // null = en cours de vérification
  const [previousScreen, setPreviousScreen] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // ============================
  // AUTO-LOGIN : Vérifier si l'utilisateur est déjà connecté
  // ============================
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const savedUser = await AsyncStorage.getItem('user');
        const savedToken = await AsyncStorage.getItem('authToken');

        if (savedUser && savedToken) {
          const parsedUser = JSON.parse(savedUser);
          updateUser(parsedUser);

          // Rediriger vers le bon dashboard selon le rôle
          const role = parsedUser.role?.toUpperCase();
          if (role === 'CHAUFFEUR' && parsedUser.statut === 'EN_ATTENTE') {
            setCurrentScreen(SCREENS.DRIVER_WAITING_APPROVAL);
          } else if (role === 'CHAUFFEUR') {
            setCurrentScreen(SCREENS.DRIVER_DASHBOARD);
          } else if (role === 'ADMIN') {
            setCurrentScreen(SCREENS.ADMIN_DASHBOARD);
          } else {
            setCurrentScreen(SCREENS.PASSAGER_DASHBOARD);
          }
        } else {
          setCurrentScreen(SCREENS.LOGIN);
        }
      } catch (error) {
        console.error('Erreur vérification session:', error);
        setCurrentScreen(SCREENS.LOGIN);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkExistingSession();
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
        setFontsLoaded(true);
      }
    }
    loadFonts();
  }, []);

  // ============================
  // HANDLERS
  // ============================
  const handleLoginSuccess = (userType, userData) => {
    if (userData?.statut === 'EN_ATTENTE' && userData?.role === 'CHAUFFEUR') {
      setCurrentScreen(SCREENS.DRIVER_WAITING_APPROVAL);
      return;
    }
    if (userType === 'passager') setCurrentScreen(SCREENS.PASSAGER_DASHBOARD);
    else if (userType === 'chauffeur') setCurrentScreen(SCREENS.DRIVER_DASHBOARD);
    else if (userType === 'admin') setCurrentScreen(SCREENS.ADMIN_DASHBOARD);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['user', 'authToken']);
      updateUser(null);
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
    setCurrentScreen(SCREENS.LOGIN);
  };

  // ============================
  // ÉCRAN DE CHARGEMENT
  // ============================
  if (!fontsLoaded || isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <LinearGradient
          colors={[colors.primaryBlueStart, colors.primaryGreenEnd]}
          style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: 'white', fontSize: 28, fontWeight: '900', letterSpacing: -0.5, marginBottom: 8 }}>
            Taka Taka
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '500' }}>
            Votre Confort, notre priorité
          </Text>
          <View style={{ marginTop: 30 }}>
            <Ionicons name="car-sport" size={40} color="white" />
          </View>
        </LinearGradient>
      </View>
    );
  }

  // ============================
  // SYSTÈME DE NAVIGATION SIMPLIFIÉ
  // ============================
  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case SCREENS.LOGIN:
        return (
          <LoginScreen
            onBack={() => {}} // Plus de landing, on reste sur login
            onLoginSuccess={handleLoginSuccess}
            onForgotPassword={() => setCurrentScreen(SCREENS.FORGOT_PASSWORD)}
            onSelectProfile={(profileType) => {
              if (profileType === 'passager') setCurrentScreen(SCREENS.PASSAGER_REGISTER);
              else if (profileType === 'chauffeur') setCurrentScreen(SCREENS.DRIVER_REGISTER);
            }}
            handleSocialLogin={(provider) => console.log('Social login with:', provider)}
          />
        );

      case SCREENS.FORGOT_PASSWORD:
        return <ForgotPasswordScreen onBack={() => setCurrentScreen(SCREENS.LOGIN)} />;

      case SCREENS.PASSAGER_REGISTER:
        return (
          <PassagerRegister
            onBack={() => setCurrentScreen(SCREENS.LOGIN)}
            onLogin={() => setCurrentScreen(SCREENS.LOGIN)}
          />
        );

      case SCREENS.DRIVER_REGISTER:
        return (
          <DriverRegister
            onBack={() => setCurrentScreen(SCREENS.LOGIN)}
            onLogin={() => setCurrentScreen(SCREENS.LOGIN)}
            onSuccess={() => setCurrentScreen(SCREENS.DRIVER_WAITING_APPROVAL)}
          />
        );

      case SCREENS.DRIVER_WAITING_APPROVAL:
        return <WaitingScreen onLogout={handleLogout} />;

      case SCREENS.PASSAGER_DASHBOARD:
        return (
          <PassagerDashboard
            onBack={handleLogout}
            onLogout={handleLogout}
            setCurrentScreen={setCurrentScreen}
            setPreviousScreen={setPreviousScreen}
          />
        );

      case SCREENS.DRIVER_DASHBOARD:
        return (
          <DriverDashboard
            onBack={handleLogout}
            onLogout={handleLogout}
            setCurrentScreen={setCurrentScreen}
          />
        );

      case SCREENS.ADMIN_DASHBOARD:
        return (
          <AdminDashboard
            onBack={handleLogout}
            onLogout={handleLogout}
            setCurrentScreen={setCurrentScreen}
          />
        );

      case SCREENS.USER_DETAILS:
        return (
          <UserDetailsScreen
            navigation={{
              goBack: () => setCurrentScreen(SCREENS.ADMIN_DASHBOARD),
            }}
          />
        );

      case SCREENS.SEARCH:
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

      case SCREENS.RIDE_OPTIONS:
        return (
          <RideOptionsScreen
            navigation={{
              goBack: () => setCurrentScreen(SCREENS.SEARCH),
              navigate: (screenName) => {
                if (screenName === 'search') setCurrentScreen(SCREENS.SEARCH);
              },
            }}
            route={{ params: {} }}
          />
        );

      case SCREENS.WALLET:
        return (
          <WalletScreen
            onBack={() => {
              if (previousScreen && previousScreen !== SCREENS.LOGIN) {
                setCurrentScreen(previousScreen);
              } else {
                setCurrentScreen(SCREENS.PASSAGER_DASHBOARD);
              }
            }}
          />
        );

      case SCREENS.FORUM:
        return (
          <ForumScreen
            onBack={() => setCurrentScreen(previousScreen || SCREENS.PASSAGER_DASHBOARD)}
          />
        );

      case SCREENS.ASSISTANT:
        return (
          <TakaAssistantScreen
            onBack={() => setCurrentScreen(previousScreen || SCREENS.LOGIN)}
            setCurrentScreen={setCurrentScreen}
          />
        );

      default:
        // Fallback : revenir au login
        setCurrentScreen(SCREENS.LOGIN);
        return null;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      {renderCurrentScreen()}

      {/* BOUTON FLOTTANT GLOBAL ASSISTANT IA */}
      {currentScreen !== SCREENS.ASSISTANT && currentScreen !== SCREENS.LOGIN && (
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