# 🚗 MODULE COVOITURAGE (SHARE) — SPÉCIFICATION PRODUCTION (11/10)

TEMPS RÉEL dans la transaction.
    *   Met à jour le décompte ET crée la réservation en une seule opération insécable.
2.  **Retry Automatique** : Si le transfert financier Escrow ➡️ Chauffeur échoue, le système tente jusqu'à 3 re-soumissions automatiques (`status_transfert: RETRY`) avant d'alerter le support.

---

## 3. GESTION DES EXPIRATIONS (CRON JOBS)

*   **Libération de Places** : Un CRON tourne toutes les minutes pour annuler les réservations `RESERVE_NON_PAYEE` dont le `reservation_expire_at` est dépassé.
*   **Nettoyage Automatique** : Cela garantit que les places ne sont pas bloquées par des utilisateurs fantômes ("Phantom Bookings").

---

## 4. SÉCURITÉ & ANTI-FRAUDE STRICT

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
