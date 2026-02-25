const express = require("express");
const router = express.Router();

const {
    createPersonnel,
    getPersonnels,
    getPersonnelById,
    updatePersonnel,
    deletePersonnel,
    togglePersonnelStatus,
} = require("../../controllers/admin/personnelControllers");

const { verifierToken } = require("../../middlewares/authMiddlewares");
const isAdmin = require("../../middlewares/isAdmin");

/**
 * @swagger
 * /api/admin/personnel:
 *   post:
 *     summary: Créer un membre du personnel
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               role:
 *                 type: string
 *               email:
 *                 type: string
 *               telephone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Personnel créé
 */
router.post("/", verifierToken, isAdmin, createPersonnel);

/**
 * @swagger
 * /api/admin/personnel:
 *   get:
 *     summary: Obtenir la liste du personnel
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste du personnel
 */
router.get("/", verifierToken, isAdmin, getPersonnels);

/**
 * @swagger
 * /api/admin/personnel/{id}:
 *   get:
 *     summary: Obtenir les détails d'un membre du personnel
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails du personnel
 */
router.get("/:id", verifierToken, isAdmin, getPersonnelById);

/**
 * @swagger
 * /api/admin/personnel/{id}:
 *   put:
 *     summary: Modifier un membre du personnel
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Personnel modifié
 */
router.put("/:id", verifierToken, isAdmin, updatePersonnel);

/**
 * @swagger
 * /api/admin/personnel/{id}:
 *   delete:
 *     summary: Supprimer un membre du personnel
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personnel supprimé
 */
router.delete("/:id", verifierToken, isAdmin, deletePersonnel);

/**
 * @swagger
 * /api/admin/personnel/{id}/status:
 *   put:
 *     summary: Changer le statut d'un membre du personnel
 *     tags: [4 - Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Statut mis à jour
 */
router.put("/:id/status", verifierToken, isAdmin, togglePersonnelStatus);

module.exports = router;
