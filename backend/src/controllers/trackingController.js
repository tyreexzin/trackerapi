// backend/src/controllers/trackingController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.registerClick = async (req, res) => {
    // Usamos o req.seller que o apiKeyMiddleware nos deu
    const { seller } = req;

    // Pegamos os dados específicos do corpo
    const {
        checkoutId,
        presselId,
        referer,
        fbclid,
        fbp,
        fbc,
        user_agent,
        utm_source,
        utm_campaign,
        utm_medium,
        utm_content,
        utm_term
    } = req.body;

    try {
        const clickData = {
            sellerId: seller.id, // Usamos o ID do vendedor encontrado pelo middleware
            checkoutId,
            presselId,
            referer,
            fbclid,
            fbp,
            fbc,
            user_agent,
            utm_source,
            utm_campaign,
            utm_medium,
            utm_content,
            utm_term
        };

        // Limpa qualquer campo que seja nulo ou indefinido
        Object.keys(clickData).forEach(key => (clickData[key] === undefined || clickData[key] === null) && delete clickData[key]);

        console.log('[registerClick] Tentando salvar os seguintes dados:', clickData);

        const newClick = await prisma.click.create({
            data: clickData
        });

        console.log(`[registerClick] Clique salvo com sucesso! ID: ${newClick.id}`);

        res.status(201).json({ click_id: newClick.id });

    } catch (error) {
        console.error("[registerClick] Erro CRÍTICO ao salvar o clique:", error);
        // Garante que a resposta de erro seja sempre um JSON
        res.status(500).json({ message: "Erro interno ao registrar o clique.", error: error.message });
    }
};