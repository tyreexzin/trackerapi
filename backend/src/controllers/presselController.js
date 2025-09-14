// src/controllers/presselController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createPressel = async (req, res) => {
    const { name, white_page_url, bot_id, pixel_ids } = req.body;
    const { sellerId } = req;

    if (!name || !bot_id || !pixel_ids || pixel_ids.length === 0) {
        return res.status(400).json({ message: "Nome, Bot e ao menos um Pixel são obrigatórios." });
    }

    try {
        const newPresselWithRelations = await prisma.pressel.create({
            data: {
                name,
                white_page_url,
                botId: bot_id,
                sellerId,
                pixels: {
                    connect: pixel_ids.map(id => ({ id }))
                }
            },
            include: {
                pixels: { select: { id: true } },
                bot: { select: { bot_name: true } }
            }
        });

        // Formata a resposta para o front-end
        const response = {
            ...newPresselWithRelations,
            pixel_ids: newPresselWithRelations.pixels.map(p => p.id),
            bot_name: newPresselWithRelations.bot.bot_name
        };
        delete response.pixels;
        delete response.bot;

        res.status(201).json(response);
    } catch (error) {
        console.error("Erro ao criar pressel:", error);
        res.status(500).json({ message: "Erro ao criar o pressel.", error: error.message });
    }
};

exports.deletePressel = async (req, res) => {
    const { id } = req.params;
    const { sellerId } = req;

    try {
        const pressel = await prisma.pressel.findUnique({ where: { id } });

        if (!pressel || pressel.sellerId !== sellerId) {
            return res.status(403).json({ message: "Acesso negado ou pressel não encontrado." });
        }

        await prisma.pressel.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar o pressel.", error: error.message });
    }
};