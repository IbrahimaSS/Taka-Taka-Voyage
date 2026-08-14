import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import { apiClient } from './apiClient';
import { getQueue, updateQueueItem, removeFromQueue } from './uploadQueue';

const MAX_ATTEMPTS = 5;
const BASE_BACKOFF_MS = 5000; // 5s
const MAX_BACKOFF_MS = 10 * 60 * 1000; // 10 min plafond — on ne martèle jamais le serveur indéfiniment
const BACKGROUND_TASK_NAME = 'taka-taka-upload-queue-sync';

let isProcessing = false; // évite deux passages concurrents (event réseau + tâche de fond simultanés)
let netInfoUnsubscribe = null;
let netInfoDebounceTimer = null; // évite une rafale d'appels si la connexion flanche plusieurs fois d'affilée
let retryTimer = null; // un seul minuteur ciblé pour le prochain retry — jamais de sondage répété
const successListeners = new Set();
const NETINFO_DEBOUNCE_MS = 1500;

function computeBackoffMs(attempts) {
  return Math.min(BASE_BACKOFF_MS * 2 ** attempts, MAX_BACKOFF_MS);
}

// Permet à un écran de réagir quand un envoi différé aboutit enfin (ex. rafraîchir
// l'URL de la photo de profil avec la vraie valeur Cloudinary renvoyée par le
// backend). Retourne une fonction de désabonnement.
export function onUploadQueueItemSuccess(callback) {
  successListeners.add(callback);
  return () => successListeners.delete(callback);
}

function notifySuccess(item, response) {
  successListeners.forEach((callback) => {
    try {
      callback(item, response);
    } catch (e) {
      console.error('❌ [uploadQueueSync] listener en échec:', e.message);
    }
  });
}

// Construit le multipart et envoie un élément au backend avec sa clé d'idempotence
// (voir checkUploadIdempotency côté backend) — un retry après une réponse perdue
// en route ne recrée jamais l'enregistrement côté serveur.
async function uploadItem(item) {
  // La copie locale (voir enqueueUpload) garde toujours l'URI complète avec son
  // schéma ("file://...") — expo-file-system en a besoin pour copier le fichier.
  // Le retrait du préfixe pour iOS ne s'applique qu'ici, juste avant l'envoi réseau,
  // là où fetch/FormData l'exige historiquement sur cette plateforme.
  const uploadUri = Platform.OS === 'ios' ? item.localUri.replace('file://', '') : item.localUri;

  const formData = new FormData();
  formData.append(item.fileFieldName, {
    uri: uploadUri,
    name: item.fileName,
    type: item.mimeType,
  });
  Object.entries(item.fields || {}).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const separator = item.endpoint.includes('?') ? '&' : '?';
  const url = `${item.endpoint}${separator}idempotencyKey=${item.idempotencyKey}`;

  return apiClient(url, { method: item.method || 'POST', body: formData });
}

// Annule le minuteur de retry en attente, s'il y en a un — toujours appelé avant
// d'en programmer un nouveau, pour ne jamais en accumuler plusieurs en parallèle.
function clearRetryTimer() {
  if (retryTimer) {
    clearTimeout(retryTimer);
    retryTimer = null;
  }
}

// Programme UN SEUL réveil ciblé, exactement à l'heure du prochain retry connu —
// jamais de sondage répété (pas de setInterval). Entre deux réveils, aucun code ne
// tourne : rien ne consomme de batterie ni ne fait chauffer l'appareil en attendant.
function scheduleNextRetry(queueAfterRun) {
  clearRetryTimer();

  const pending = queueAfterRun
    .filter((item) => item.status === 'FAILED' && item.nextAttemptAt && item.attempts < MAX_ATTEMPTS)
    .map((item) => item.nextAttemptAt);

  if (pending.length === 0) return;

  const nextAt = Math.min(...pending);
  const delay = Math.max(0, nextAt - Date.now());

  retryTimer = setTimeout(() => {
    retryTimer = null;
    processQueueOnce();
  }, delay);
}

/**
 * Traite la file une fois, dans l'ordre, un élément à la fois (jamais en parallèle,
 * pour ne pas saturer une connexion qui vient de revenir). Ne relance jamais un
 * élément déjà abandonné (MAX_ATTEMPTS atteint) ni un élément encore en backoff.
 * N'écrit jamais d'exception non gérée : chaque échec est isolé sur son propre
 * élément sans interrompre le traitement des suivants. À la fin, programme un
 * unique réveil ciblé pour le prochain retry si besoin (voir scheduleNextRetry).
 */
export async function processQueueOnce() {
  if (isProcessing) return;
  isProcessing = true;

  try {
    const queue = await getQueue();
    const now = Date.now();

    for (const item of queue) {
      if (item.status === 'FAILED' && item.attempts >= MAX_ATTEMPTS) continue; // abandonné définitivement
      if (item.nextAttemptAt && item.nextAttemptAt > now) continue; // backoff pas encore expiré

      try {
        const result = await uploadItem(item);
        if (result?.error) {
          throw new Error(result.error);
        }
        // Succès confirmé par le backend : seul moment où on supprime la copie locale.
        await removeFromQueue(item.id);
        notifySuccess(item, result);
      } catch (err) {
        const attempts = item.attempts + 1;
        const gaveUp = attempts >= MAX_ATTEMPTS;
        await updateQueueItem(item.id, {
          status: 'FAILED',
          attempts,
          lastError: err.message || 'Erreur inconnue',
          nextAttemptAt: gaveUp ? null : now + computeBackoffMs(attempts),
        });
      }
    }

    scheduleNextRetry(await getQueue());
  } finally {
    isProcessing = false;
  }
}

/**
 * À appeler une seule fois au démarrage de l'app (voir App.js). Déclenche un
 * traitement de la file dès que la connexion redevient disponible ET stable, plus
 * un premier passage immédiat au cas où des éléments attendaient déjà un précédent
 * lancement de l'app.
 */
export function startUploadQueueSync() {
  if (netInfoUnsubscribe) return; // déjà démarré

  netInfoUnsubscribe = NetInfo.addEventListener((state) => {
    if (!(state.isConnected && state.isInternetReachable !== false)) return;

    // Une connexion instable peut déclencher plusieurs événements en quelques
    // secondes (flapping) — on ne garde que le dernier plutôt que de lancer un
    // traitement à chaque notification, pour éviter une rafale de requêtes inutiles.
    if (netInfoDebounceTimer) clearTimeout(netInfoDebounceTimer);
    netInfoDebounceTimer = setTimeout(() => {
      netInfoDebounceTimer = null;
      processQueueOnce();
    }, NETINFO_DEBOUNCE_MS);
  });

  processQueueOnce();
  registerBackgroundSync();
}

export function stopUploadQueueSync() {
  if (netInfoUnsubscribe) {
    netInfoUnsubscribe();
    netInfoUnsubscribe = null;
  }
  if (netInfoDebounceTimer) {
    clearTimeout(netInfoDebounceTimer);
    netInfoDebounceTimer = null;
  }
  clearRetryTimer();
}

// ──────────────────────────────────────────────────────────────────────────
// Synchronisation quand l'app est en arrière-plan.
//
// ⚠️ À vérifier lors du premier test réel : expo-task-manager + expo-background-fetch
// est le mécanisme historique pour ce genre de tâche, mais l'API de fond d'Expo a
// bougé sur les versions récentes du SDK (expo-background-task tend à remplacer
// expo-background-fetch). Sur ce projet (Expo SDK 54), à confirmer avant de s'y fier
// en production — la synchro au premier plan (NetInfo, ci-dessus) fonctionne de
// toute façon indépendamment de cette partie.
// ──────────────────────────────────────────────────────────────────────────

// defineTask() s'exécute à l'import du module, avant même le premier rendu React —
// une exception ici (ex. module natif non disponible dans Expo Go) pourrait bloquer
// le chargement de toute l'app. On l'isole donc dans un try/catch, et on retient si
// ça a marché pour ne pas tenter l'enregistrement plus loin si ce n'est pas le cas.
let backgroundTaskDefined = false;
try {
  TaskManager.defineTask(BACKGROUND_TASK_NAME, async () => {
    try {
      const queueBefore = await getQueue();
      if (queueBefore.length === 0) return BackgroundFetch.BackgroundFetchResult.NoData;

      await processQueueOnce();
      return BackgroundFetch.BackgroundFetchResult.NewData;
    } catch (e) {
      console.error('❌ [uploadQueueSync] Tâche de fond en échec:', e.message);
      return BackgroundFetch.BackgroundFetchResult.Failed;
    }
  });
  backgroundTaskDefined = true;
} catch (e) {
  console.error('❌ [uploadQueueSync] defineTask indisponible (normal sous Expo Go) :', e.message);
}

async function registerBackgroundSync() {
  if (!backgroundTaskDefined) return;

  try {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK_NAME);
    if (isRegistered) return;

    await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK_NAME, {
      minimumInterval: 15 * 60, // secondes — 15 min, minimum réaliste de toute façon imposé par l'OS
      stopOnTerminate: false,
      startOnBoot: true,
    });
  } catch (e) {
    // Non bloquant : la synchro au premier plan fonctionne indépendamment de ceci.
    console.error('❌ [uploadQueueSync] Enregistrement tâche de fond impossible:', e.message);
  }
}
