/**
 * Noms des écrans pour la navigation (évite les chaînes magiques).
 * La navigation principale est gérée par App.js via currentScreen.
 * 
 * REFACTORING : Suppression des écrans landing/visite (HOME, FEATURES, CONTACT, DOWNLOAD, 
 * PASSAGER, CHAUFFEUR) — L'app démarre directement sur LOGIN.
 */
export const SCREENS = {
    LOGIN: 'login',
    PASSAGER_REGISTER: 'passagerRegister',
    PASSAGER_DASHBOARD: 'passagerDashboard',
    DRIVER_REGISTER: 'driverRegister',
    DRIVER_DASHBOARD: 'driverDashboard',
    DRIVER_WAITING_APPROVAL: 'driverWaitingApproval',
    ADMIN_DASHBOARD: 'adminDashboard',
    USER_DETAILS: 'userDetails',
    SEARCH: 'search',
    RIDE_OPTIONS: 'rideOptions',
    WALLET: 'wallet',
    FORUM: 'forum',
    ASSISTANT: 'assistant',
    FORGOT_PASSWORD: 'forgotPassword',
};
