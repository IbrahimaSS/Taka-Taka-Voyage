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
                count: 45,
            },
            {
                icon: Users,
                label: 'Utilisateurs',
                path: 'utilisateurs',
                count: 180,
                subItems: [
                    { label: 'Passagers', path: 'utilisateurs', count: 24 },
                    { label: 'Chauffeurs', path: 'chauffeurs', count: 156 },
                ],
            },
            {
                icon: Wallet,
                label: 'Finances',
                path: 'paiements',
                subItems: [
                    { label: 'Paiements', path: 'paiements' },
                    { label: 'Commissions', path: 'commissions' },
                ],
            },
            {
                icon: CheckCircle,
                label: 'Validations',
                path: 'validations',
                count: 12,
                subItems: [
                    { label: 'Documents', path: 'documents', count: 8 },
                    { label: 'Chauffeurs', path: 'validations', count: 4 },
                ],
            },
            {
                icon: AlertTriangle,
                label: 'Litiges',
                path: 'litiges',
                count: 3,
            },
            {
                icon: BarChart3,
                label: 'Rapports',
                path: 'rapports',
            },
        ],
        titles: {
            '': 'Tableau de bord',
            utilisateurs: 'Passagers',
            chauffeurs: 'Chauffeurs',
            trajets: 'Trajets',
            paiements: 'Paiements',
            commissions: 'Commissions',
            validations: 'Validations',
            documents: 'Documents',
            litiges: 'Litiges',
            rapports: 'Rapports',
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
                label: 'Mes Trajets',
                path: 'trips',
                count: 3,
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
            trips: 'Mes Trajets',
            history: 'Historique des trajets',
            revenues: 'Mes Revenus',
            planning: 'Planning',
            settings: 'Paramètres',
            evaluations: 'Mes Évaluations',
            support: 'Centre d\'aide',
            profil: 'Mon Profil Professionnel',
        }
    },
};
