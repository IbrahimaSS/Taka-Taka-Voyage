import AsyncStorage from '@react-native-async-storage/async-storage';
// SDK 54 déprécie l'API historique (getInfoAsync, makeDirectoryAsync, copyAsync,
// deleteAsync) au profit de nouvelles classes File/Directory. Le sous-chemin
// "/legacy" garde exactement la même API sans l'avertissement/l'erreur de
// dépréciation — confirmé nécessaire lors du premier test réel dans l'app.
import * as FileSystem from 'expo-file-system/legacy';

// Clé AsyncStorage où vit la liste des éléments en attente — un simple tableau JSON.
// Persister ici (et pas juste en mémoire) est ce qui permet à la file de survivre
// à la fermeture/réouverture de l'app, sans mécanisme de reprise supplémentaire.
const QUEUE_STORAGE_KEY = 'uploadQueue:v1';

// Les médias en attente sont copiés ici plutôt que d'être référencés depuis leur
// emplacement d'origine (souvent un cache temporaire de l'image picker), car l'OS
// peut vider ce cache à tout moment avant que la file ne soit traitée.
const QUEUE_DIR = `${FileSystem.documentDirectory}upload-queue/`;

async function ensureQueueDir() {
  const info = await FileSystem.getInfoAsync(QUEUE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(QUEUE_DIR, { intermediates: true });
  }
}

async function readQueue() {
  const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function writeQueue(items) {
  await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(items));
}

// Pas besoin d'une dépendance uuid dédiée : timestamp + suffixe aléatoire suffit
// pour un identifiant local. Réutilisé tel quel comme idempotencyKey côté backend
// (voir checkUploadIdempotency) — un même élément de file = une seule clé, stable
// à travers tous ses essais de renvoi.
function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Ajoute un média à la file d'attente d'upload. Opération locale, quasi instantanée :
 * aucun appel réseau ici, l'app n'attend donc jamais la fin d'un upload pour rester
 * utilisable. Le traitement réel (envoi au backend) est fait séparément par le
 * mécanisme de synchronisation (voir uploadQueueSync.js).
 *
 * @param {string} localUri - URI du fichier sélectionné (ex. depuis expo-image-picker)
 * @param {string} endpoint - chemin d'API relatif (ex. "/chauffeur/profile/documents")
 * @param {string} [method] - méthode HTTP ("POST" par défaut ; "PUT" pour les photos de profil)
 * @param {string} fileFieldName - nom du champ multipart attendu par le backend (ex. "license")
 * @param {string} [fileName] - nom de fichier à envoyer (déduit de l'extension sinon)
 * @param {string} [mimeType] - type MIME du fichier
 * @param {object} [fields] - autres champs texte à envoyer avec le fichier
 */
export async function enqueueUpload({
  localUri,
  endpoint,
  method = 'POST',
  fileFieldName,
  fileName,
  mimeType,
  fields = {},
}) {
  await ensureQueueDir();

  const id = generateId();
  const extension = (fileName || localUri).split('.').pop().split('?')[0] || 'dat';
  const storedPath = `${QUEUE_DIR}${id}.${extension}`;
  await FileSystem.copyAsync({ from: localUri, to: storedPath });

  const item = {
    id,
    idempotencyKey: id,
    localUri: storedPath,
    endpoint,
    method,
    fileFieldName,
    fileName: fileName || `${id}.${extension}`,
    mimeType: mimeType || 'application/octet-stream',
    fields,
    status: 'PENDING', // PENDING -> UPLOADING -> (retiré de la file) | FAILED
    attempts: 0,
    nextAttemptAt: 0, // 0 = tentative autorisée immédiatement
    createdAt: Date.now(),
    lastError: null,
  };

  const queue = await readQueue();
  queue.push(item);
  await writeQueue(queue);

  return item;
}

// Liste tous les éléments en attente (tous statuts confondus) — utilisé par l'UI
// pour afficher un indicateur discret ("en attente d'envoi") et par le moteur de sync.
export async function getQueue() {
  return readQueue();
}

export async function getQueueItem(id) {
  const queue = await readQueue();
  return queue.find((item) => item.id === id) || null;
}

// Met à jour les métadonnées d'un élément (statut, nombre de tentatives, dernière
// erreur) sans jamais toucher au fichier local — seule removeFromQueue le supprime.
export async function updateQueueItem(id, changes) {
  const queue = await readQueue();
  const updated = queue.map((item) => (item.id === id ? { ...item, ...changes } : item));
  await writeQueue(updated);
}

// Ne doit être appelé qu'après confirmation explicite de succès côté backend
// (réponse 200) — supprime à la fois l'entrée de la file ET le fichier local copié.
export async function removeFromQueue(id) {
  const queue = await readQueue();
  const item = queue.find((i) => i.id === id);
  const remaining = queue.filter((i) => i.id !== id);
  await writeQueue(remaining);
  if (item) {
    await FileSystem.deleteAsync(item.localUri, { idempotent: true });
  }
}
