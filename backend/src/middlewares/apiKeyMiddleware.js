// backend/src/middlewares/apiKeyMiddleware.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

module.exports = async (req, res, next) => {
    // Procura a chave no header (padrão) OU no corpo da requisição (para compatibilidade)
    const apiKey = req.headers['x-api-key'] || req.body.sellerApiKey;

    if (!apiKey) {
        // Se não encontrar em nenhum dos dois lugares, retorna o erro.
        return res.status(401).json({ message: 'API Key não fornecida no header (x-api-key) ou no corpo (sellerApiKey).' });
    }

    try {
        const seller = await prisma.seller.findUnique({
            where: { apiKey }
        });

        if (!seller) {
            return res.status(403).json({ message: 'API Key inválida.' });
        }

        // Anexa o vendedor encontrado na requisição para ser usado pelo controller
        req.seller = seller;
        next();
    } catch (error) {
        res.status(500).json({ message: 'Erro interno ao validar a API Key.' });
    }
};