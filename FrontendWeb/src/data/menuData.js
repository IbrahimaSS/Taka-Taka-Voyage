// src/data/menuData.js
import {
  LayoutDashboard, Users, UserCheck, UserCog,
  Car, CarTaxiFront, CarFront,
  Route, MapPin, Navigation,
  Wallet, CreditCard, Receipt,
  Shield, FileCheck, FileText,
  BarChart3, TrendingUp, PieChart,
  MessageSquare, HelpCircle, Bell,
  Settings, LogOut, ChevronRight,
  Home, Calendar, Package,
  BadgePercent, AlertTriangle,
  Database, Globe, Zap,
  Sparkles, Target, Rocket
} from 'lucide-react';

export const menuStructure = {
  primary: [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      path: '/',
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      notification: 3,
      badge: 'Nouveau'
    }
  ],
  
  management: [
    {
      id: 'users',
      label: 'Utilisateurs',
      icon: Users,
      gradient: 'from-blue-500 via-cyan-500 to-teal-500',
      subItems: [
        {
          id: 'passengers',
          label: 'Passagers',
          icon: UserCheck,
          path: '/passagers',
          count: 245,
          trending: '+12%',
          color: 'text-cyan-500'
        },
        {
          id: 'drivers',
          label: 'Chauffeurs',
          icon: CarTaxiFront,
          path: '/chauffeurs',
          count: 156,
          trending: '+8%',
          color: 'text-emerald-500',
          subMenu: [
            { label: 'Actifs', path: '/chauffeurs/actifs', count: 132 },
            { label: 'En attente', path: '/chauffeurs/en-attente', count: 24, badge: 'new' }
          ]
        },
        {
          id: 'partners',
          label: 'Partenaires',
          icon: UserCog,
          path: '/partenaires',
          count: 42,
          trending: '+5%',
          color: 'text-violet-500'
        }
      ]
    },
    
    {
      id: 'operations',
      label: 'Opérations',
      icon: Package,
      gradient: 'from-emerald-500 via-green-500 to-lime-500',
      subItems: [
        {
          id: 'rides',
          label: 'Trajets',
          icon: Navigation,
          path: '/trajets',
          count: '2.4K',
          trending: '+18%',
          color: 'text-green-500',
          subMenu: [
            { label: 'En cours', path: '/trajets/en-cours', count: 42 },
            { label: 'Complétés', path: '/trajets/complets', count: '2.3K' },
            { label: 'Annulés', path: '/trajets/annules', count: 58 }
          ]
        },
        {
          id: 'navigation',
          label: 'Navigation Live',
          icon: MapPin,
          path: '/navigation',
          count: 89,
          trending: '+23%',
          color: 'text-blue-500',
          badge: 'live'
        }
      ]
    },
    
    {
      id: 'finance',
      label: 'Finance',
      icon: Wallet,
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      subItems: [
        {
          id: 'transactions',
          label: 'Transactions',
          icon: CreditCard,
          path: '/transactions',
          count: '1.2K',
          trending: '+15%',
          color: 'text-amber-500'
        },
        {
          id: 'commissions',
          label: 'Commissions',
          icon: BadgePercent,
          path: '/commissions',
          count: 89,
          trending: '+7%',
          color: 'text-rose-500',
          subMenu: [
            { label: 'Chauffeurs', path: '/commissions/chauffeurs', count: 67 },
            { label: 'Partenaires', path: '/commissions/partenaires', count: 22 }
          ]
        }
      ]
    },
    
    {
      id: 'verification',
      label: 'Vérification',
      icon: Shield,
      gradient: 'from-indigo-500 via-purple-500 to-violet-500',
      subItems: [
        {
          id: 'documents',
          label: 'Documents',
          icon: FileText,
          path: '/documents',
          count: 32,
          trending: '-3%',
          color: 'text-indigo-500',
          subMenu: [
            { label: 'En attente', path: '/documents/en-attente', count: 12, badge: 'alert' },
            { label: 'Approuvés', path: '/documents/approuves', count: 18 },
            { label: 'Rejetés', path: '/documents/rejetes', count: 2 }
          ]
        },
        {
          id: 'validations',
          label: 'Validations',
          icon: FileCheck,
          path: '/validations',
          count: 156,
          trending: '+25%',
          color: 'text-purple-500'
        }
      ]
    }
  ],
  
  analytics: [
    {
      id: 'insights',
      label: 'Analytics',
      icon: BarChart3,
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
      subItems: [
        {
          id: 'reports',
          label: 'Rapports',
          icon: TrendingUp,
          path: '/rapports',
          count: 24,
          trending: '+31%',
          color: 'text-rose-500'
        },
        {
          id: 'analytics',
          label: 'Analytique Avancée',
          icon: PieChart,
          path: '/analytics',
          count: null,
          trending: '+42%',
          color: 'text-fuchsia-500',
          badge: 'pro'
        }
      ]
    },
    
    {
      id: 'support',
      label: 'Support',
      icon: MessageSquare,
      gradient: 'from-sky-500 via-cyan-500 to-blue-500',
      subItems: [
        {
          id: 'disputes',
          label: 'Litiges',
          icon: AlertTriangle,
          path: '/litiges',
          count: 8,
          trending: '-12%',
          color: 'text-orange-500'
        },
        {
          id: 'support-center',
          label: 'Centre Support',
          icon: HelpCircle,
          path: '/support',
          count: 156,
          trending: '+8%',
          color: 'text-sky-500'
        }
      ]
    }
  ]
};

export const quickActions = [
  { id: 'new-driver', label: 'Nouveau Chauffeur', icon: Car, color: 'bg-emerald-500' },
  { id: 'quick-report', label: 'Rapport Rapide', icon: Zap, color: 'bg-blue-500' },
  { id: 'broadcast', label: 'Notification', icon: Bell, color: 'bg-amber-500' },
  { id: 'settings', label: 'Paramètres Rapides', icon: Settings, color: 'bg-purple-500' }
];

export const userMenu = {
  profile: {
    name: 'Fela Baldé',
    email: 'admin@takataka.ci',
    role: 'Super Admin',
    avatarColor: 'from-cyan-500 to-blue-600',
    status: 'en ligne',
    notifications: 5
  },
  shortcuts: [
    { label: 'Mon Profil', icon: UserCog, path: '/profil' },
    { label: 'Paramètres', icon: Settings, path: '/parametres' },
    { label: 'Centre de Support', icon: HelpCircle, path: '/support' },
    { label: 'Documentation', icon: FileText, path: '/docs' }
  ]
};