# 📦 MODULE LIVRAISON DE COLIS — SPÉCIFICATION FINALE (10/10)

Module haute-sécurité intégrant la cohérence de l'Escrow, le verrouillage des statuts et le suivi public.

---

## 1. STRUCTURE DES DONNÉES (MODELS ÉLITES)

### 🔹 1.1 Commande de Livraison (Livraison.js)
*   **Workflow Logistique (Complet)** : 
    *   `statut` : (CREATED ➡️ PICKED ➡️ IN_TRANSIT ➡️ **ARRIVED** ➡️ DELIVERED).
    *   *Cas de sortie : FAILED.*
*   **Sécurité Temporaire** : 
    *   `otp_validation` (Code 4 chiffres).
    *   `otp_expire_at` (Délai de validité : 5 min).

---

## 2. COHÉRENCE FINANCIÈRE & ESCROW (ZÉRO BUG)

Le système implémente une **Règle de Garantie Systémique** :
1.  **Vérification Mismatch** : Une fonction interne s'assure en permanence que :
    *   `WalletSystemEscrow.total == Somme(Toutes les livraisons en cours)`.
    *   *Toute anomalie déclenche une alerte critique à l'Admin.*
2.  **Verrouillage du Débit** : Le transfert final vers le livreur n'est autorisé que si :
    *   L'OTP est validé.
    *   Le statut actuel est précisement `ARRIVED`.
    *   La position GPS est confirmée.

---

## 3. TRAÇABILITÉ & SÉCURITÉ PUBLIQUE

### 🛰️ Lien de Suivi Sécurisé
*   `tracking_uuid` : Lien SMS envoyé au destinataire.
*   **Expiration** : 24h après la fin du cycle (LIVRE ou FAILED).

### 🔄 Gestion des Échecs (Retry System)
*   `tentatives_livraison` (Max 3).
*   En cas d'échec au-delà de 3, le `FAILED` entraîne un ticket SAV automatique.

---

## 4. RÈGLES MÉTIER & MONÉTISATION

*   **Poids & Supplément** : (DOC: +0, PETIT: +2000, MOYEN: +5000, LARGE: +10000 GNF).
*   **Preuve par l'Image** : `photo_ramassage_url`, `photo_livraison_url`.
*   **Signature Digitale** : Optionnelle mais disponible pour les livraisons B2B.

---

## 5. PLAN TECHNIQUE FINAL (PRO)

1.  **Backend** :
    *   `DeliveryState.service.js` : Gère les transitions immuables de statut.
    *   `TransactionEscrow.service.js` : Gère le WalletSystemEscrow.
2.  **Web Public** :
    *   Interface React ultra-légère (`/tracking/:uuid`) pour le suivi destinataire.
3.  **Audit & Logs** :
    *   Chaque changement de statut enregistre un `LogSystem` avec coordonnées GPS et IP.
