exports.calculerBadges = (nombreTrajets) => {
    const badges = [];

    if (nombreTrajets >= 3) badges.push("DEBUTANT");
    if (nombreTrajets >= 10) badges.push("FIDELE");
    if (nombreTrajets >= 30) badges.push("GOLD");
    if (nombreTrajets >= 50) badges.push("VIP");

    return badges;
};
