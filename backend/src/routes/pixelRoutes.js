// src/routes/pixelRoutes.js
const express = require('express');
const router = express.Router();
const pixelController = require('../controllers/pixelController');
const authMiddleware = require('../middlewares/authMiddleware');

// Todas as rotas de pixel precisam de login, então usamos o middleware
router.use(authMiddleware);

// Rota para criar um novo pixel (POST /api/pixels)
router.post('/pixels', pixelController.createPixel);

// Rota para deletar um pixel (DELETE /api/pixels/:id)
router.delete('/pixels/:id', pixelController.deletePixel);

module.exports = router;