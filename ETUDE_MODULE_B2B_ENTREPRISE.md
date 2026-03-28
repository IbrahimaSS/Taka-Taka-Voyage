# 🏢 MODULE ENTREPRISE (B2B) — PLAN DE PRODUCTION FINAL (10/10)

Ce document constitue la spécification technique finale pour le développement du module B2B de la Super-App Taka-Taka.

---

## 1. STRUCTURE DES DONNÉES (VERSION FINALE)

### 🔹 1.1 Entreprise (Entreprise.js)
*   **Identité & Statut** : `nom_societe`, `RCCM`, `NIF`, `status` (ACTIF | SUSPENDU).
*   **Configuration** : `validation_required` (Boolean), `type_trajet_autorise`.
*   **Wallet Dédié** : `id_wallet_entreprise`.

### 🔹 1.2 Employé (Employe.js)
*   **Profil** : `user_id`, `entreprise_id`, `role` (EMPLOYE | MANAGER), `status` (ACTIF | BLOQUE).
*   **Règles** : `type_usage` (PRO | LIBRE), `plafond_journalier`, `plafond_mensuel`.
*   **Sécurité** : `otp_validation` (Boolean).

### 🔹 1.3 Transactions (Transaction.js) — DÉTAILLÉ ❗
*   **Identifiants** : `reference` (ex: TXN-2026-XXXXXX), `entreprise_id`, `employe_id`, `trajet_id`.
*   **Valeurs** : `type` (DEBIT_ENTREPRISE, CREDIT_CHAUFFEUR), `montant`, `date`.
*   **Suivi (NOUVEAU)** : `status` (SUCCESS | FAILED | PENDING). *Indispensable pour le debug et les retries.*

### 🔹 1.4 Logs Système (Log.js) — NOUVEAU ❗
*   **Audit** : `action` (ex: "MODIF_PLAFOND", "BLOQUAGE_EMPLOYE"), `user_id` (l'auteur de l'action), `date`, `details` (JSON).

---

## 2. ARCHITECTURE DES WALLETS (DÉCOUPLÉE)

Pour éviter tout couplage et faciliter l'évolution, chaque entité possède son propre Wallet :
*   **WalletEntreprise** : Gère les fonds de la société (Recharges/Débits).
*   **WalletChauffeur** : Gère les revenus des chauffeurs (Crédits courses).
*   **WalletUser** : Gère les fonds personnels des passagers.
*   *Toute opération entre deux wallets doit passer par une Transaction auditée.*

---

## 3. WORKFLOW : SÉCURITÉ FINANCIÈRE TOTALE

1.  **Pré-Course** : Vérification du statut de l'entreprise (ACTIF) et de l'employé (ACTIF) + Solde estimé.
2.  **Course** : Suivi GPS et calcul dynamique du prix.
3.  **Post-Course (INDISPENSABLE)** :
    *   Vérification du solde REEL vs Montant FINALIZE.
    *   **Si solde insuffisant** : Fallback Paiement Personnel + Notification Manager + Passage de la transaction en `FAILED` avec log détaillé.

---

## 4. REPORTING & FACTURATION EXPORTABLE

Chaque mois, le système compile :
*   **Relevé Comptable** : Période, Références transactions, Total Global.
*   **Reporting Analytique** : Consommation par employé, Nombre de courses total.
*   **Export CSV/PDF** : Pour intégration directe dans la comptabilité de l'entreprise.

---

## 5. PLAN DE DÉVELOPPEMENT BACKEND

1.  **Étape 1** : Création des modèles Mongoose (`Entreprise.js`, `Employe.js`, `Transaction.js`, `Log.js`).
2.  **Étape 2** : Service `Wallet.service.js` (Logique atomique de transfert de fonds).
3.  **Étape 3** : Middlewares de sécurité et routes API Admin B2B.
