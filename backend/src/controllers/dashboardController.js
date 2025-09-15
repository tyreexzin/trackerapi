// backend/src/controllers/dashboardController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// A função getInitialData que busca os dados iniciais continua a mesma
exports.getInitialData = async (req, res) => {
    const { sellerId } = req;
    try {
        const seller = await prisma.seller.findUnique({
            where: { id: sellerId },
            include: {
                pixels: true,
                bots: true,
                pressels: { include: { bot: { select: { bot_name: true } }, pixels: { select: { id: true } } } },
                checkouts: { include: { pixels: { select: { id: true } } } },
                settings: true,
            }
        });
        if (!seller) return res.status(404).json({ message: "Vendedor não encontrado." });

        const formattedCheckouts = seller.checkouts.map(checkout => ({ ...checkout, pixel_ids: checkout.pixels.map(p => p.id) }));
        const formattedPressels = seller.pressels.map(pressel => ({ ...pressel, pixel_ids: pressel.pixels.map(p => p.id), bot_name: pressel.bot.bot_name }));

        // A PARTE MAIS IMPORTANTE ESTÁ AQUI:
        const finalSettings = {
            ...seller.settings,
            apiKey: seller.apiKey // Garante que a apiKey do vendedor seja incluída
        };

        res.status(200).json({
            pixels: seller.pixels,
            bots: seller.bots,
            pressels: formattedPressels,
            checkouts: formattedCheckouts,
            settings: finalSettings
        });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar dados.', error: error.message });
    }
};

// ADICIONE A NOVA FUNÇÃO ABAIXO PARA AS MÉTRICAS
exports.getMetrics = async (req, res) => {
    const { sellerId } = req;
    const { startDate, endDate } = req.query;

    const dateFilter = startDate && endDate 
        ? { createdAt: { gte: new Date(startDate), lte: new Date(new Date(endDate).setHours(23, 59, 59)) } } 
        : {};

    try {
        const total_clicks = await prisma.click.count({
            where: { sellerId, ...dateFilter }
        });

        const generated_transactions = await prisma.transaction.aggregate({
            _count: { id: true },
            _sum: { pix_value: true },
            where: { sellerId, ...dateFilter }
        });

        const paid_transactions = await prisma.transaction.aggregate({
            _count: { id: true },
            _sum: { pix_value: true },
            where: { sellerId, status: 'paid', ...dateFilter }
        });

        const metrics = {
            total_clicks: total_clicks || 0,
            total_pix_generated: generated_transactions._count.id || 0,
            total_revenue: generated_transactions._sum.pix_value || 0,
            total_pix_paid: paid_transactions._count.id || 0,
            paid_revenue: paid_transactions._sum.pix_value || 0,
        };

        res.status(200).json(metrics);
    } catch (error) {
        console.error("Erro ao buscar métricas do dashboard:", error);
        res.status(500).json({ message: 'Erro ao buscar as métricas.' });
    }
};