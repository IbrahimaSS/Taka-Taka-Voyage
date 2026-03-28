# 🚗 MODULE COVOITURAGE (SHARE) — SPÉCIFICATION PRODUCTION (11/10)

Version ultra-sécurisée intégrant le verrouillage transactionnel pro, la gestion des expirations et l'anti-fraude GPS.

---

## 1. STRUCTURE DES DONNÉES (MODELS EXPERTS)

### 🔹 1.1 Trajet Covoiturage (TrajetCovoit.js)
*   **Verrouillage des Places (Optimistic Locking)** : 
    *   `version` (Schema version key).
    *   **Condition de mise à jour** : 
        `if (nb_places_disponibles >= places_demandées)` ➡️ Update atomique.
*   **Finances** : `taux_commission`, `montant_commission_plateforme`, `montant_net_chauffeur`.
  
### 🔹 1.2 Réservation (ReservationCovoit.js)
*   **Expiration Chrono** : `reservation_expire_at` (Délai de paiement de 10 min).
*   **Limites Sécurité** : `max_places_par_user` (Défaut : 4 places pour éviter le blocage de masse).
*   **Audit** : `id_paiement_idempotent`, `status_transfert` (PENDING | SUCCESS | RETRY).

---

## 2. ATOMICITÉ & VERROUILLAGE TRANSACTIONNEL (RACE CONDITIONS) ❗

Pour empêcher deux passagers de réserver la dernière place à la même milliseconde :
1.  **Transaction ACID (Mongoose)** :
    *   `session.startTransaction()`.
    *   Le système vérifie `nb_places_disponibles` EN TEMPS RÉEL dans la transaction.
    *   Met à jour le décompte ET crée la réservation en une seule opération insécable.
2.  **Retry Automatique** : Si le transfert financier Escrow ➡️ Chauffeur échoue, le système tente jusqu'à 3 re-soumissions automatiques (`status_transfert: RETRY`) avant d'alerter le support.

---

## 3. GESTION DES EXPIRATIONS (CRON JOBS)

*   **Libération de Places** : Un CRON tourne toutes les minutes pour annuler les réservations `RESERVE_NON_PAYEE` dont le `reservation_expire_at` est dépassé.
*   **Nettoyage Automatique** : Cela garantit que les places ne sont pas bloquées par des utilisateurs fantômes ("Phantom Bookings").

---

## 4. SÉCURITÉ & ANTI-FRAUDE STRICTE

### 📍 Vérification GPS (Serrure Logique)
*   Le scan du **QR Code Dynamique** (qui expire toutes les 30s) n'est **VALIDE** que si :
    *   `Distance(Passenger_GPS, Driver_GPS) < 100m`.
    *   *Empêche la validation à distance (fraude entre amis).*

---

## 5. RE-CALCUL DYNAMIQUE & REPORTS

*   **Moteur de Remplissage** : Toute annulation ou expiration recalcule instantanément `nb_places_disponibles` et notifie les utilisateurs en attente (Waiting List).
*   **Reporting Financier** : Chaque trajet affiche clairement le **Taux de Commission** appliqué et le gain net final, certifié par une transaction auditée.

---

## 6. PLAN TECHNIQUE FINAL (PRO)

1.  **Backend** :
    *   Implémentation du pattern `Stale-While-Revalidate` pour l'affichage des places.
    *   `Worker` de fond pour les retries et les expirations.
2.  **API Client** :
    *   Headers d'idempotence requis pour toutes les mutations financières.
