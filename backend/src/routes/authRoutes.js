// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para registrar um novo usuário
router.post('/sellers/register', authController.register);

// Rota para fazer login
router.post('/sellers/login', authController.login);

module.exports = router;