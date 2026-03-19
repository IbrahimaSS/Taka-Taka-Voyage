/**
 * Navigateur Stack (React Navigation) pour le flux Passager.
 * Non utilisé actuellement : la navigation est gérée par App.js via l'état currentScreen.
 * Conservé pour référence ou migration future vers une navigation Stack.
 */
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import PassagerDashboard from './screens/Passager/PassagerDashboard'
import PersonalInfoScreen from './screens/Passager/PersonalInfoScreen';
import PaymentMethodsScreen from './screens/Passager/PaymentMethodsScreen';
import BenefitsScreen from './screens/Passager/BenefitsScreen';
import LanguageScreen from './screens/Passager/LanguageScreen';
import HelpSupportScreen from './screens/Passager/HelpSupportScreen';
import HelpCenterScreen from './screens/Passager/HelpCenterScreen';
import TermsConditionsScreen from './screens/Passager/TermsConditionsScreen';
import AboutScreen from './screens/Passager/AboutScreen';
import RideOptionsScreen from './screens/Passager/RideOptionsScreen';
import SearchScreen from './screens/Passager/SearchScreen';


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <Stack.Navigator 
            initialRouteName="PassagerDashboard"
            screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen name="PassagerDashboard" component={PassagerDashboard} />
            <Stack.Screen name="PersonalInfo" component={PersonalInfoScreen} />
            <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
            <Stack.Screen name="Benefits" component={BenefitsScreen} />
            <Stack.Screen name="Language" component={LanguageScreen} />
            <Stack.Screen name="HelpSupport" component={HelpSupportScreen} />
            <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
            <Stack.Screen name="TermsConditions" component={TermsConditionsScreen} />
            <Stack.Screen name="About" component={AboutScreen} />
            <Stack.Screen name="RideOptions" component={RideOptionsScreen} />
            <Stack.Screen name="Search" component={SearchScreen} />
        </Stack.Navigator>
    );
}