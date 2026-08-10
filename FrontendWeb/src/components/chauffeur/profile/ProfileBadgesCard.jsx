import { Crown, Award, Star, Clock, MapPin, Users } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../admin/ui/Card';

const BADGES = [
    { id: 1, name: 'Chauffeur Élite', icon: Crown, color: 'text-yellow-600', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', earned: true },
    { id: 2, name: '500 trajets', icon: Award, color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/30', earned: true },
    { id: 3, name: 'Top Note 5★', icon: Star, color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/30', earned: true },
    { id: 4, name: 'Ponctualité 100%', icon: Clock, color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/30', earned: true },
    { id: 5, name: 'Expert Local', icon: MapPin, color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/30', earned: true },
    { id: 6, name: 'Formateur', icon: Users, color: 'text-pink-600', bgColor: 'bg-pink-100 dark:bg-pink-900/30', earned: false },
];

const ProfileBadgesCard = () => (
    <Card className="surface border-none shadow-lg">
        <CardHeader><CardTitle>Distinctions</CardTitle></CardHeader>
        <CardContent>
            <div className="grid grid-cols-3 gap-2">
                {BADGES.map((badge) => (
                    <div key={badge.id} className={`text-center p-2 rounded-xl transition-all ${badge.earned ? 'bg-gray-50 dark:bg-gray-800/50' : 'opacity-30 grayscale'}`}>
                        <div className={`w-12 h-12 rounded-full ${badge.earned ? badge.bgColor : 'bg-gray-200'} flex items-center justify-center mx-auto mb-2`}>
                            <badge.icon className={`w-6 h-6 ${badge.earned ? badge.color : 'text-gray-400'}`} />
                        </div>
                        <p className="text-[10px] font-bold text-gray-900 dark:text-gray-100 uppercase tracking-tighter truncate">{badge.name}</p>
                    </div>
                ))}
            </div>
        </CardContent>
    </Card>
);

export default ProfileBadgesCard;
