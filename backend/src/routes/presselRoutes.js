// src/routes/presselRoutes.js

const express = require('express');
const router = express.Router();
const presselController = require('../controllers/presselController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware); // Protege todas as rotas

router.post('/pressels', presselController.createPressel);
router.delete('/pressels/:id', presselController.deletePressel);

module.exports = router;