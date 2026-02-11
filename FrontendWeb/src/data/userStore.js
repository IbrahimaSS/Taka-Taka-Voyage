import { create } from 'zustand';

export const useUserStore = create((set) => ({
    profile: {
        name: 'Fela Baldé',
        email: 'admin@taka.ci',
        phone: '+224 612 34 56 78',
        role: 'Administrateur principal',
        location: 'Conakry, Guinée',
        joinDate: '15 Janvier 2023',
        position: 'Directeur Administratif',
        bio: 'Passionné par la technologie et l\'innovation dans les transports urbains.',
        avatar: null,
        rating: 4.9,
        todayStats: {
            trips: 8,
            earnings: '82,000 GNF'
        }
    },
    updateProfile: (updates) => set((state) => ({
        profile: { ...state.profile, ...updates }
    })),
}));
