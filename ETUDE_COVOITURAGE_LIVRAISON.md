# 📋 ÉTUDE COMPLÈTE ET FONCTIONNELLE
## Covoiturage & Livraison de Colis — TAKA TAKA VOYAGE

**Date :** 28 Février 2026  
**Version :** 1.0  
**Projet :** Taka Taka Voyage  

---

# 📑 TABLE DES MATIÈRES

1. [FONCTIONNALITÉ 1 : COVOITURAGE](#fonctionnalité-1--covoiturage)
   - [1.1 Description générale](#11-description-générale)
   - [1.2 Acteurs et rôles](#12-acteurs-et-rôles)
   - [1.3 Flux utilisateur détaillé](#13-flux-utilisateur-détaillé)
   - [1.4 Modèles de données (Backend)](#14-modèles-de-données-backend)
   - [1.5 Routes API](#15-routes-api)
   - [1.6 Socket.IO (Temps réel)](#16-socketio-temps-réel)
   - [1.7 Composants Frontend](#17-composants-frontend)
   - [1.8 Règles métier](#18-règles-métier)
   - [1.9 Intégration avec l'existant](#19-intégration-avec-lexistant)

2. [FONCTIONNALITÉ 2 : LIVRAISON DE COLIS](#fonctionnalité-2--livraison-de-colis)
   - [2.1 Description générale](#21-description-générale)
   - [2.2 Acteurs et rôles](#22-acteurs-et-rôles)
   - [2.3 Flux utilisateur détaillé](#23-flux-utilisateur-détaillé)
   - [2.4 Modèles de données (Backend)](#24-modèles-de-données-backend)
   - [2.5 Routes API](#25-routes-api)
   - [2.6 Socket.IO (Temps réel)](#26-socketio-temps-réel)
   - [2.7 Composants Frontend](#27-composants-frontend)
   - [2.8 Règles métier](#28-règles-métier)
   - [2.9 Intégration avec l'existant](#29-intégration-avec-lexistant)

3. [MODIFICATIONS COMMUNES](#modifications-communes)
4. [PLAN D'IMPLÉMENTATION](#plan-dimplémentation)

---

# FONCTIONNALITÉ 1 : COVOITURAGE

## 1.1 Description générale

Le covoiturage permet à un **passager** de partager un trajet avec d'autres passagers allant dans la **même direction** ou vers une **destination proche**, en utilisant un seul véhicule (Taxi ou Voiture). Chaque passager paie **sa part** du trajet, ce qui réduit le coût pour tous.

### Différence avec le "Taxi partagé" actuel
| | Taxi partagé actuel | Covoiturage (nouveau) |
|---|---|---|
| **Initiation** | 1 seul passager réserve | 1 passager crée, d'autres rejoignent |
| **Passagers** | 1 seul passager par course | 2 à 4 passagers par course |
| **Prix** | Prix fixe pour 1 passager | Prix divisé entre les passagers |
| **Itinéraire** | Point A → Point B | Point A → (ramassage B, C) → (dépôt B) → Point A final |
| **Recherche** | Le passager cherche un chauffeur | Le passager cherche un trajet existant OU crée le sien |

---

## 1.2 Acteurs et rôles

| Acteur | Rôle dans le covoiturage |
|--------|--------------------------|
| **Passager créateur** | Crée la course de covoiturage, définit l'itinéraire principal |
| **Passager rejoignant** | Rejoint une course existante si son itinéraire est compatible |
| **Chauffeur** | Conduit le véhicule, gère les arrêts multiples |
| **Admin** | Supervise, configure les paramètres, gère les litiges |

---

## 1.3 Flux utilisateur détaillé

### 🚶 Flux Passager — Créer un covoiturage

```
1. Le passager ouvre la section "Réserver"
2. Il saisit son départ et sa destination
3. Il choisit le type "Covoiturage" (nouveau bouton)
4. Il définit le nombre de places disponibles (1 à 3 co-passagers)
5. Le système calcule le prix TOTAL du trajet
6. Le système cherche un chauffeur disponible (flux existant)
7. Le chauffeur accepte → la course est créée en mode "COVOITURAGE"
8. La course apparaît dans la liste des covoiturages disponibles
9. D'autres passagers peuvent rejoindre tant qu'il reste des places
10. Le prix est automatiquement recalculé et DIVISÉ entre tous les passagers
```

### 🚶 Flux Passager — Rejoindre un covoiturage

```
1. Le passager ouvre la section "Réserver"
2. Il saisit son départ et sa destination
3. Le système propose les covoiturages compatibles (même direction, < 2km de déviation)
4. Le passager voit : itinéraire, prix estimé (sa part), places restantes, heure de passage
5. Il clique "Rejoindre" → le système ajoute son arrêt à l'itinéraire
6. Le chauffeur reçoit une notification avec le nouvel arrêt
7. Le prix est recalculé et divisé entre tous les passagers
8. Le passager suit le trajet en temps réel (position du véhicule)
```

### 🚕 Flux Chauffeur — Covoiturage

```
1. Le chauffeur reçoit la course de covoiturage (comme une course normale)
2. L'interface affiche tous les arrêts dans l'ordre optimal
3. Pour chaque passager :
   a. Navigation vers le point de ramassage
   b. Bouton "Passager récupéré" (confirme le ramassage)
   c. Navigation vers le point de dépôt
   d. Bouton "Passager déposé" (confirme la dépose)
4. Une fois tous les passagers déposés → course terminée
5. Le chauffeur reçoit le paiement TOTAL (somme de toutes les parts)
```

### 👨‍💼 Flux Admin

```
1. Dashboard → nouvelle statistique "Covoiturages aujourd'hui"
2. Section Trajets → filtre par type "COVOITURAGE"
3. Détails → voir tous les passagers d'un covoiturage, leurs arrêts, leur part
4. Litiges → gérer les litiges multi-passagers
5. Paramètres → configurer le rayon de compatibilité (km), le % de réduction
```

---

## 1.4 Modèles de données (Backend)

### Modification du modèle `Reservations.js`
```javascript
// Ajouts au schéma existant :

typeVehicule: {
    type: String,
    enum: ["MOTO", "TAXI", "VOITURE", "BUS", "COVOITURAGE"], // ← Ajout
    required: true,
},

typeCourse: {
    type: String,
    enum: ["IMMEDIATE", "PLANIFIEE", "COVOITURAGE"], // ← Ajout
    default: "IMMEDIATE",
},

// === NOUVEAUX CHAMPS COVOITURAGE ===
covoiturage: {
    // Est-ce une course de covoiturage ?
    actif: { type: Boolean, default: false },

    // Nombre max de co-passagers (hors créateur)
    placesMax: { type: Number, default: 3, min: 1, max: 3 },

    // Passagers qui ont rejoint (tableau)
    passagers: [{
        utilisateur: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Utilisateurs",
            required: true
        },
        depart: { type: String, required: true },
        destination: { type: String, required: true },
        departCoords: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: [0, 0] }
        },
        destinationCoords: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: { type: [Number], default: [0, 0] }
        },
        prixPart: { type: Number, required: true },     // Part de ce passager
        statut: {
            type: String,
            enum: ["EN_ATTENTE", "RECUPERE", "DEPOSE", "ANNULE"],
            default: "EN_ATTENTE"
        },
        dateRecuperation: { type: Date, default: null },
        dateDepose: { type: Date, default: null },
        rejointLe: { type: Date, default: Date.now }
    }],

    // Itinéraire optimisé avec tous les arrêts
    arrets: [{
        type: { type: String, enum: ["RAMASSAGE", "DEPOT"] },
        passager: { type: mongoose.Schema.Types.ObjectId, ref: "Utilisateurs" },
        adresse: String,
        coords: {
            type: { type: String, enum: ["Point"], default: "Point" },
            coordinates: [Number]
        },
        ordre: Number,         // Ordre dans l'itinéraire
        statut: {
            type: String,
            enum: ["A_FAIRE", "FAIT"],
            default: "A_FAIRE"
        }
    }],

    // Prix total et calcul
    prixTotal: { type: Number },
    prixParPassager: { type: Number },
    deviationMaxKm: { type: Number, default: 2 }   // Déviation max autorisée
}
```

### Modification du modèle `ParametresPlateforme.js`
```javascript
// Ajout dans la section services :
covoiturage: {
    name: { type: String, default: 'Covoiturage' },
    enabled: { type: Boolean, default: true },
    description: { type: String, default: 'Partagez un véhicule, divisez les frais' },
    // Paramètres spécifiques au covoiturage
    deviationMaxKm: { type: Number, default: 2 },        // Max 2km de déviation
    reductionPourcentage: { type: Number, default: 20 },  // 20% de réduction vs course solo
    placesMaxParDefaut: { type: Number, default: 3 },
    tempsAttenteMaxMin: { type: Number, default: 10 },    // Max 10 min entre chaque arrêt
    commissionPlateforme: { type: Number, default: 15 },  // 15% de commission
}
```

---

## 1.5 Routes API

### Routes Passager — Covoiturage
```
POST   /passager/covoiturage/creer           → Créer une course de covoiturage
GET    /passager/covoiturage/disponibles      → Lister les covoiturages disponibles (par localisation)
POST   /passager/covoiturage/:id/rejoindre    → Rejoindre un covoiturage existant
DELETE /passager/covoiturage/:id/quitter      → Quitter un covoiturage (avant départ)
GET    /passager/covoiturage/:id/statut       → Statut détaillé avec tous les passagers
```

### Routes Chauffeur — Covoiturage
```
GET    /chauffeur/covoiturage/:id/arrets      → Liste ordonnée des arrêts
PATCH  /chauffeur/covoiturage/:id/arret/:arretId/fait  → Marquer un arrêt comme fait
```

### Routes Admin — Covoiturage
```
GET    /admin/covoiturage/stats               → Statistiques covoiturage
GET    /admin/trajets?type=COVOITURAGE        → Filtrer les trajets de covoiturage
```

---

## 1.6 Socket.IO (Temps réel)

### Nouveaux événements :
```javascript
// Côté passager
"covoiturage:nouveau-passager"    // Quand un nouveau passager rejoint
"covoiturage:passager-quitte"     // Quand un passager quitte
"covoiturage:prix-mis-a-jour"     // Quand le prix par personne change
"covoiturage:arret-fait"          // Quand un arrêt est terminé (ramassage/dépôt)

// Côté chauffeur
"covoiturage:nouveau-arret"       // Nouvel arrêt ajouté à l'itinéraire
"covoiturage:arret-annule"        // Un passager a annulé son arrêt

// Côté admin
"covoiturage:cree"                // Nouvelle course de covoiturage créée
"covoiturage:complet"             // Plus de places disponibles
```

---

## 1.7 Composants Frontend

### Passager
| Fichier | Description |
|---------|-------------|
| `BookingSection.jsx` | **Modifier** — Ajouter l'option "Covoiturage" dans les types de véhicule |
| `CovoiturageList.jsx` | **Nouveau** — Liste des covoiturages disponibles avec carte |
| `CovoiturageCard.jsx` | **Nouveau** — Carte d'un covoiturage (itinéraire, passagers, prix, places) |
| `CovoiturageDetails.jsx` | **Nouveau** — Détails complets avec suivi des arrêts |
| `TripStatusModal.jsx` | **Modifier** — Ajouter la vue multi-arrêts |

### Chauffeur
| Fichier | Description |
|---------|-------------|
| `TripNotificationToast.jsx` | **Modifier** — Afficher "Covoiturage - X passagers" |
| `ChauffeurTracking.jsx` | **Modifier** — Ajouter la liste des arrêts et boutons par passager |
| `CovoiturageArrets.jsx` | **Nouveau** — Panneau latéral avec tous les arrêts ordonnés |

### Admin
| Fichier | Description |
|---------|-------------|
| `Trajets.jsx` | **Modifier** — Ajouter filtre "Covoiturage", afficher nb passagers |
| `Dashboard.jsx` | **Modifier** — Ajouter stat "Covoiturages aujourd'hui" |
| `Settings.jsx` | **Modifier** — Paramètres covoiturage (déviation max, réduction, etc.) |

---

## 1.8 Règles métier

| # | Règle | Détail |
|---|-------|--------|
| R1 | **Compatibilité** | Un passager peut rejoindre si sa déviation < `deviationMaxKm` (défaut : 2 km) |
| R2 | **Places** | Maximum 3 co-passagers + le créateur = 4 passagers max |
| R3 | **Prix** | Prix total calculé sur l'itinéraire complet, puis divisé par le nombre de passagers |
| R4 | **Réduction** | Chaque passager bénéficie de `reductionPourcentage` % de réduction vs une course solo |
| R5 | **Commission** | La plateforme prend sa commission sur le prix TOTAL (pas par passager) |
| R6 | **Annulation** | Un passager peut quitter avant le départ. Le prix est recalculé pour les restants |
| R7 | **Temps d'attente** | Max `tempsAttenteMaxMin` minutes entre chaque arrêt de ramassage |
| R8 | **Itinéraire** | L'ordre des arrêts est calculé automatiquement pour optimiser le trajet |
| R9 | **Paiement** | Chaque passager paie sa part individuellement (même méthode que les courses normales) |
| R10 | **Type de véhicule** | Covoiturage possible uniquement en Taxi ou Voiture (pas Moto, pas Camion) |

### Calcul du prix
```
Prix unitaire (course solo) = basePrice + (distanceKm × perKm) + (dureeMin × perMinute)
Prix covoiturage total = Prix_itinéraire_complet × (1 - réduction/100)
Prix par passager = Prix covoiturage total / nombre_de_passagers
```

---

## 1.9 Intégration avec l'existant

| Élément existant | Modification |
|------------------|-------------|
| `Reservations.js` (modèle) | Ajouter champs `covoiturage.*`, enum `COVOITURAGE` |
| `Trajets.js` (modèle) | Ajouter référence vers les co-passagers |
| `Paiements.js` (modèle) | Ajouter champ `partCovoiturage` (booléen) |
| `ChauffeurProfile.js` (modèle) | Inchangé (le chauffeur ne change pas) |
| `socket.js` | Ajouter les événements covoiturage |
| `estimationsControllers.js` | Ajouter `COVOITURAGE` dans le mapping |
| `BookingSection.jsx` | Ajouter bouton + logique covoiturage |
| `navConfig.js` | Inchangé (les covoiturages sont dans "Trajets") |
| `adminService.js` | Ajouter les endpoints covoiturage |
| `i18n` (fr.json, en.json) | Ajouter les traductions covoiturage |

---
---

# FONCTIONNALITÉ 2 : LIVRAISON DE COLIS

## 2.1 Description générale

La livraison de colis permet à un **expéditeur** (passager) d'envoyer un colis à un **destinataire** via un chauffeur de la plateforme. L'expéditeur décrit son colis, le chauffeur le récupère et le livre. Le destinataire confirme la réception.

### Les 3 acteurs d'une livraison
```
EXPÉDITEUR ──→ CHAUFFEUR ──→ DESTINATAIRE
(celui qui paie)  (transporte)   (reçoit le colis)
```

---

## 2.2 Acteurs et rôles

| Acteur | Rôle |
|--------|------|
| **Expéditeur** (passager) | Commande la livraison, décrit le colis, paie |
| **Destinataire** | Reçoit le colis, confirme la réception (par code ou signature) |
| **Chauffeur** | Récupère le colis, le transporte, le livre |
| **Admin** | Supervise, gère les litiges liés aux colis |

---

## 2.3 Flux utilisateur détaillé

### 📦 Flux Expéditeur — Commander une livraison

```
1. Le passager ouvre la section "Réserver"
2. Il choisit le type "Livraison de colis" (nouvelle option)
3. Il saisit :
   a. Adresse de RAMASSAGE (son adresse ou une autre)
   b. Adresse de LIVRAISON (adresse du destinataire)
   c. Description du colis (texte libre)
   d. Catégorie du colis (Documents, Petit colis, Colis moyen, Gros colis)
   e. Poids estimé (optionnel)
   f. Photo du colis (optionnel, via upload)
   g. Nom et téléphone du DESTINATAIRE
   h. Instructions spéciales (optionnel : "Fragile", "Ne pas plier", etc.)
4. Le système calcule le prix (basé sur la distance + catégorie de colis)
5. Le passager confirme et choisit son mode de paiement
6. Le système cherche un chauffeur disponible à proximité
7. Le chauffeur accepte
8. L'expéditeur reçoit un CODE DE RAMASSAGE (4 chiffres)
9. Le chauffeur se rend au point de ramassage
```

### 🚕 Flux Chauffeur — Livrer un colis

```
1. Le chauffeur reçoit une notification "Livraison de colis"
   → Affiche : adresse de ramassage, adresse de livraison, catégorie, distance, prix
2. Il accepte la livraison
3. Il se rend au point de ramassage (navigation GPS)
4. À l'arrivée :
   a. Il clique "Arrivé au point de ramassage"
   b. L'expéditeur lui donne le CODE DE RAMASSAGE
   c. Le chauffeur saisit le code → vérifie
   d. Le chauffeur prend une PHOTO du colis (preuve de l'état)
   e. Il clique "Colis récupéré"
5. Il se rend au point de livraison (navigation GPS)
6. À l'arrivée :
   a. Il clique "Arrivé au point de livraison"
   b. Le destinataire reçoit un SMS/notification avec un CODE DE LIVRAISON
   c. Le destinataire donne le code au chauffeur
   d. Le chauffeur saisit le code → vérifie
   e. Le chauffeur prend une PHOTO de la livraison (preuve)
   f. Il clique "Colis livré"
7. La course est marquée TERMINEE
8. Le chauffeur reçoit son paiement
```

### 📱 Flux Destinataire (sans compte)

```
1. Le destinataire reçoit un SMS :
   "Bonjour [nom], un colis de la part de [expéditeur] est en route vers vous.
    Chauffeur : [nom chauffeur], Tél : [numéro]
    Code de livraison : [XXXX]
    Suivi en direct : [lien web]"
2. Le destinataire peut :
   a. Suivre le chauffeur en temps réel via le lien web (page publique)
   b. Appeler le chauffeur
   c. Donner le code au chauffeur à la livraison
```

### 👨‍💼 Flux Admin

```
1. Dashboard → statistique "Livraisons aujourd'hui"
2. Section Trajets → filtre par type "LIVRAISON"
3. Détails → voir expéditeur, destinataire, description colis, photos
4. Litiges → gérer les litiges (colis endommagé, non livré, etc.)
5. Paramètres → tarifs par catégorie de colis, activer/désactiver le service
```

---

## 2.4 Modèles de données (Backend)

### Nouveau modèle `Livraisons.js`
```javascript
const mongoose = require("mongoose");

const livraisonSchema = new mongoose.Schema({
    // Lien avec la réservation
    reservation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Reservation",
        required: true,
        unique: true
    },

    // Expéditeur (le passager qui commande)
    expediteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        required: true
    },

    // Chauffeur
    chauffeur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Utilisateurs",
        default: null
    },

    // Destinataire (pas forcément un utilisateur inscrit)
    destinataire: {
        nom: { type: String, required: true },
        telephone: { type: String, required: true },
        email: { type: String, default: null }
    },

    // Adresses
    adresseRamassage: { type: String, required: true },
    adresseLivraison: { type: String, required: true },
    ramassageCoords: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }
    },
    livraisonCoords: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }
    },

    // Description du colis
    colis: {
        description: { type: String, required: true },
        categorie: {
            type: String,
            enum: ["DOCUMENTS", "PETIT_COLIS", "COLIS_MOYEN", "GROS_COLIS"],
            required: true
        },
        poidsKg: { type: Number, default: null },
        instructions: { type: String, default: "" },
        photoExpedition: { type: String, default: null },    // URL photo avant envoi
        photoRamassage: { type: String, default: null },     // URL photo au ramassage
        photoLivraison: { type: String, default: null }      // URL photo à la livraison
    },

    // Codes de sécurité
    codeRamassage: { type: String, required: true },         // Code 4 chiffres
    codeLivraison: { type: String, required: true },         // Code 4 chiffres
    codeRamassageVerifie: { type: Boolean, default: false },
    codeLivraisonVerifie: { type: Boolean, default: false },

    // Statuts de la livraison
    statut: {
        type: String,
        enum: [
            "EN_ATTENTE",           // En attente d'un chauffeur
            "CHAUFFEUR_ASSIGNE",    // Chauffeur trouvé
            "EN_ROUTE_RAMASSAGE",   // Chauffeur en route vers l'expéditeur
            "ARRIVE_RAMASSAGE",     // Chauffeur arrivé au point de ramassage
            "COLIS_RECUPERE",       // Colis récupéré par le chauffeur
            "EN_TRANSIT",           // Colis en route vers le destinataire
            "ARRIVE_LIVRAISON",     // Chauffeur arrivé au point de livraison
            "LIVRE",               // Colis livré et confirmé
            "ECHEC_LIVRAISON",     // Échec (destinataire absent, adresse incorrecte...)
            "RETOURNE",            // Colis retourné à l'expéditeur
            "ANNULE"               // Annulé
        ],
        default: "EN_ATTENTE"
    },

    // Historique des statuts
    historique: [{
        statut: String,
        date: { type: Date, default: Date.now },
        commentaire: { type: String, default: "" },
        photo: { type: String, default: null }
    }],

    // Tarification
    prix: { type: Number, required: true },
    distanceKm: { type: Number, required: true },
    dureeEstimeeMin: { type: Number, required: true },

    // Dates clés
    dateRamassage: { type: Date, default: null },
    dateLivraison: { type: Date, default: null },

    // Suivi public (pour le destinataire sans compte)
    lienSuivi: { type: String, unique: true },  // UUID unique pour le lien public

    // Évaluation
    evaluationExpediteur: {
        note: { type: Number, min: 1, max: 5 },
        commentaire: String,
        date: Date
    }
}, { timestamps: true });

// Index
livraisonSchema.index({ expediteur: 1, createdAt: -1 });
livraisonSchema.index({ chauffeur: 1, statut: 1 });
livraisonSchema.index({ lienSuivi: 1 });
livraisonSchema.index({ "destinataire.telephone": 1 });

module.exports = mongoose.model("Livraison", livraisonSchema);
```

### Modification du modèle `Reservations.js`
```javascript
// Ajout dans les enum :
typeVehicule: {
    type: String,
    enum: ["MOTO", "TAXI", "VOITURE", "BUS", "LIVRAISON"], // ← Ajout
    required: true,
},

typeCourse: {
    type: String,
    enum: ["IMMEDIATE", "PLANIFIEE", "LIVRAISON"], // ← Ajout
    default: "IMMEDIATE",
},

// Nouveau champ optionnel :
livraison: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Livraison",
    default: null
},
```

### Modification du modèle `ParametresPlateforme.js`
```javascript
// Modifier le service delivery existant :
delivery: {
    name: { type: String, default: 'Livraison' },
    enabled: { type: Boolean, default: true },          // ← Activer !
    description: { type: String, default: 'Service de livraison de colis' },
    basePrice: { type: Number, default: 3000 },
    perKm: { type: Number, default: 1000 },
    perMinute: { type: Number, default: 200 },
    minimumFare: { type: Number, default: 3000 },
    // Tarifs par catégorie de colis
    supplements: {
        DOCUMENTS: { type: Number, default: 0 },        // Pas de supplément
        PETIT_COLIS: { type: Number, default: 2000 },    // +2000 GNF
        COLIS_MOYEN: { type: Number, default: 5000 },    // +5000 GNF
        GROS_COLIS: { type: Number, default: 10000 },    // +10000 GNF
    },
    poidsMaxKg: { type: Number, default: 30 },           // Poids max 30 kg
    commissionPlateforme: { type: Number, default: 15 },
},
```

---

## 2.5 Routes API

### Routes Passager (Expéditeur) — Livraison
```
POST   /passager/livraison/creer              → Créer une commande de livraison
GET    /passager/livraison/mes-livraisons      → Historique des livraisons
GET    /passager/livraison/:id                 → Détail d'une livraison
PATCH  /passager/livraison/:id/annuler         → Annuler (avant ramassage uniquement)
POST   /passager/livraison/:id/evaluer         → Évaluer la livraison
```

### Routes Chauffeur — Livraison
```
GET    /chauffeur/livraison/:id                → Détails de la livraison assignée
PATCH  /chauffeur/livraison/:id/arrive-ramassage     → Arrivé au point de ramassage
POST   /chauffeur/livraison/:id/verifier-code-ramassage  → Vérifier code ramassage
PATCH  /chauffeur/livraison/:id/colis-recupere       → Confirmer le ramassage + photo
PATCH  /chauffeur/livraison/:id/arrive-livraison     → Arrivé au point de livraison
POST   /chauffeur/livraison/:id/verifier-code-livraison  → Vérifier code livraison
PATCH  /chauffeur/livraison/:id/livre                → Confirmer la livraison + photo
PATCH  /chauffeur/livraison/:id/echec                → Signaler échec de livraison
```

### Routes Admin — Livraison
```
GET    /admin/livraison/stats                  → Statistiques des livraisons
GET    /admin/livraison/liste                  → Liste de toutes les livraisons
GET    /admin/livraison/:id                    → Détail d'une livraison
```

### Route publique (Destinataire — sans authentification)
```
GET    /suivi/:lienSuivi                       → Page publique de suivi en temps réel
```

---

## 2.6 Socket.IO (Temps réel)

### Nouveaux événements :
```javascript
// Côté expéditeur
"livraison:chauffeur-assigne"        // Chauffeur trouvé
"livraison:en-route-ramassage"       // Chauffeur en route
"livraison:colis-recupere"           // Colis récupéré
"livraison:en-transit"               // Colis en transit
"livraison:arrive-livraison"         // Arrivé chez le destinataire
"livraison:livre"                    // Colis livré et confirmé
"livraison:echec"                    // Échec de livraison

// Côté chauffeur
"livraison:nouvelle"                 // Nouvelle demande de livraison
"livraison:annulee"                  // Livraison annulée par l'expéditeur

// Côté destinataire (via lien public)
"livraison:position-chauffeur"       // Position GPS du chauffeur
"livraison:statut-change"            // Changement de statut

// Côté admin
"livraison:creee"                    // Nouvelle livraison
"livraison:terminee"                 // Livraison terminée
"livraison:echec"                    // Échec de livraison
```

---

## 2.7 Composants Frontend

### Passager (Expéditeur)
| Fichier | Description |
|---------|-------------|
| `BookingSection.jsx` | **Modifier** — Ajouter l'option "Livraison de colis" |
| `LivraisonForm.jsx` | **Nouveau** — Formulaire complet (destinataire, description colis, photo, catégorie) |
| `LivraisonSuivi.jsx` | **Nouveau** — Suivi en temps réel avec timeline des statuts |
| `LivraisonHistorique.jsx` | **Nouveau** — Historique de toutes les livraisons |
| `LivraisonDetail.jsx` | **Nouveau** — Détails complets (photos, codes, statuts) |

### Chauffeur
| Fichier | Description |
|---------|-------------|
| `TripNotificationToast.jsx` | **Modifier** — Afficher "Livraison de colis - [catégorie]" |
| `ChauffeurTracking.jsx` | **Modifier** — Adapter le flux pour la livraison (2 arrêts : ramassage + livraison) |
| `LivraisonCodeVerification.jsx` | **Nouveau** — Saisie et vérification des codes |
| `LivraisonPhotoCapture.jsx` | **Nouveau** — Capture photo du colis (ramassage + livraison) |

### Page publique (Destinataire)
| Fichier | Description |
|---------|-------------|
| `SuiviPublic.jsx` | **Nouveau** — Page accessible sans connexion, carte temps réel, timeline |

### Admin
| Fichier | Description |
|---------|-------------|
| `Trajets.jsx` | **Modifier** — Ajouter filtre "Livraison", afficher infos colis |
| `Dashboard.jsx` | **Modifier** — Ajouter stat "Livraisons aujourd'hui" |
| `Settings.jsx` | **Modifier** — Paramètres livraison (tarifs, catégories, poids max) |

---

## 2.8 Règles métier

| # | Règle | Détail |
|---|-------|--------|
| R1 | **Codes** | Codes de 4 chiffres générés aléatoirement pour chaque livraison |
| R2 | **Photos** | Le chauffeur DOIT prendre une photo au ramassage ET à la livraison |
| R3 | **Annulation** | L'expéditeur peut annuler AVANT le ramassage. Après → litige |
| R4 | **Poids** | Poids max : `poidsMaxKg` (défaut : 30 kg). Au-delà → refus |
| R5 | **Supplément** | Le prix final = prix_distance + supplément_catégorie |
| R6 | **SMS** | Le destinataire reçoit un SMS à la création + quand le chauffeur part |
| R7 | **Suivi public** | Le destinataire peut suivre via un lien sans compte |
| R8 | **Échec** | En cas d'échec, le colis peut être retourné à l'expéditeur (nouvelle course) |
| R9 | **Types de véhicule** | Livraison possible en Moto (petits colis) ou Voiture (gros colis) |
| R10 | **Évaluation** | Seul l'expéditeur peut évaluer la livraison |

### Calcul du prix
```
Prix livraison = basePrice + (distanceKm × perKm) + (dureeMin × perMinute) + supplement[categorie]
Prix minimum   = max(prix_calculé, minimumFare)
Commission     = Prix × (commissionPlateforme / 100)
Chauffeur reçoit = Prix - Commission
```

### Exemple de tarification
```
Livraison d'un PETIT_COLIS sur 5 km (15 min) :
= 3000 (base) + 5×1000 (distance) + 15×200 (temps) + 2000 (supplément)
= 3000 + 5000 + 3000 + 2000
= 13 000 GNF

Commission plateforme (15%) : 1 950 GNF
Chauffeur reçoit : 11 050 GNF
```

---

## 2.9 Intégration avec l'existant

| Élément existant | Modification |
|------------------|-------------|
| `Reservations.js` | Ajouter enum `LIVRAISON`, champ `livraison` (ref) |
| `ParametresPlateforme.js` | Activer `delivery`, ajouter `supplements` et `poidsMaxKg` |
| `estimationsControllers.js` | Déjà prêt ! (mapping `LIVRAISON → delivery` existe) |
| `socket.js` | Ajouter les événements livraison |
| `BookingSection.jsx` | Ajouter le bouton + le formulaire de livraison |
| `ChauffeurTracking.jsx` | Adapter le flux pour les 2 arrêts |
| `TripNotificationToast.jsx` | Afficher le badge "Livraison" + catégorie |
| `App.jsx` / Router | Ajouter la route publique `/suivi/:id` |
| `adminService.js` | Ajouter les endpoints livraison |
| `i18n` (fr.json, en.json) | Ajouter les traductions livraison |
| `navConfig.js` | Inchangé (les livraisons sont dans "Trajets") |

---
---

# MODIFICATIONS COMMUNES

## Fichiers impactés par les DEUX fonctionnalités

| Fichier | Covoiturage | Livraison |
|---------|:-----------:|:---------:|
| `Reservations.js` (modèle) | ✅ | ✅ |
| `ParametresPlateforme.js` (modèle) | ✅ | ✅ |
| `estimationsControllers.js` | ✅ | ✅ |
| `socket.js` | ✅ | ✅ |
| `BookingSection.jsx` | ✅ | ✅ |
| `ChauffeurTracking.jsx` | ✅ | ✅ |
| `TripNotificationToast.jsx` | ✅ | ✅ |
| `Dashboard.jsx` (admin) | ✅ | ✅ |
| `Trajets.jsx` (admin) | ✅ | ✅ |
| `Settings.jsx` (admin) | ✅ | ✅ |
| `fr.json` / `en.json` | ✅ | ✅ |

---

# PLAN D'IMPLÉMENTATION

## Phase 1 : Livraison de colis (Priorité haute — Plus simple)
**Durée estimée : 3-5 jours**

| Étape | Tâche | Durée |
|-------|-------|-------|
| 1.1 | Créer le modèle `Livraisons.js` | 1h |
| 1.2 | Modifier `Reservations.js` (enums) | 30 min |
| 1.3 | Activer et étendre `delivery` dans `ParametresPlateforme.js` | 30 min |
| 1.4 | Créer les routes + contrôleurs backend (passager, chauffeur, admin, public) | 4h |
| 1.5 | Ajouter les événements Socket.IO | 2h |
| 1.6 | Frontend : `LivraisonForm.jsx` (formulaire) | 3h |
| 1.7 | Frontend : `LivraisonSuivi.jsx` + `LivraisonDetail.jsx` | 3h |
| 1.8 | Frontend : Modifier `BookingSection.jsx` (ajout option) | 1h |
| 1.9 | Frontend : Modifier `ChauffeurTracking.jsx` (flux livraison) | 2h |
| 1.10 | Frontend : `LivraisonCodeVerification.jsx` + `LivraisonPhotoCapture.jsx` | 2h |
| 1.11 | Frontend : `SuiviPublic.jsx` (page publique destinataire) | 2h |
| 1.12 | Frontend : Modifier admin (Dashboard, Trajets, Settings) | 2h |
| 1.13 | Traductions i18n | 1h |
| 1.14 | Tests et corrections | 2h |

## Phase 2 : Covoiturage (Priorité moyenne — Plus complexe)
**Durée estimée : 5-7 jours**

| Étape | Tâche | Durée |
|-------|-------|-------|
| 2.1 | Modifier `Reservations.js` (champs covoiturage) | 1h |
| 2.2 | Ajouter `covoiturage` dans `ParametresPlateforme.js` | 30 min |
| 2.3 | Créer les routes + contrôleurs backend (recherche, rejoindre, quitter) | 5h |
| 2.4 | Algorithme de compatibilité (calcul de déviation, itinéraire optimal) | 4h |
| 2.5 | Ajouter les événements Socket.IO | 2h |
| 2.6 | Frontend : `CovoiturageList.jsx` + `CovoiturageCard.jsx` | 3h |
| 2.7 | Frontend : `CovoiturageDetails.jsx` | 2h |
| 2.8 | Frontend : Modifier `BookingSection.jsx` (ajout option + recherche) | 2h |
| 2.9 | Frontend : Modifier `ChauffeurTracking.jsx` (multi-arrêts) | 3h |
| 2.10 | Frontend : `CovoiturageArrets.jsx` | 2h |
| 2.11 | Frontend : Modifier admin (Dashboard, Trajets, Settings) | 2h |
| 2.12 | Calcul et division des prix | 2h |
| 2.13 | Traductions i18n | 1h |
| 2.14 | Tests et corrections | 3h |

---

## Résumé des livrables

| Fonctionnalité | Nouveaux fichiers | Fichiers modifiés | Durée |
|---|---|---|---|
| **Livraison** | ~8 fichiers (1 modèle + 7 composants) | ~12 fichiers | 3-5 jours |
| **Covoiturage** | ~4 fichiers (3 composants + 1 contrôleur) | ~12 fichiers | 5-7 jours |
| **Total** | ~12 nouveaux fichiers | ~15 fichiers modifiés | **8-12 jours** |
