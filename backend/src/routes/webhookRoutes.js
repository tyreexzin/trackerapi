// src/routes/webhookRoutes.js

const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Rota pública para receber notificações de pagamento dos gateways
router.post('/payment-confirmed', webhookController.handlePaymentConfirmation);

module.exports = router;