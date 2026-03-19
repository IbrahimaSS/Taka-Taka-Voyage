import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../App.styles';
import { SCREENS } from '../../constants/screens';
import { useApp } from '../../AppContext';

const FOOTER_LINKS = [
    { label: 'Conditions', screen: SCREENS.CONTACT },
    { label: 'Confidentialité', screen: SCREENS.CONTACT },
    { label: 'Aide', screen: SCREENS.CONTACT },
    { label: 'Cookies', screen: SCREENS.CONTACT },
];

export default function Footer({ setCurrentScreen }) {
    const { theme } = useApp();
    const handleLinkPress = (screen) => {
        if (typeof setCurrentScreen === 'function') {
            setCurrentScreen(screen);
        }
    };

    return (
        <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Text style={[styles.footerLogo, { color: theme.textSecondary }]}>TAKA TAKA</Text>
            <Text style={[styles.footerCopyright, { color: theme.textSecondary }]}>
                © 2026 Taka Taka Guinée
            </Text>
            <View style={styles.footerLinks}>
                {FOOTER_LINKS.map(({ label, screen }) => (
                    <TouchableOpacity
                        key={label}
                        onPress={() => handleLinkPress(screen)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.footerLink, { color: theme.textSecondary }]}>{label}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
