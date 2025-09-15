const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.registerClick = async (req, res) => {
    const { seller } = req; // Vem do apiKeyMiddleware
    const { checkoutId, presselId, ...trackingData } = req.body;

    try {
        const clickData = {
            ...trackingData,
            sellerId: seller.id,
            checkoutId,
            presselId,
        };

        Object.keys(clickData).forEach(key => (clickData[key] === undefined || clickData[key] === null) && delete clickData[key]);

        const newClick = await prisma.click.create({ data: clickData });

        // CORREÇÃO: Enviando a resposta no formato esperado pelo seu script
        res.status(201).json({ status: "success", click_id: newClick.id });

    } catch (error) {
        console.error("[registerClick] Erro ao salvar o clique:", error);
        res.status(500).json({ status: "error", message: "Erro interno ao registrar o clique." });
    }
};