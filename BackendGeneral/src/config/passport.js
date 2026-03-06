const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const Utilisateur = require('../models/Utilisateurs');

module.exports = (app) => {
    app.use(passport.initialize());

    // Configuration Google
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // 1. Chercher par googleId
            let user = await Utilisateur.findOne({ googleId: profile.id });
            if (user) return done(null, user);

            // 2. Chercher par email pour lier le compte
            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await Utilisateur.findOne({ email });
                if (user) {
                    user.googleId = profile.id;
                    if (!user.photoUrl) user.photoUrl = profile.photos?.[0]?.value;
                    await user.save();
                    return done(null, user);
                }
            }

            // 3. Créer nouvel utilisateur
            user = await Utilisateur.create({
                nom: profile.name?.familyName || 'Nom',
                prenom: profile.name?.givenName || profile.displayName || 'Prénom',
                email: email || `${profile.id}@google.com`, // Email par défaut si non fourni
                googleId: profile.id,
                photoUrl: profile.photos?.[0]?.value,
                role: 'PASSAGER',
                statut: 'ACTIF'
            });

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

    // Configuration Facebook
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID || 'dummy_id',
        clientSecret: process.env.FACEBOOK_APP_SECRET || 'dummy_secret',
        callbackURL: process.env.FACEBOOK_CALLBACK_URL || '/api/auth/facebook/callback',
        profileFields: ['id', 'emails', 'name', 'photos']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // 1. Chercher par facebookId
            let user = await Utilisateur.findOne({ facebookId: profile.id });
            if (user) return done(null, user);

            // 2. Chercher par email pour lier le compte
            const email = profile.emails?.[0]?.value;
            if (email) {
                user = await Utilisateur.findOne({ email });
                if (user) {
                    user.facebookId = profile.id;
                    if (!user.photoUrl) user.photoUrl = profile.photos?.[0]?.value;
                    await user.save();
                    return done(null, user);
                }
            }

            // 3. Créer nouvel utilisateur
            user = await Utilisateur.create({
                nom: profile.name?.familyName || 'Nom',
                prenom: profile.name?.givenName || profile.displayName || 'Prénom',
                email: email || `${profile.id}@facebook.com`, // Email par défaut si non fourni
                facebookId: profile.id,
                photoUrl: profile.photos?.[0]?.value,
                role: 'PASSAGER',
                statut: 'ACTIF'
            });

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));
};
