// src/routes/botRoutes.js

const express = require('express');
const router = express.Router();
const botController = require('../controllers/botController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege todas as rotas de bots com o middleware de login
router.use(authMiddleware);

// Rota para criar um novo bot (POST /api/bots)
router.post('/bots', botController.createBot);

// Rota para deletar um bot (DELETE /api/bots/:id)
router.delete('/bots/:id', botController.deleteBot);

module.exports = router;