import { StyleSheet, Dimensions, Platform } from 'react-native';

const { width, height } = Dimensions.get('window');

export const loginStyles = StyleSheet.create({
  // --- Layout ---
  container: {
    flex: 1,
    // MODIFICATION : Bleu doux léger réaliste
    backgroundColor: '#F0F7FF',
  },

  // --- Header Épuré ---
  loginHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    zIndex: 10,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 0,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1.5,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    flex: 1,
  },

  // --- Contenu Scrollable ---
  loginContainer: {
    flex: 1,
    backgroundColor: 'transparent', // Pour laisser passer le dégradé du parent si besoin
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 40,
  },
  responsiveContainer: {
    width: '100%',
    paddingHorizontal: 20,
    alignSelf: 'center',
  },

  // --- Section Hero / Logo ---
  headerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginTop: 40,
    marginBottom: 32,
  },
  logoWrapper: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 3,
    borderColor: '#10B981',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 24,
  },

  // --- Carte Formulaire ---
  loginFormCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.04,
    shadowRadius: 24,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F7FAFC',
  },
  loginFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 24,
    textAlign: 'left',
  },

  // --- Inputs Modernes ---
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A5568',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    height: 56,
    paddingHorizontal: 16,
    overflow: 'hidden',
  },
  inputContainerFocused: {
    borderColor: '#4C6FFF',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(76, 111, 255, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  inputIcon: {
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    fontWeight: '500',
    paddingVertical: 0,
    height: 56,
  },
  passwordToggle: {
    paddingHorizontal: 8,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // --- Actions ---
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: -10,
    marginBottom: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  forgotPasswordText: {
    fontSize: 13,
    color: '#4C6FFF',
    fontWeight: '600',
  },

  // --- Bouton Principal ---
  loginButton: {
    backgroundColor: '#4C6FFF',
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: 'rgba(76, 111, 255, 0.4)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 6,
  },
  loginButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
    letterSpacing: 0.5,
  },

  // --- Séparateur ---
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EDF2F7',
  },
  separatorText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: '#A0AEC0',
    fontWeight: '500',
  },

  // --- Bouton Inscription ---
  registerButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: 'rgba(0, 0, 0, 0.03)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 2,
  },
  registerButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4C6FFF',
  },

  // --- Socials ---
  alternativesSection: {
    marginTop: 8,
  },
  alternativesTitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  socialButton: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
    backgroundColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.02)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 1,
  },

  // --- Info Box ---
  loginNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EBF8FF',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BEE3F8',
    marginTop: 8,
  },
  loginNoteText: {
    flex: 1,
    fontSize: 13,
    color: '#2C5282',
    marginLeft: 12,
    lineHeight: 20,
  },

  // --- Loading ---
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(5px)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  // --- Modal Styles ---
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '100%',
    maxWidth: 360,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 25,
    elevation: 15,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 28,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F7FAFC',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 6,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalBody: {
    padding: 24,
    gap: 16,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#EDF2F7',
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  profileIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileRoleTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#2D3748',
    marginBottom: 4,
  },
  profileRoleDesc: {
    fontSize: 13,
    color: '#718096',
    lineHeight: 18,
  },
  profileActionIcon: {
    backgroundColor: '#F7FAFC',
    padding: 8,
    borderRadius: 10,
  },
  modalFooter: {
    padding: 20,
    paddingTop: 0,
  },
  modalCloseButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: '#F7FAFC',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDF2F7',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4A5568',
  },
  // --- OTP Specific ---
  otpInputContainer: {
    marginTop: 20,
    marginBottom: 10,
  },
  otpLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4C6FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  otpSubText: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  resendButton: {
    marginTop: 15,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#4C6FFF',
    fontWeight: '600',
  },
});

export const loginColors = {
  primary: '#4C6FFF',
  primaryLight: '#F0F7FF',
  secondary: '#10B981',
  text: '#2D3748',
  textSecondary: '#718096',
  border: '#E2E8F0',
  background: '#F0F7FF', // Synchronisé avec le style container
  card: '#FFFFFF',
  success: '#10B981',
  error: '#E53E3E',
  warning: '#ED8936',
  info: '#3182CE',
};

export const loginFontSizes = {
  xl: 26,
  lg: 18,
  md: 15,
  sm: 13,
  xs: 11,
};