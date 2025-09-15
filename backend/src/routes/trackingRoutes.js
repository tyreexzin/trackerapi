const express = require('express');
const router = express.Router();
const trackingController = require('../controllers/trackingController');
const apiKeyMiddleware = require('../middlewares/apiKeyMiddleware');

// Define que a rota POST /registerClick usa o middleware de API Key e chama a função registerClick do controller
router.post('/registerClick', apiKeyMiddleware, trackingController.registerClick);

module.exports = router;