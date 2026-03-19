export const lightTheme = {
    background: '#FFFFFF',
    surface: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#F3F4F6',
    surfaceAlt: '#F9FAFB',
    primary: '#10B981',
    secondary: '#3B82F6',
    gradientPrimary: ['#10B981', '#2563EB'],
    gradientAvatar: ['#10B981', '#2563EB'],
    shadow: '#000000',
    card: '#FFFFFF',
    menuItemBg: '#FFFFFF',
    menuItemIconBg: '#E6F3EA',
    switchTrackFalse: '#D1D5DB',
    switchTrackTrue: '#A7F3D0',
    switchThumbFalse: '#FFFFFF',
    switchThumbTrue: '#10B981',
};

export const darkTheme = {
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    surfaceAlt: '#374151',
    primary: '#10B981', // Keep Taka Taka colors
    secondary: '#60A5FA', // Lighter blue for dark mode
    gradientPrimary: ['#047857', '#1E3A8A'], // Darker gradient for dark mode
    gradientAvatar: ['#059669', '#1D4ED8'],
    shadow: '#000000',
    card: '#1F2937',
    menuItemBg: '#1F2937',
    menuItemIconBg: '#374151',
    switchTrackFalse: '#4B5563',
    switchTrackTrue: '#065F46',
    switchThumbFalse: '#9CA3AF',
    switchThumbTrue: '#10B981',
};

export const getTheme = (isDarkMode) => isDarkMode ? darkTheme : lightTheme;
