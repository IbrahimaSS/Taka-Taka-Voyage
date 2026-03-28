# 🌍 MODULE COMMUNAUTÉ (SIGNALEMENTS) — SPÉCIFICATION PRODUCTION (11/10)

Module d'intelligence collective haute-fidélité intégrant la pondération des scores et la modération communautaire avancée.

---

## 1. STRUCTURE DES DONNÉES (MODÉLISATION ÉLITE)

### 🔹 1.1 Signalement (PostCommunaute.js)
*   **Identité & Fiabilité** : 
    *   `score_fiabilite` (Calculé dynamiquement : Somme des scores des confirmants).
    *   `status` (EN_ATTENTE | VERIFIE | RESOLU | FAUX).
*   **Cycle de Vie Dynamique** : 
    *   `expire_at` (Auto-prolongé si CONFIRME, immédiat si RESOLU).
*   **Affichage** : `priorite_affichage` (score + proximité + récence).

### 🔹 1.2 Réputation Utilisateur (ProfilEclaireur.js)
*   **Score d'Éclaireur** : (+3 pour info confirmée, -5 pour info fausse).
*   **Badge** : (Expert | Guide | Recrue).

---

## 2. ALGORITHME DE FIABILITÉ & ANTI-ABUS ❗

Pour garantir une carte propre et sans "fake news" :
1.  **Pondération Intelligente** : Un signalement n'est "VERIFIE" que si `score_fiabilite >= SEUIL`. Un utilisateur Expert pèse plus qu'un nouveau compte.
2.  **Détection Zone Morte** : Si `nb_users_zone < SEUIL_MIN`, le système abaisse automatiquement l'exigence de confirmations pour ne pas ignorer d'alertes réelles.
3.  **Barrage Anti-Fake GPS** : Le signalement est rejeté si la vitesse du capteur ou son historique de position est incohérent (Détection automatique de GPS Spoofing).

---

## 3. MODÉRATION & VIVACITÉ DU SYSTÈME

*   **Auto-Expiration Smart** : Un signalement "Embouteillage" reste tant qu'il est alimenté par des confirmations. S'il n'y a plus de retours pendant 15 min, il expire.
*   **Report System** : Les utilisateurs peuvent `report_post`. Si un post atteint un seuil de reports par des utilisateurs fiables, il est auto-supprimé.

---

## 4. IMPACT SUR LA NAVIGATION (ROUTE ENGINE)

*   **Heatmap en Temps Réel** : Les zones de forte densité de signalements `EMBOUTEILLAGE` deviennent "Rouges" sur le moteur de calcul d'itinéraire (Routing Engine).
*   **Signalement Passif (Master)** : Enregistrement anonyme des ralentissements anormaux de plusieurs véhicules Taka-Taka sur un même segment ➡️ Création automatique d'une alerte "Ralentissement détecté".

---

## 5. PLAN TECHNIQUE FINAL (FRONT & BACK)

1.  **Backend** :
    *   `CommunityEngine.service.js` : Calculateur de priorité et de fiabilité en fond.
    *   Webhook de notification pour les zones à risques.
2.  **App Mobile** :
    *   Interface de signalement "One-Tap" pour minimiser l'inattention du chauffeur.
3.  **Logs & Audit** :
    *   Archivage des signalements résolus pour analyse historique du trafic urbain.
