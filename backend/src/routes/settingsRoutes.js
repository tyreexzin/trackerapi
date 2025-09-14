// src/routes/settingsRoutes.js

const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// CORREÇÃO: A rota agora é '/settings/pix' para combinar com o front-end
router.post('/settings/pix', settingsController.saveSettings);

module.exports = router;