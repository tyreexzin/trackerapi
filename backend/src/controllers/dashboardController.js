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

exports.getMetrics = async (req, res) => {
    const { sellerId } = req;
    
    // Filtros de data (opcionais, vindo da URL. Ex: ?startDate=2025-09-01)
    const { startDate, endDate } = req.query;
    const dateFilter = startDate && endDate 
        ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } } 
        : {};

    try {
        // Usando o poder do Prisma para calcular tudo de uma vez
        const total_clicks = await prisma.click.count({
            where: { sellerId, ...dateFilter }
        });

        const pix_transactions = await prisma.transaction.aggregate({
            _count: { id: true },
            _sum: { pix_value: true },
            where: { sellerId, ...dateFilter }
        });

        const paid_pix_transactions = await prisma.transaction.aggregate({
            _count: { id: true },
            _sum: { pix_value: true },
            where: { sellerId, status: 'paid', ...dateFilter }
        });

        const metrics = {
            total_clicks: total_clicks || 0,
            total_pix_generated: pix_transactions._count.id || 0,
            total_revenue: pix_transactions._sum.pix_value || 0,
            total_pix_paid: paid_pix_transactions._count.id || 0,
            paid_revenue: paid_pix_transactions._sum.pix_value || 0,
            // Outras métricas como 'bots_performance' e 'clicks_by_state' podem ser adicionadas aqui
            // usando groupBy e aggregate do Prisma.
        };

        res.status(200).json(metrics);

    } catch (error) {
        console.error("Erro ao buscar métricas do dashboard:", error);
        res.status(500).json({ message: 'Erro ao buscar as métricas.' });
    }
};