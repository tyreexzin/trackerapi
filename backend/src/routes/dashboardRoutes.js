// src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

// Usamos o middleware para proteger esta rota.
// Só usuários com token válido podem acessar.
router.get('/dashboard/data', authMiddleware, dashboardController.getInitialData);
router.get('/dashboard/metrics', dashboardController.getMetrics); 

module.exports = router;