// src/services/passwordResetService.js
//
// Service pour le flux "Mot de passe oublie" (pages/MotDePasseOublie.jsx).
//
// !!! SIMULATION FRONTEND UNIQUEMENT !!!
// Aucune de ces fonctions n'appelle le backend reel. Elles simulent un
// aller-retour reseau (delai + reponse mock) pour permettre de construire
// et tester l'integralite du parcours cote client (ecrans, validations,
// etats de chargement/erreur) sans dependre d'une API qui n'existe pas
// encore. Chaque fonction documente le payload/la reponse attendus pour
// que Personne A puisse brancher le vrai backend derriere cette meme
// interface (memes noms de fonctions, memes formes de payload/reponse)
// sans avoir a toucher aux ecrans.
//
// Pour brancher le vrai backend : remplacer le corps de chaque fonction par
// un appel apiClient (voir services/authService.js pour le patron a suivre),
// en conservant la signature (parametres et forme de la reponse) documentee
// ci-dessous.

const MOCK_NETWORK_DELAY_MS = 900;

const mockDelay = (result, { shouldFail = false, failMessage = 'Une erreur est survenue.' } = {}) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject({ response: { data: { message: failMessage } } });
      else resolve({ data: result });
    }, MOCK_NETWORK_DELAY_MS);
  });

export const passwordResetService = {
  // Etape 1 : demande de reinitialisation.
  // TODO(Backend - Personne A): brancher sur POST /api/auth/mot-de-passe-oublie/demander
  // Payload attendu : { identifiant: string } (telephone 9 chiffres ou email)
  // Reponse attendue : { succes: boolean, message: string, identifiantMasque?: string }
  //   identifiantMasque : version partiellement masquee de l'identifiant
  //   (ex: "66x xxx x72" ou "j***@exemple.com") a afficher a l'etape 2.
  requestReset: (identifiant) => {
    // Simulation : masque grossierement l'identifiant fourni pour l'aperçu ecran.
    const identifiantMasque = identifiant.includes('@')
      ? identifiant.replace(/^(.).*(@.*)$/, '$1***$2')
      : identifiant.replace(/^(\d{2})\d+(\d{2})$/, '$1•••••$2');

    return mockDelay({
      succes: true,
      message: 'Un code de verification a ete envoye.',
      identifiantMasque,
    });
  },

  // Etape 2 : verification du code recu.
  // TODO(Backend - Personne A): brancher sur POST /api/auth/mot-de-passe-oublie/verifier-code
  // Payload attendu : { identifiant: string, code: string }
  // Reponse attendue : { succes: boolean, message: string, resetToken?: string }
  //   resetToken : jeton temporaire a transmettre a l'etape 3 pour autoriser
  //   le changement de mot de passe (evite de renvoyer le mot de passe en
  //   clair avec l'identifiant seul).
  verifyResetCode: (identifiant, code) => {
    return mockDelay({
      succes: true,
      message: 'Code verifie avec succes.',
      resetToken: 'mock-reset-token',
    });
  },

  // Etape 2 (bis) : renvoyer un nouveau code.
  // TODO(Backend - Personne A): brancher sur POST /api/auth/mot-de-passe-oublie/renvoyer-code
  // Payload attendu : { identifiant: string }
  // Reponse attendue : { succes: boolean, message: string }
  resendResetCode: (identifiant) => {
    return mockDelay({ succes: true, message: 'Nouveau code envoye.' });
  },

  // Etape 3 : definition du nouveau mot de passe.
  // TODO(Backend - Personne A): brancher sur POST /api/auth/mot-de-passe-oublie/reinitialiser
  // Payload attendu : { identifiant: string, resetToken: string, nouveauMotDePasse: string }
  // Reponse attendue : { succes: boolean, message: string }
  resetPassword: (identifiant, resetToken, nouveauMotDePasse) => {
    return mockDelay({ succes: true, message: 'Mot de passe reinitialise avec succes.' });
  },
};
