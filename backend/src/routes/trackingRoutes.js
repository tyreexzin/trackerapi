// src/routes/trackingRoutes.js

const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

// Esta rota é pública, então NÃO usamos o authMiddleware aqui.
// A autenticação é feita pela API Key dentro do controller.
router.post('/registerClick', apiKeyMiddleware, trackingController.registerClick);

module.exports = router;