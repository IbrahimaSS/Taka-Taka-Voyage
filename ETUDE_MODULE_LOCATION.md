# 🚙 Document Stratégique : Module "Location & Leasing" (Partenariat Baraka Trans)

> **Version :** 1.0.0 (Enrichie)  
> **Partenaire :** Baraka Trans (BTrans)  
> **Positionnement :** Vague B du déploiement V2 (Diversification)

Ce document présente la feuille de route technique et marketing pour l'intégration de la flotte Baraka Trans (BTrans) au sein de l'écosystème Taka-Taka. Le module a été pensé pour répondre à trois besoins fondamentaux : attirer le grand public, permettre l'investissement B2B, et faciliter l'intégration de chauffeurs sans véhicules.

---

## 💎 1. La Vitrine Publique (Marketing & Acquisition)

L'objectif est d'utiliser la flotte BTrans comme un puissant outil d'acquisition de clients directement depuis la page d'accueil (sans exiger de connexion).

*   **Intégration sur la Landing Page (`HomePage.jsx`)** : Création d'une section dédiée **"Découvrez notre flotte partenaire BTrans"**, située stratégiquement après la section Héro.
*   **Fonctionnalités Publiques** :
    *   Un **Carousel** affichant les photos HD des véhicules (VIP, SUV, Minibus).
    *   Affichage transparent des caractéristiques et du **tarif de location**.
    *   Badges visuels : `DISPONIBLE`, `RÉSERVÉ`, `NOUVEAU`.
    *   Filtres rapides par catégorie (VIP, SUV, Minibus, Économique).
*   **L'Entonnoir de Conversion** : Au clic sur **"Réserver ce véhicule"**, le visiteur est invité à créer un compte Taka-Taka. Cela force la création de nouveaux comptes.
    *   Si déjà connecté → Redirection directe vers le formulaire de réservation.
    *   Si non connecté → Modal d'inscription/connexion avec le véhicule sélectionné pré-rempli après authentification.

### 📊 1.1 Métriques d'Acquisition à Suivre
| KPI | Description |
|-----|-------------|
| **Taux de conversion vitrine** | % de visiteurs Landing Page qui cliquent "Réserver" |
| **Nouvelles inscriptions via BTrans** | Comptes créés grâce à l'entonnoir Location |
| **Véhicule le plus cliqué** | Top véhicules par nombre de vues (pour orienter la flotte) |

---

## 📱 2. Front-End : Application Passagers & Investisseurs

Une fois le client connecté à son interface privée (`Passager.jsx`), la location devient pleinement interactive.

### 📋 2.1 Le Formulaire de Réservation
*   **Sélection du Véhicule** : Fiche détaillée avec galerie photos, spécifications et avis.
*   **Sélection des Dates** : Calendrier intuitif avec visualisation de la disponibilité.
    *   Les créneaux déjà réservés apparaissent en grisé.
    *   Durée minimale : **1 jour** (Usage Privé) / **1 semaine** (Usage Investisseur/Leasing).
    *   Durée maximale : **3 mois** (renouvelable sur demande à l'Admin).
*   **Choix d'Usage (Option Cruciale)** :
    *   🔵 **Usage Privé** : Le client conduit lui-même ou coche l'option **"Avec Chauffeur Taka-Taka"**.
        *   Si "Avec Chauffeur" → Le système propose les chauffeurs disponibles et compatibles avec la catégorie du véhicule.
    *   🟠 **Usage Investisseur (Business)** : Le client loue la voiture pour la rentabiliser. Il entre l'**ID d'un Chauffeur Taka-Taka**, et le système associera la voiture à ce chauffeur pour qu'il travaille.
        *   Le chauffeur doit **confirmer son accord** via une notification (double consentement).
        *   Le chauffeur doit avoir un **profil validé** par l'Admin.
*   **Récapitulatif & Paiement** :
    *   Estimation claire : `Prix unitaire × Durée + Caution = Total`.
    *   Débit du Wallet Taka-Taka.
    *   Si solde insuffisant → Suggestion de recharge (Orange Money / MTN Mobile Money).

### 💼 2.2 Dashboard Investisseur
Pour un client ayant loué un véhicule en mode **Usage Investisseur**, un onglet dédié apparaît :

| Donnée | Description |
|--------|-------------|
| **Courses réalisées** | Nombre de courses du chauffeur assigné sur la période |
| **Revenus bruts générés** | Total des gains des courses effectuées avec le véhicule |
| **Coût de la location BTrans** | Montant payé pour la location mensuelle |
| **Bénéfice net estimé** | `Revenus bruts - Location BTrans - Commission Taka-Taka` |
| **Statut du véhicule** | En course / Disponible / En maintenance |
| **Position temps réel** | Carte GPS du véhicule quand il est en course |

---

## 🚕 3. Front-End : Application Chauffeurs (Leasing de Travail)

Ce module casse la barrière à l'entrée pour les excellents chauffeurs professionnels qui ne possèdent pas de voiture.

*   **Inscription assouplie** : Un chauffeur peut s'inscrire **sans posséder de véhicule**. Son profil affiche `Véhicule : Non assigné — En attente de location`.
*   **Catalogue Chauffeur** : Une section **"Véhicules disponibles au Leasing"** dans l'app Chauffeur affiche les véhicules BTrans ouverts au leasing de travail.
*   **Déverrouillage via Location** : Il choisit un véhicule BTrans. Une fois la location payée (via le Wallet) et **approuvée par l'Admin**, l'immatriculation BTrans est **"liée"** au profil du Chauffeur, ce qui lui permet d'accepter des courses.
*   **Conditions de leasing** :
    *   Paiement : **Hebdomadaire ou Mensuel** (prélevé automatiquement du Wallet Chauffeur).
    *   En cas de **solde insuffisant** au moment du prélèvement → Notification d'alerte + Période de grâce de **48h** → Suspension de l'accès aux courses si impayé.
    *   Le chauffeur peut **résilier** à tout moment avec un préavis de **7 jours**.

### 🔗 3.1 Liaison Véhicule ↔ Chauffeur
| Scénario | Comportement |
|----------|-------------|
| Chauffeur loue directement | `ChauffeurAssigne_id = lui-même`, il paye depuis son Wallet |
| Investisseur assigne un chauffeur | `ChauffeurAssigne_id = chauffeur choisi`, l'investisseur paye |
| Location privée sans chauffeur | `ChauffeurAssigne_id = null`, pas de tracking course |
| Location privée avec chauffeur TT | `ChauffeurAssigne_id = chauffeur sélectionné`, coût chauffeur en supplément |

---

## 💻 4. Back-End : Portail Administrateur (Gestion de Flotte)

L'Admin panel (`AdminApp.jsx`) devient une véritable tour de contrôle.

### 🏗️ 4.1 Le Garage Virtuel
*   Interface pour **ajouter, modifier ou retirer** les véhicules BTrans.
*   Champs par véhicule :
    *   Immatriculation, Marque, Modèle, Année.
    *   Catégorie : `VIP` | `SUV` | `MINIBUS` | `ECONOMIQUE` | `UTILITAIRE`.
    *   Photos HD (Min 3 : avant, intérieur, latéral).
    *   Tarification : `prix_jour`, `prix_semaine`, `prix_mois`.
    *   Montant de la caution.
    *   Statut : `DISPONIBLE` | `EN_LOCATION` | `MAINTENANCE` | `RETIRE`.
*   **Statistiques par véhicule** : Nombre de locations, revenus cumulés, note moyenne.

### ✅ 4.2 Validation des Dossiers (Workflow Admin)
Chaque demande de location arrive avec le statut `EN_ATTENTE`. L'Admin effectue :

1.  **Vérification du demandeur** :
    *   Pièce d'identité valide dans le profil.
    *   Permis de conduire validé (si Usage Privé sans chauffeur).
    *   Solde Wallet suffisant (Caution + Montant location).
2.  **Appel téléphonique BTrans** : Confirmation verbale que le véhicule est bien disponible physiquement (pas de double-réservation).
3.  **Check-in** : Notes sur l'état du véhicule au départ (km, carburant, observations).
4.  **Clic sur `APPROUVER`** :
    *   Débit automatique du Wallet du demandeur.
    *   Si chauffeur assigné → Liaison véhicule ↔ chauffeur activée.
    *   Notification Push au demandeur + chauffeur (si applicable).

### 🔙 4.3 Processus de Retour (Check-out)
1.  L'Admin note la **date de retour réelle**, l'état du véhicule, le km final.
2.  **Si aucun problème** → Caution restituée intégralement au Wallet.
3.  **Si dégâts constatés** → L'Admin saisit le montant des réparations → Déduit de la caution → Le solde est restitué.
4.  **Si litige** → Le demandeur peut contester → L'Admin tranche avec les preuves.
5.  Clic sur `TERMINER` → La location passe en `TERMINEE`, le véhicule redevient `DISPONIBLE`.

### 📊 4.4 Dashboard Flotte Admin
| Indicateur | Description |
|------------|-------------|
| **Véhicules actifs** | Nombre de véhicules BTrans actuellement en location |
| **Taux d'occupation** | % de la flotte actuellement louée |
| **Revenus mensuels Location** | Total des revenus générés par le module |
| **Commission Taka-Taka** | Part prélevée sur chaque location |
| **Locations en attente** | Demandes non encore traitées |
| **Litiges ouverts** | Cas en cours de résolution |
| **Top véhicules** | Véhicules les plus rentables |

---

## 🛡️ 5. FAQ PARTENAIRES : Sécurité, Finance et Logistique

*(Cette section est conçue pour rassurer les propriétaires, les investisseurs et Baraka Trans).*

### Q1. Comment garantir la sécurité des véhicules prêtés par BTrans ?
*   **KYC Strict (Know Your Customer)** : Toute personne demandant une location doit avoir un compte vérifié (Pièce d'identité, Permis validé par l'Admin).
*   **Tracking GPS Intégré** : Si le véhicule est utilisé "Avec Chauffeur" ou en "Leasing de travail", l'application Chauffeur Taka-Taka assure un suivi GPS en temps réel. BTrans et Taka-Taka savent exactement où est le véhicule.
*   **Verrou Financier (Caution)** : Le système s'appuie sur le Portefeuille (Wallet) Taka-Taka. Avant que l'Admin ne valide la location, une caution de garantie ou le paiement intégral peut être exigé et bloqué numériquement.

### Q2. Quel est le modèle économique (Qui gagne quoi) ?
C'est un modèle **Gagnant-Gagnant** :

| Acteur | Gain |
|--------|------|
| **BTrans** | Loue plus de véhicules sans effort commercial — Taka-Taka apporte les clients |
| **Taka-Taka** | Commission de plateforme sur chaque location (configurable, défaut : **12%**) |
| **Investisseur** | Bénéfice passif = `Revenus courses - Loyer BTrans - Commission TT` |
| **Chauffeur sans voiture** | Accès au métier immédiat → Il génère des revenus de courses dès le premier jour |

**Effet boule de neige** : L'intégration de nouveaux chauffeurs sans véhicule augmente mécaniquement le nombre de courses complétées, donc les commissions quotidiennes explosent.

### Q3. Que se passe-t-il en cas d'accident ou de double-réservation ?
*   **Contrôle Centralisé** : Les requêtes soumises par les passagers arrivent avec le statut `EN_ATTENTE`. L'opérateur Taka-Taka a toujours le dernier mot pour vérifier physiquement (par un coup de fil) si BTrans a la voiture avant de cliquer sur `ACCEPTER`. Pas de risque de double-réservation automatisée foireuse.
*   **Assurance** : Les contrats signés numériquement via l'application précisent que le locataire ou le propriétaire assume l'assurance selon les accords existants entre BTrans et ses courtiers.
*   **Historique d'incident** : Chaque incident est loggé avec date, photos et description. Un locataire ayant **2+ incidents** se voit appliquer un surcoût de caution de **+50%** sur ses locations futures.

### Q4. Pourquoi un Investisseur irait louer une voiture pour un autre chauffeur ?
C'est le principe des **flottes VTC**. Une personne qui a du capital loue un véhicule chez BTrans (via Taka-Taka) au mois. Elle le confie à un chauffeur de confiance identifié sur Taka-Taka. Les revenus générés par les courses couvrent la location BTrans et dégagent un bénéfice passif pour l'investisseur. Taka-Taka gère la traçabilité.

**Exemple concret** :
| Ligne | Montant (GNF) |
|-------|:-------------:|
| Location mensuelle BTrans (SUV) | -3 000 000 |
| Revenus courses chauffeur (30 jours) | +6 500 000 |
| Commission Taka-Taka (12%) | -780 000 |
| **Bénéfice net investisseur/mois** | **+2 720 000** |

### Q5. Comment gère-t-on le paiement du leasing chauffeur ?
| Mode | Fonctionnement |
|------|---------------|
| **Prélèvement auto Wallet** | Le montant est débité automatiquement chaque semaine/mois du Wallet chauffeur |
| **Grâce 48h** | En cas de solde insuffisant, le chauffeur a 48h pour recharger |
| **Suspension** | Après 48h impayé → Accès aux courses suspendu, le véhicule reste "lié" |
| **Résiliation** | Après 7 jours impayé → Liaison véhicule supprimée, caution absorbée, profil marqué |

### Q6. BTrans peut-il voir ses véhicules depuis la plateforme ?
*   **Phase 1 (MVP)** : Non. BTrans reçoit un rapport Excel/PDF mensuel généré par l'Admin (revenus, état flotte, incidents).
*   **Phase 2 (Future)** : Un portail dédié "Partenaire Flotte" avec accès en lecture seule sur ses véhicules, leurs positions et les revenus générés.

---

## ⚙️ 6. Modélisation Base de Données (Détaillée)

### 🔹 6.1 Modèle `VehiculeLocation.js`

```javascript
{
  // — Identité —
  immatriculation:    { type: String, required: true, unique: true },
  marque:             { type: String, required: true },       // Ex: Toyota
  modele:             { type: String, required: true },       // Ex: Land Cruiser
  annee:              { type: Number },
  categorie:          { type: String, enum: ['VIP', 'SUV', 'MINIBUS', 'ECONOMIQUE', 'UTILITAIRE'] },
  
  // — Propriétaire / Partenaire —
  partenaire:         { type: String, default: 'BTrans' },   // Extensible pour futurs partenaires
  
  // — Tarification (GNF) —
  prix_jour:          { type: Number, required: true },
  prix_semaine:       { type: Number },                       // Auto = prix_jour × 7 × 0.85
  prix_mois:          { type: Number },                       // Auto = prix_jour × 30 × 0.70
  caution:            { type: Number, required: true },
  
  // — Médias —
  photos:             [{ type: String }],                     // URLs (min 3)
  
  // — Statut —
  statut:             { type: String, enum: ['DISPONIBLE', 'EN_LOCATION', 'MAINTENANCE', 'RETIRE'], default: 'DISPONIBLE' },
  
  // — Caractéristiques —
  nb_places:          { type: Number, default: 5 },
  climatisation:      { type: Boolean, default: true },
  boite_auto:         { type: Boolean, default: false },
  
  // — Statistiques —
  nb_locations:       { type: Number, default: 0 },
  note_moyenne:       { type: Number, default: 0 },
  revenus_cumules:    { type: Number, default: 0 },

  // — Timestamps —
  createdAt, updatedAt
}
```

### 🔹 6.2 Modèle `Location.js`

```javascript
{
  // — Référence —
  reference:           { type: String, unique: true },        // LOC-2026-XXXXXX (auto-généré)
  
  // — Acteurs —
  demandeur_id:        { type: ObjectId, ref: 'Utilisateurs', required: true },
  vehicule_id:         { type: ObjectId, ref: 'VehiculeLocation', required: true },
  chauffeur_assigne_id:{ type: ObjectId, ref: 'Utilisateurs', default: null },
  
  // — Type d'usage —
  type_usage:          { type: String, enum: ['PRIVE', 'PRIVE_AVEC_CHAUFFEUR', 'INVESTISSEUR', 'LEASING_CHAUFFEUR'] },
  
  // — Temporalité —
  date_debut:          { type: Date, required: true },
  date_fin_prevue:     { type: Date, required: true },
  date_fin_reelle:     { type: Date, default: null },         // Rempli au check-out
  
  // — Workflow —
  statut:              { type: String, enum: [
    'EN_ATTENTE',     // Demande soumise, attend validation Admin
    'APPROUVEE',      // Admin a validé + Wallet débité
    'EN_COURS',       // Véhicule remis, location active
    'TERMINEE',       // Véhicule retourné, check-out validé
    'ANNULEE',        // Annulée avant le début (par demandeur ou Admin)
    'LITIGE'          // Conflit en cours de résolution
  ], default: 'EN_ATTENTE' },
  
  // — Financier (GNF) —
  montant_location:    { type: Number, required: true },      // Prix calculé (prix × durée)
  montant_caution:     { type: Number, required: true },      // Bloqué en Escrow
  frais_supplementaires:{ type: Number, default: 0 },         // Dégâts, retard, etc.
  montant_caution_restituee: { type: Number, default: 0 },    // Après check-out
  commission_plateforme:{ type: Number },                     // Montant prélevé par TT
  statut_paiement:     { type: String, enum: ['EN_ATTENTE', 'PAYE', 'REMBOURSE_PARTIEL', 'REMBOURSE_TOTAL'], default: 'EN_ATTENTE' },
  
  // — Check-in / Check-out —
  check_in: {
    km_depart:         { type: Number },
    carburant_depart:  { type: String, enum: ['VIDE', 'QUART', 'DEMI', 'TROIS_QUARTS', 'PLEIN'] },
    observations:      { type: String },
    date:              { type: Date }
  },
  check_out: {
    km_retour:         { type: Number },
    carburant_retour:  { type: String, enum: ['VIDE', 'QUART', 'DEMI', 'TROIS_QUARTS', 'PLEIN'] },
    observations:      { type: String },
    degats_constates:  { type: Boolean, default: false },
    montant_degats:    { type: Number, default: 0 },
    date:              { type: Date }
  },
  
  // — Chauffeur Acceptation (si Investisseur) —
  chauffeur_accepte:   { type: Boolean, default: null },      // null = pas encore répondu
  
  // — Historique des incidents —
  incidents: [{
    date:              { type: Date },
    description:       { type: String },
    photos:            [{ type: String }],
    montant_estime:    { type: Number }
  }],
  
  // — Admin —
  traite_par:          { type: ObjectId, ref: 'Utilisateurs' }, // Admin qui a validé
  notes_admin:         { type: String },
  
  // — Timestamps —
  createdAt, updatedAt
}
```

### 🔹 6.3 Modèle `EvaluationLocation.js`

```javascript
{
  location_id:         { type: ObjectId, ref: 'Location', required: true },
  
  // — Double notation —
  note_vehicule:       { type: Number, min: 1, max: 5 },     // Par le locataire
  commentaire_vehicule:{ type: String },
  note_locataire:      { type: Number, min: 1, max: 5 },     // Par l'Admin/Propriétaire
  commentaire_locataire:{ type: String },
  
  createdAt
}
```

---

## 🔄 7. Workflow Complet (Diagramme d'États)

```
DEMANDEUR                           ADMIN                          SYSTÈME
    │                                  │                               │
    ├── Soumet réservation ──────────► │                               │
    │   (type_usage + dates + véhicule)│                               │
    │                                  │                               │
    │                          EN_ATTENTE                              │
    │                                  │                               │
    │                    Vérifie KYC + Wallet                          │
    │                    Appelle BTrans                                │
    │                                  │                               │
    │                    ┌─── Refuse ──┤── Approuve ───┐               │
    │                    │             │               │               │
    │                 ANNULEE          │           APPROUVEE            │
    │                                  │               │               │
    │                                  │      Débite Wallet            │
    │                                  │      (Location + Caution)     │
    │                                  │               │               │
    │                          Check-in physique       │               │
    │                          (km, carburant, notes)  │               │
    │                                  │               │               │
    │                               EN_COURS ◄─────────┘               │
    │                                  │                               │
    │                                  │              Rappels auto     │
    │                                  │              (J-1, H-2) ◄────┤
    │                                  │                               │
    │   Ramène le véhicule ──────────► │                               │
    │                                  │                               │
    │                          Check-out physique                      │
    │                          (km, carburant, dégâts)                 │
    │                                  │                               │
    │                    ┌─── Dégâts ──┤── RAS ───────┐               │
    │                    │             │               │               │
    │                    │             │           TERMINEE             │
    │                    │             │           Caution restituée    │
    │                    │             │                               │
    │              Montant saisi       │                               │
    │              Locataire conteste? │                               │
    │                    │             │                               │
    │              ┌─ Non ┤─ Oui ──┐  │                               │
    │              │      │        │  │                               │
    │          TERMINEE   │     LITIGE                                 │
    │      Caution déduite│   Admin tranche                           │
    │                     │        │                                   │
    │                     │   TERMINEE                                 │
    │                     │   Redistribution finale                    │
```

---

## 🔌 8. Événements Socket.IO (Temps Réel)

```
// — Cycle de vie Location —
location:nouvelle-demande          → Admin reçoit la demande en temps réel
location:approuvee                 → Notification Push au demandeur
location:refusee                   → Notification Push au demandeur (avec motif)
location:en-cours                  → Location démarre après check-in
location:rappel-retour             → Rappel automatique J-1 et H-2
location:terminee                  → Location clôturée, caution traitée
location:annulee                   → Annulation notifiée à toutes les parties

// — Chauffeur / Investisseur —
location:chauffeur-assigne         → Notification au chauffeur qu'un investisseur l'a choisi
location:chauffeur-accepte         → Le chauffeur accepte → véhicule lié
location:chauffeur-refuse          → Le chauffeur refuse → demandeur notifié
location:vehicule-lie              → Immatriculation liée au profil chauffeur
location:vehicule-delie            → Liaison supprimée (fin de location ou impayé)

// — Leasing paiement —
location:prelevement-reussi        → Wallet débité avec succès (hebdo/mensuel)
location:prelevement-echoue        → Alerte solde insuffisant + grâce 48h
location:suspension-chauffeur      → Accès courses suspendu après impayé

// — Litige —
location:litige-ouvert             → Litige déclenché, Admin notifié
location:litige-resolu             → Décision finale communiquée
```

---

## 💸 9. Règles Financières Complètes

### 9.1 Politique de Tarification

| Durée | Calcul | Remise |
|-------|--------|:------:|
| Journalière | `prix_jour × nb_jours` | 0% |
| Hebdomadaire | `prix_jour × 7 × 0.85` | **-15%** |
| Mensuelle | `prix_jour × 30 × 0.70` | **-30%** |

### 9.2 Commission Plateforme
*   **Taux par défaut** : **12%** du montant de la location (configurable dans Admin > Paramètres).
*   Appliquée au moment du paiement, versée dans le Wallet Système Taka-Taka.

### 9.3 Caution (Escrow)
*   Bloquée dans le **WalletSystemEscrow** à l'approbation.
*   Restituée intégralement si check-out OK.
*   Déduite en cas de dégâts (montant saisi manuellement par l'Admin).
*   Gelée en cas de litige.

### 9.4 Politique d'Annulation

| Délai avant `date_debut` | Remboursement Location | Caution |
|---------------------------|:----------------------:|:-------:|
| > 48h | **100%** | Restituée |
| 24h — 48h | **75%** | Restituée |
| 12h — 24h | **50%** | Restituée |
| < 12h | **25%** | Restituée |
| Après check-in (en cours) | **0%** | Selon check-out |

### 9.5 Pénalité de Retard
*   Si `date_fin_reelle > date_fin_prevue` :
    *   Surfacturation = `prix_jour × nb_jours_retard × 1.5` (coefficient configurable).
    *   Prélevé de la caution si disponible, sinon du Wallet.

---

## 🏗️ 10. Plan Technique de Développement

### Phase 1 — Backend (Semaine 1-2)
| Étape | Fichier | Description |
|:-----:|---------|-------------|
| 1 | `models/VehiculeLocation.js` | Modèle Mongoose véhicule |
| 2 | `models/Location.js` | Modèle Mongoose location avec workflow |
| 3 | `models/EvaluationLocation.js` | Modèle notation double |
| 4 | `controllers/admin/locationAdminControllers.js` | CRUD véhicules + validation + check-in/out |
| 5 | `controllers/passager/locationControllers.js` | Réservation + mes locations |
| 6 | `controllers/chauffeur/locationChauffeurControllers.js` | Catalogue leasing + acceptation |
| 7 | `routes/admin/locationAdminRoutes.js` | Routes admin location |
| 8 | `routes/passager/locationRoutes.js` | Routes passager location |
| 9 | `routes/chauffeur/locationChauffeurRoutes.js` | Routes chauffeur location |
| 10 | `services/locationWallet.service.js` | Logique Escrow caution + paiement |
| 11 | Enrichissement `socket.js` | Ajout des événements `location:*` |

### Phase 2 — Frontend Passager & Landing (Semaine 3-4)
| Étape | Fichier | Description |
|:-----:|---------|-------------|
| 12 | `components/home/FlotteBTrans.jsx` | Section Carousel Landing Page |
| 13 | `components/passager/LocationCatalogue.jsx` | Catalogue filtrable dans l'app passager |
| 14 | `components/passager/LocationReservation.jsx` | Formulaire de réservation |
| 15 | `components/passager/MesLocations.jsx` | Historique & suivi |
| 16 | `components/passager/DashboardInvestisseur.jsx` | Dashboard revenus investisseur |
| 17 | `services/locationService.js` | Appels API location |

### Phase 3 — Frontend Admin & Chauffeur (Semaine 5-6)
| Étape | Fichier | Description |
|:-----:|---------|-------------|
| 18 | `components/admin/sections/GarageVirtuel.jsx` | CRUD véhicules BTrans |
| 19 | `components/admin/sections/LocationsAdmin.jsx` | Validation + check-in/out |
| 20 | `components/admin/sections/FlotteDashboard.jsx` | Dashboard flotte |
| 21 | `components/chauffeur/CatalogueLeasing.jsx` | Véhicules dispo au leasing |
| 22 | `components/chauffeur/MonLeasing.jsx` | Suivi leasing actif |

### Phase 4 — Tests & Polish (Semaine 7)
| Étape | Description |
|:-----:|-------------|
| 23 | Tests du workflow complet (demande → approbation → check-in → check-out) |
| 24 | Tests Wallet (débit, caution, restitution, pénalités) |
| 25 | Tests Socket.IO (notifications temps réel) |
| 26 | Traductions i18n (FR complet + EN) |
| 27 | Responsive + animations Framer Motion |

---

> 📝 *Ce module s'intègre dans la Vague B du déploiement V2 (Diversification). Il exploite le socle Wallet (Vague A) et ouvre la voie à d'autres partenaires flottes au-delà de BTrans. Le modèle Investisseur crée un effet réseau : plus de véhicules → plus de chauffeurs → plus de courses → plus de commissions.*
