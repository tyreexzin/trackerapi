const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Rota para buscar disparos (protegida por login)
router.get('/dispatches', authMiddleware, (req, res) => {
    // Por enquanto, apenas retorna uma lista vazia
    res.status(200).json([]);
});

module.exports = router;