// src/routes/checkoutRoutes.js

const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const authMiddleware = require('../middlewares/authMiddleware');

// Protege todas as rotas de checkouts
router.use(authMiddleware);

// Rota para criar um novo checkout (POST /api/checkouts)
router.post('/checkouts', checkoutController.createCheckout);

// Rota para deletar um checkout (DELETE /api/checkouts/:id)
router.delete('/checkouts/:id', checkoutController.deleteCheckout);

module.exports = router;