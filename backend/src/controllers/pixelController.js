// src/controllers/pixelController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPixel = async (req, res) => {
    const { account_name, pixel_id, meta_api_token } = req.body;
    const { sellerId } = req; // Vem do authMiddleware

    try {
        const newPixel = await prisma.pixel.create({
            data: {
                account_name,
                pixel_id,
                meta_api_token,
                sellerId: sellerId,
            }
        });
        res.status(201).json(newPixel);
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar o pixel.", error: error.message });
    }
};

exports.deletePixel = async (req, res) => {
    const { id } = req.params;
    const { sellerId } = req;

    try {
        // Garante que o usuário só pode deletar o próprio pixel
        const pixel = await prisma.pixel.findUnique({
            where: { id }
        });

        if (pixel.sellerId !== sellerId) {
            return res.status(403).json({ message: "Acesso negado." });
        }

        await prisma.pixel.delete({ where: { id } });
        res.status(204).send(); // 204 No Content = sucesso sem corpo na resposta
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar o pixel.", error: error.message });
    }
};