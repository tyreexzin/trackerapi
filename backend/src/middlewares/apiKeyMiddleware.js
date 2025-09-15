// backend/src/middlewares/apiKeyMiddleware.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
    // Procura a chave no header OU no corpo da requisição
    const apiKey = req.headers['x-api-key'] || req.body.sellerApiKey;

    if (!apiKey) {
        return res.status(401).json({ message: 'API Key não fornecida.' });
    }

    try {
        const seller = await prisma.seller.findUnique({
            where: { apiKey }
        });

        if (!seller) {
            return res.status(403).json({ message: 'API Key inválida.' });
        }

        req.seller = seller;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao validar a API Key.' });
    }
};