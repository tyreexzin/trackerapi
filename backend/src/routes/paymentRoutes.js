// backend/src/routes/paymentRoutes.js

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// --- Rota Pública (protegida por API Key) ---
router.post('/pix/generate', apiKeyMiddleware, paymentController.generatePix);

// --- Rota Interna (protegida por Login JWT) ---
router.post('/pix/test-provider', authMiddleware, paymentController.testProviderConnection);

// A rota de status também é pública
router.get('/pix/status/:transactionId', apiKeyMiddleware, paymentController.getPixStatus);

module.exports = router;