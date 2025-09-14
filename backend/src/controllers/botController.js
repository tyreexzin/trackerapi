// src/controllers/botController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createBot = async (req, res) => {
    const { bot_name, bot_token } = req.body;
    const { sellerId } = req; // Vem do authMiddleware

    try {
        const newBot = await prisma.bot.create({
            data: {
                bot_name,
                bot_token,
                sellerId: sellerId,
            }
        });
        res.status(201).json(newBot);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar o bot.", error: error.message });
    }
};

exports.deleteBot = async (req, res) => {
    const { id } = req.params;
    const { sellerId } = req;

    try {
        const bot = await prisma.bot.findUnique({
            where: { id }
        });

        // Garante que o usuário só pode deletar o próprio bot
        if (!bot || bot.sellerId !== sellerId) {
            return res.status(403).json({ message: "Acesso negado ou bot não encontrado." });
        }

        await prisma.bot.delete({ where: { id } });
        res.status(204).send(); // Sucesso, sem conteúdo
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar o bot.", error: error.message });
    }
};