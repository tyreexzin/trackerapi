// src/controllers/dashboardController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getInitialData = async (req, res) => {
    const { sellerId } = req;

    try {
        const seller = await prisma.seller.findUnique({
            where: { id: sellerId },
            include: {
                pixels: true,
                bots: true,
                pressels: { include: { bot: { select: { bot_name: true } } } },
                // CORREÇÃO: Pede para o Prisma incluir os pixels de cada checkout
                checkouts: {
                    include: {
                        pixels: { select: { id: true } }
                    }
                },
                settings: true,
            }
        });

        if (!seller) {
            return res.status(404).json({ message: "Vendedor não encontrado." });
        }

        // Formata os checkouts para adicionar a propriedade 'pixel_ids'
        const formattedCheckouts = seller.checkouts.map(checkout => ({
            ...checkout,
            pixel_ids: checkout.pixels.map(p => p.id)
        }));

        const formattedPressels = seller.pressels.map(p => ({
            ...p,
            bot_name: p.bot.bot_name,
        }));
        
        const finalSettings = {
            ...seller.settings,
            apiKey: seller.apiKey 
        };

        res.status(200).json({
            pixels: seller.pixels,
            bots: seller.bots,
            pressels: formattedPressels,
            checkouts: formattedCheckouts, // Envia os checkouts formatados
            settings: finalSettings
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados.', error: error.message });
    }
};