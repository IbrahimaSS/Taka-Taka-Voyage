# 🚖 Taka-Taka Voyage - Documentation Fonctionnelle Complète

## 📜 Présentation Générale
**Taka-Taka Voyage** est une plateforme de transport intelligente leader en Guinée, conçue pour révolutionner la mobilité urbaine. Elle connecte les passagers à des chauffeurs certifiés via une application web et mobile, tout en garantissant sécurité, transparence et flexibilité.

---

## 👥 1. Les Rôles Utilisateurs

### A. Le Passager
L'utilisateur client qui utilise la plateforme pour ses déplacements quotidiens ou professionnels.
### B. Le Chauffeur
Le partenaire prestataire qui fournit le service de transport après une validation rigoureuse de ses documents.
### C. L'Administrateur (Admin)
Le gestionnaire de la plateforme qui supervise les opérations, valide les chauffeurs, gère les commissions et surveille l'état global du service.

---

## 🚀 2. Parcours Chauffeur & Validation

### 📝 Inscription et Authentification
- **Vérification OTP** : Sécurisation du compte via un code envoyé par email (Brevo) pour valider le numéro de téléphone.
- **Formulaire de Profil** : Saisie des informations personnelles (Nom, Prénom, Photo).

### 📁 Gestion des Documents (KYC)
Le chauffeur doit soumettre quatre documents obligatoires pour travailler :
1. **Permis de conduire** (Recto/Verso).
2. **Carte Grise** du véhicule.
3. **Attestation d'assurance** en cours de validité.
4. **Photo du véhicule** (visibilité de la plaque).

### ⏳ Processus de Validation en Temps Réel
- **Page d'attente dynamique** : Une interface dédiée informe le chauffeur que son dossier est en cours d'examen.
- **Notifications Socket.io** : Dès que l'Admin valide le compte, une notification 🎉 apparaît instantanément sur l'écran du chauffeur.
- **Modale de Succès** : Un overlay avec un lien direct vers la connexion s'affiche pour permettre au chauffeur de commencer immédiatement.

---

## 🗺️ 3. Fonctionnalités Passager (Réservation)

### 📍 Estimation de Trajet
- **Calculateur Intelligent** : Estimation instantanée du prix, de la distance et de la durée en fonction du lieu de départ et d'arrivée.
- **Carte Interactive** : Sélection des points de départ et d'arrivée directement sur une carte dynamique.

### 🚗 Types de Services
- **Course Immédiate** : Pour un départ sans délai.
- **Course Planifiée** : Pour réserver un trajet à une date et heure précises (ex: aéroport, rendez-vous).
- **Taxi-Partage (Carpooling)** : Possibilité de partager un trajet avec d'autres passagers pour diviser les coûts.

### 💳 Paiements et Facturation
- **Modes de Paiement** : Support du paiement en Cash (espèces) et Paiement Digital.
- **Invoices (PDF)** : Génération automatique de factures professionnelles téléchargeables après chaque trajet.

---

## 💰 4. Modèle Économique & Gains

### 💹 Gestion des Gains (80/20)
- **Commission Fixe** : La plateforme prélève une commission transparente de **20%** sur chaque course.
- **Revenus Chauffeurs** : Les chauffeurs perçoivent **80%** du montant de la course.
- **Portefeuille Digital** : Interface permettant aux chauffeurs de suivre leurs revenus cumulés, leurs trajets effectués et leurs paiements en attente.

---

## 🛠️ 5. Interface Administration (Back-Office)

### 📊 Dashboard de Supervision
- Statistiques en temps réel : Nombre d'utilisateurs actifs, chauffeurs en ligne, trajets du jour et revenus totaux.
- Historique récent des 5 derniers trajets effectués sur la plateforme.

### 👮 Gestion des Utilisateurs & Chauffeurs
- **Module de Validation** : Interface pour visualiser les documents envoyés par les chauffeurs et les valider/rejeter.
- **Gestion du Personnel** : Possibilité d'ajouter des modérateurs ou de bloquer des comptes en cas de litige.

### ⚙️ Paramètres & Maintenance
- **Branding Dynamique** : Changement du logo, du nom de la plateforme et des slogans depuis l'interface admin.
- **Mode Maintenance** : Possibilité de suspendre les réservations globalement en un clic (notifie tous les utilisateurs via Socket).

---

## 🤖 6. Innovations Technologiques Intégrées

### 💬 Taka-Assistant (IA Gemini)
Un assistant virtuel basé sur l'IA de Google (Gemini 1.5 Flash) est intégré pour guider les utilisateurs.
- **Accessibilité Vocale 🎤** : Les utilisateurs peuvent parler directement à l'IA via le microphone (Speech-to-Text).
- **Lecture Audio 🔊** : L'IA peut lire ses réponses à haute voix, une fonctionnalité cruciale pour l'inclusion des personnes illettrées.

### 📶 Résilience Réseau (Offline-First) 🛡️
La plateforme est conçue pour fonctionner malgré les coupures de connexion fréquentes :
- **Auto-Sauvegarde** : Les données de trajet sont sauvegardées en temps réel sur le stockage local du téléphone.
- **Restauration d'état** : En cas de rechargement de la page ou de coupure réseau, la session de trajet reprend exactement là où elle s'était arrêtée.
- **Mode Hybride** : Synchronisation automatique entre le stockage local et le serveur dès le retour de la connexion.

### 🌍 Système Multilingue (I18n) 🇫🇷🇬🇧🇬🇳
Pour une inclusion totale, la plateforme supporte désormais plusieurs langues :
- **Phase 1** : Français (par défaut) et Anglais.
- **Phase 2 (Guinée)** : Intégration des langues nationales (**Pular, Soussou, Malinké**) pour faciliter l'usage par tous les citoyens.
- **Détection Automatique** : L'application détecte la langue du téléphone et s'adapte automatiquement.
- **Assistant Polyglotte** : Le Taka-Assistant change de langue dynamiquement et adapte sa synthèse vocale.

### 🔔 Notifications Temps Réel (Socket.io)
...
Système de communication bidirectionnel permettant :
- De notifier les chauffeurs d'une nouvelle validation.
- De suivre la position du chauffeur sur la carte du passager.
- D'informer de l'état du service (Maintenance, Activation).

---

## 🔒 7. Sécurité et Performance
- **Auth Guard** : Protection des routes sensibles selon le rôle (Passager vs Chauffeur vs Admin).
- **API Optimisée** : Backend Node.js/Express avec MongoDB pour une gestion fluide des données.
- **Expérience Utilisateur Premium** : Utilisation de Framer Motion pour des transitions fluides et un design moderne (Glassmorphism).

---
*Ce document résume l'état actuel de la plateforme Taka-Taka Voyage au 21 Février 2026.* 🚖✨
