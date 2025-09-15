// backend/src/routes/dashboardRoutes.js

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/dashboard/data', dashboardController.getInitialData);
// ADICIONE ESTA ROTA
router.get('/dashboard/metrics', dashboardController.getMetrics); 

module.exports = router;