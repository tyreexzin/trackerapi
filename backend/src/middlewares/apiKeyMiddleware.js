// src/middlewares/apiKeyMiddleware.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ message: 'Header x-api-key não fornecido.' });
    }

    try {
        const seller = await prisma.seller.findUnique({
            where: { apiKey }
        });

        if (!seller) {
            return res.status(403).json({ message: 'API Key inválida.' });
        }

        // Anexa o vendedor encontrado ao objeto da requisição para uso no controller
        req.seller = seller;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao validar a API Key.' });
    }
};