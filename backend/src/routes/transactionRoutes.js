const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

router.get('/transactions', authMiddleware, (req, res) => {
    // Garante que a resposta seja 200 OK com um array vazio como JSON
    res.status(200).json([]);
});

module.exports = router;