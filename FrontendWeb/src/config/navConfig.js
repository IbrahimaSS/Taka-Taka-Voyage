import {
    LayoutDashboard,
    Users,
    Route,
    Wallet,
    CheckCircle,
    AlertTriangle,
    BarChart3,
    Car,
    Clock,
    DollarSign,
    Calendar,
    Settings,
    User2,
    History,
    Gift,
} from 'lucide-react';

export const ROLES = {
    ADMIN: 'admin',
    CHAUFFEUR: 'chauffeur',
};

export const NAV_CONFIG = {
    [ROLES.ADMIN]: {
        basePath: '/admin',
        title: 'Admin',
        menuItems: [
            {
                icon: LayoutDashboard,
                label: 'Tableau de bord',
                path: '.',
            },
            {
                icon: Route,
                label: 'Trajets',
                path: 'trajets',
            },
            {
                icon: Users,
                label: 'Utilisateurs',
                path: 'utilisateurs',
                subItems: [
                    { label: 'Passagers', path: 'utilisateurs' },
                    { label: 'Chauffeurs', path: 'chauffeurs' },
                ],
            },
            {
                icon: Wallet,
                label: 'Finances',
                path: 'paiements',
                subItems: [
                    { label: 'Paiements', path: 'paiements' },
                    { label: 'Transactions', path: 'transactions' },
                    { label: 'Commissions', path: 'commissions' },
                ],
            },
            {
                icon: CheckCircle,
                label: 'Validations',
                path: 'validations',
                subItems: [
                    { label: 'Documents', path: 'documents' },
                    { label: 'Chauffeurs', path: 'validations' },
                ],
            },
            {
                icon: AlertTriangle,
                label: 'Litiges',
                path: 'litiges',
            },
            {
                icon: Gift,
                label: 'Promotions',
                path: 'promotions',
            },
            {
                icon: Car,
                label: 'Location BTrans',
                path: 'locations',
            },
            {
                icon: BarChart3,
                label: 'Rapports',
                path: 'rapports',
            },
            {
                icon: History,
                label: 'Journal d\'Activités',
                path: 'logs',
            },
        ],
        titles: {
            '': 'Tableau de bord',
            utilisateurs: 'Passagers',
            chauffeurs: 'Chauffeurs',
            trajets: 'Trajets',
            locations: 'Garage Baraka Trans',
            paiements: 'Paiements',
            transactions: 'Gestion du Portefeuille',
            commissions: 'Commissions',
            validations: 'Validations',
            documents: 'Documents',
            litiges: 'Litiges',
            promotions: 'Coupons & Promotions',
            rapports: 'Rapports',
            logs: 'Journal d\'Activités',
            parametres: 'Paramètres',
            profil: 'Profil',
        }
    },
    [ROLES.CHAUFFEUR]: {
        basePath: '/chauffeur',
        title: 'Chauffeur',
        menuItems: [
            {
                icon: LayoutDashboard,
                label: 'Tableau de bord',
                path: '.',
            },
            {
                icon: Car,
                label: 'Mes Demandes',
                path: 'trips',
            },
            {
                icon: Clock,
                label: 'Historique',
                path: 'history',
            },
            {
                icon: DollarSign,
                label: 'Revenus',
                path: 'revenues',
            },
            {
                icon: Calendar,
                label: 'Planning',
                path: 'planning',
            },
            {
                icon: User2,
                label: 'Mes Course',
                path: 'tracking',
            },
            {
                icon: Car,
                label: 'Location BTrans',
                path: 'locations',
                subItems: [
                    { label: 'Réserver', path: 'locations' },
                    { label: 'Mes Locations', path: 'rental-history' },
                ],
            },
            {
                icon: Users,
                label: 'Communauté',
                path: 'community',
            },
            // {
            //     icon: Users,
            //     label: 'Évaluations',
            //     path: 'evaluations',
            // },
            // {
            //     icon: Settings,
            //     label: 'Support',
            //     path: 'support',
            // },
            // {
            //     icon: User2,
            //     label: 'Profil',
            //     path: 'profil',
            // },
        ],
        titles: {
            '': 'Tableau de bord',
            trips: 'Mes Demandes',
            history: 'Historique des trajets',
            revenues: 'Mes Revenus',
            planning: 'Planning',
            locations: 'Garage Baraka Trans',
            community: 'Espace Communauté',
            settings: 'Paramètres',
            evaluations: 'Mes Évaluations',
            support: 'Centre d\'aide',
            profil: 'Mon Profil Professionnel',
        }
    },
};
