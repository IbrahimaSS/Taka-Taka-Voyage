// src/middlewares/roleMiddlewares.js
exports.autoriserRoles = (...rolesAutorises) => {
  const allowed = rolesAutorises.map((r) => String(r).toUpperCase());

  return (req, res, next) => {
    if (!req.utilisateur) {
      return res.status(401).json({
        succes: false,
        message: "Utilisateur non authentifié",
      });
    }

    const roleUser = String(req.utilisateur.role || "").toUpperCase();

    // ✅ DEBUG (tu peux enlever après)
    console.log("🔎 autoriserRoles:", {
      roleUser,
      allowed,
      userId: req.utilisateur._id || req.utilisateur.id,
    });

    if (!allowed.includes(roleUser)) {
      return res.status(403).json({
        succes: false,
        message: "Accès interdit pour ce rôle",
      });
    }

    next();
  };
};