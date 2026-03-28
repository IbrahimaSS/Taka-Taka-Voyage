# 🏫 MODULE TRANSPORT SCOLAIRE — SPÉCIFICATION PRODUCTION (11/10)

Version ultra-sécurisée intégrant la validation visuelle, la gestion des tuteurs autorisés et la résilience systémique.

---

## 1. STRUCTURE DES DONNÉES (MODELS ÉLITES)

### 🔹 1.1 Enfant & Tuteurs (Enfant.js)
*   **Profil** : `nom`, `photo_identifiable` (Check visuel obligatoire), `badge_id`.
*   **Sécurité Descente** : `tuteurs_autorises` (Array : [{nom, tel, relation, otp_validation}]).
*   **Statut Quotidien** : `statut_jour` (PRESENT | ABSENT_SIGNALE | NO_SHOW).

### 🔹 1.2 Abonnement & Tournée (AbonnementScolaire.js)
*   **Service** : `parent_id`, `ecole_mapping`, `paiement_mensuel_reussi`.
*   **Tournée** : `id_chauffeur`, `ordre_stops` (Domiciles ↔ Ecole).
*   **Finances Chauffeur** : `remuneration_par_passage`, `validation_passage_gps` (Check double).

---

## 2. WORKFLOW DE SÉCURITÉ (ZÉRO ERREUR) 🛡️

### ⬆️ Étape Montée (Check Visuel)
1.  L'enfant scanne son badge/QR.
2.  **Instant-Display** : La photo de l'enfant s'affiche immédiatement sur le téléphone du chauffeur.
3.  **Confirmation Chauffeur** : Le chauffeur appuie sur "Confirmer Présence" après vérification visuelle.
    *   `EVENT_ENFANT_A_BORD` ➡️ Notification Push Parent.

### ⬇️ Étape Descente (Liaison Tuteur)
1.  Le chauffeur arrive au point de dépose (Domicile).
2.  Le système vérifie si le tuteur présent est **autorisé**.
3.  **Validation OTP** : Le tuteur fournit son code OTP (ou scanne le QR du chauffeur).
    *   `EVENT_ENFANT_LIVRE_SECURITE` ➡️ Notification Push Parent + Fin de responsabilité.

---

## 3. MODE URGENCE & RÉSILIENCE (CRITIQUE)

### 🔴 Red Button (Urgence Scolaire)
En cas d'incident (panne, accident, alerte suspecte) :
*   Le chauffeur active `URGENCE_SCOLAIRE = TRUE`.
*   **Effets Immédiats** : 
    *   Appel automatique vers le Parent + Support Admin.
    *   Flux GPS passe en "Haute Précision" (Update toutes les 2s).
    *   Notification prioritaire sur tous les téléphones des tuteurs.

### 📶 Offline Management (Afrique Context)
*   **Sync Queue Sécurisée** : Les données de scan sont horodatées localement avec un `SecureTimestamp`.
*   **Intégrité** : Le système rejette toute synchronisation qui ne correspond pas aux logs GPS enregistrés localement.

---

## 4. RÈGLES MÉTIER & MONÉTISATION (SCALING)

*   **Abonnement Fratrie** : -15% de réduction si plusieurs enfants d'un même parent sont sur la même tournée.
*   **Score Sécurité Chauffeur** : Basé sur la ponctualité (< 5 min de retard) et le respect des protocoles de scan. Un score trop bas suspend l'accès au module scolaire.
*   **Gestion des Absentés** : Si `Absent_Signale` avant 6h ➡️ Le point de passage est supprimé dynamiquement de la route du chauffeur (gain de temps fuel).

---

## 5. PLAN D'ACTIONS TECHNIQUE FINAL

1.  **Backend** :
    *   Contrôleur de Tournée dynamique (optimisation d'itinéraire quotidienne).
    *   Moteur d'alertes Géo-fencing.
2.  **App Mobile (Interface Chauffeur)** :
    *   Mode "Présence" avec affichage plein écran des photos d'enfants.
3.  **Audit & Compliance** :
    *   Rapport mensuel d'assiduité envoyé automatiquement aux parents par email.
