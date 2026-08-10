import { User, Camera, Calendar, Shield, CheckCircle, Car, Award, Briefcase } from 'lucide-react';
import Badge from '../../admin/ui/Badge';

const ProfileHeaderCard = ({ profileData, setProfileData, isEditing, fileInputRef, onImageUpload, getImageUrl }) => (
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-primary-600 to-secondary-600 flex items-center justify-center shadow-lg overflow-hidden border-4 border-white dark:border-gray-700 relative">
                {profileData.avatar ? (
                    <img
                        src={getImageUrl(profileData.avatar)}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white text-3xl font-bold">
                        {profileData.prenom && profileData.nom ? (
                            `${profileData.prenom[0]}${profileData.nom[0]}`
                        ) : (
                            <User className="w-16 h-16" />
                        )}
                    </div>
                )}
            </div>
            <input type="file" ref={fileInputRef} onChange={onImageUpload} accept="image/*" className="hidden" />
            {isEditing && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-11 h-11 bg-primary-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-primary-700 transition-colors border-2 border-white dark:border-gray-800 animate-in zoom-in duration-200 z-20"
                >
                    <Camera className="w-5 h-5 z-10" />
                </button>
            )}
        </div>

        <div className="text-center sm:text-left min-w-0">
            <div className="flex items-center justify-center sm:justify-start space-x-4 mb-2">
                {isEditing ? (
                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                        <input
                            type="text"
                            placeholder="Prénom"
                            value={profileData.prenom}
                            onChange={(e) => setProfileData({ ...profileData, prenom: e.target.value })}
                            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-primary-500 focus:outline-none w-full sm:w-40"
                        />
                        <input
                            type="text"
                            placeholder="Nom"
                            value={profileData.nom}
                            onChange={(e) => setProfileData({ ...profileData, nom: e.target.value })}
                            className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 bg-transparent border-b-2 border-primary-500 focus:outline-none w-full sm:w-40"
                        />
                    </div>
                ) : (
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 truncate">
                        {profileData.prenom} {profileData.nom}
                    </h3>
                )}
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-4">
                <Badge variant="success" size="xs"><CheckCircle className="w-3 h-3 mr-1" />Permis Valide</Badge>
                <Badge variant="info" size="xs"><Car className="w-3 h-3 mr-1" />Véhicule OK</Badge>
                <Badge variant="warning" size="xs"><Award className="w-3 h-3 mr-1" />Ambassadeur</Badge>
            </div>
            <div className="space-y-1 text-sm text-gray-500 dark:text-gray-400">
                <p className="flex items-center justify-center sm:justify-start"><Briefcase className="w-4 h-4 mr-2 text-primary-500 shrink-0" />Chauffeur Professionnel</p>
                <p className="flex items-center justify-center sm:justify-start"><Calendar className="w-4 h-4 mr-2 text-primary-500 shrink-0" />Inscrit en {profileData.joinDate || 'Janvier 2024'}</p>
            </div>
        </div>
    </div>
);

export default ProfileHeaderCard;
