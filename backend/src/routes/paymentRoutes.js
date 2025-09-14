const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

// --- Rotas Públicas (usadas pelo checkout, protegidas por API Key) ---
router.post('/pix/generate', apiKeyMiddleware, paymentController.generatePix);
router.get('/pix/status/:transactionId', apiKeyMiddleware, paymentController.getPixStatus);

// --- Rotas Internas (usadas no dashboard, protegidas por Login JWT) ---
router.post('/pix/test-provider', authMiddleware, paymentController.testProviderConnection);

module.exports = router;