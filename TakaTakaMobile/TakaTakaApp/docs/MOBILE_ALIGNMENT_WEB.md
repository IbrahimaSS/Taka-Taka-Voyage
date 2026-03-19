# Alignement Mobile ↔ Web — Taka-Taka Voyage

Ce document fait le lien entre la **documentation fonctionnelle web** (plateforme déjà en production) et l’**application mobile**, pour un même produit avec **moins de clics** et **sans complication** côté mobile.

---

## 1. Rôles (alignés)

| Rôle        | Web | Mobile | Note |
|------------|-----|--------|------|
| Passager   | ✅  | ✅     | Client qui réserve des trajets. |
| Chauffeur  | ✅  | ✅     | Partenaire après validation documents. |
| Admin      | ✅  | ✅     | Gestion, validation, paramètres. |

---

## 2. Parcours Chauffeur & Validation

### 2.1 Inscription et authentification

| Fonctionnalité web           | Mobile (état) | Action |
|-----------------------------|---------------|--------|
| Vérification OTP (Brevo)    | Placeholder   | Afficher mention « Code envoyé par email » ; brancher API plus tard. |
| Formulaire profil (Nom, Prénom, Photo) | ✅ Étape 1 | Conserver ; libellés alignés. |

### 2.2 Documents KYC (4 obligatoires)

| Document web                | Mobile (état) | Action |
|----------------------------|---------------|--------|
| Permis de conduire (Recto)  | À ajouter     | Étape 3 : 4 blocs upload distincts. |
| Permis de conduire (Verso)  | À ajouter     | Idem. |
| Carte grise véhicule       | À ajouter     | Idem. |
| Attestation assurance      | À ajouter     | Idem. |
| Photo véhicule (plaque visible) | Partiel (étape 2) | Déplacer en étape 3 « Documents » ou garder en 2 + rappel en 3. |

→ **Mobile** : une seule étape « Documents » avec 4 uploads + numéro de permis + adresse (moins de clics).

### 2.3 Après soumission

| Fonctionnalité web                    | Mobile (état) | Action |
|--------------------------------------|---------------|--------|
| Page d’attente « Dossier en cours »  | À ajouter     | Après submit : écran ou modal « En cours d’examen ». |
| Notification temps réel (Socket.io) | Prévoir       | Placeholder / message « Vous serez notifié à la validation ». |
| Modale succès + lien vers connexion  | Partiel       | Remplacer alerte par modale avec bouton « Se connecter ». |

---

## 3. Passager (réservation)

### 3.1 Estimation et carte

| Web                         | Mobile | Action |
|----------------------------|--------|--------|
| Calculateur prix / distance / durée | Partiel (RideOptions) | Afficher **estimation visible** dès la saisie départ/arrivée (même simplifiée). |
| Carte interactive départ/arrivée     | ✅ SearchScreen, CreateRideModal | Garder ; option « Ma position » pour départ. |

### 3.2 Types de service (libellés doc)

| Web                | Mobile actuel | Alignement |
|-------------------|----------------|------------|
| Course immédiate  | Immédiat       | ✅ « Course immédiate » ou garder « Immédiat ». |
| Course planifiée  | Programmé      | ✅ « Course planifiée » (ou « Programmé »). |
| Taxi-partage (Carpooling) | Partagé  | ✅ « Taxi-partage » ou « Partagé ». |

### 3.3 Paiements (doc)

| Web              | Mobile | Action |
|------------------|--------|--------|
| Cash (espèces)   | ✅     | Toujours proposé. |
| Paiement digital | ✅     | Carte / Mobile Money déjà dans contexte. |

Libellés : **« Espèces »** et **« Paiement digital »** pour coller à la doc.

### 3.4 Facturation

| Web           | Mobile | Action |
|---------------|--------|--------|
| Invoices PDF  | À prévoir | Post-trajet : « Télécharger la facture » (placeholder ou lien). |

---

## 4. Modèle économique (80/20)

| Web                    | Mobile | Action |
|------------------------|--------|--------|
| Commission 20 %        | 15 % affiché (Admin) | Remplacer par **20 %** partout. |
| Chauffeur reçoit 80 %  | À afficher | Dashboard chauffeur : « Vous recevez 80 % du montant ». |
| Portefeuille digital   | Gains / stats | Garder ; préciser « 80 % du trajet ». |

---

## 5. Admin (back-office mobile)

| Web                         | Mobile | Action |
|----------------------------|--------|--------|
| Stats temps réel           | ✅     | Garder. |
| Validation documents       | ✅     | Lister les **4 documents** (Permis recto/verso, Carte grise, Assurance, Photo véhicule). |
| Gestion utilisateurs       | ✅     | Blocage, modérateurs : garder. |
| Branding (logo, nom, slogan) | Placeholder | Optionnel. |
| Mode maintenance + Socket  | Placeholder | Message « Maintenance » si backend envoie le flag. |

---

## 6. Innovations (à brancher progressivement)

| Fonctionnalité      | Mobile | Priorité |
|---------------------|--------|----------|
| Taka-Assistant (Gemini, vocal) | Non | Après alignement flux. |
| Offline-first (sauvegarde locale, sync) | Non | Après API. |
| i18n (FR, EN, Pular, Soussou, Malinké) | Partiel (langue dans paramètres) | Conserver ; ajouter détection auto langue téléphone. |
| Notifications temps réel (Socket) | Non | Avec backend. |

---

## 7. Simplification UX mobile (moins de clics)

- **Chauffeur** : 3 étapes fixes ; étape 3 = 4 documents sur un seul écran (pas de sous-étapes).
- **Passager** : Flux « Où allez-vous ? » → **un écran** (ou deux max) : départ/arrivée + type (Immédiat / Planifié / Partagé) + paiement (Espèces / Digital) + estimation → Confirmer.
- **Admin** : Onglets clairs (Dashboard, Validation, Trajets, Paramètres) ; validation en 1 clic (Valider / Rejeter) avec liste des 4 documents.

---

## 8. Nom de la plateforme

- **Web** : Taka-Taka Voyage.  
- **Mobile** : Utiliser le même nom (**Taka-Taka Voyage**) dans les écrans d’accueil, header et paramètres (constante partagée).

---

*Dernière mise à jour : alignement avec la documentation fonctionnelle web (Fév. 2026).*
