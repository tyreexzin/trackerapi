const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.registerClick = async (req, res) => {
    // A variável 'seller' é adicionada aqui pelo nosso apiKeyMiddleware
    const { seller } = req;

    // Pegamos os dados do corpo da requisição
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
            sellerId: seller.id,
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

        // Limpa qualquer campo que seja nulo, indefinido ou a própria chave de api do corpo
        Object.keys(clickData).forEach(key =>
            (clickData[key] === undefined || clickData[key] === null || key === 'sellerApiKey') && delete clickData[key]
        );

        const newClick = await prisma.click.create({
            data: clickData
        });

        // Responde com o formato que o seu script da Pressel espera
        res.status(201).json({ status: "success", click_id: newClick.id });

    } catch (error) {
        console.error("[registerClick] Erro CRÍTICO ao salvar o clique:", error);
        // Garante que a resposta de erro seja sempre um JSON
        res.status(500).json({ status: "error", message: "Erro interno ao registrar o clique.", error: error.message });
    }
};