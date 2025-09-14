// src/controllers/trackingController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.registerClick = async (req, res) => {
    // Agora estamos pegando cada campo explicitamente do corpo da requisição
    const {
        sellerApiKey,
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

    if (!sellerApiKey) {
        return res.status(401).json({ message: "API Key do vendedor é obrigatória." });
    }

    try {
        // 1. Encontra o vendedor pela API Key (continua igual)
        const seller = await prisma.seller.findUnique({
            where: { apiKey: sellerApiKey }
        });

        if (!seller) {
            return res.status(403).json({ message: "API Key inválida." });
        }

        // 2. Prepara os dados para salvar o clique, agora com todos os campos nomeados
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
        
        // Bônus: Remove qualquer campo que seja nulo ou indefinido
        // Isso evita erros no banco de dados se um parâmetro opcional não for enviado
        Object.keys(clickData).forEach(key => (clickData[key] === undefined || clickData[key] === null) && delete clickData[key]);

        // 3. Salva o clique no banco de dados (continua igual)
        const newClick = await prisma.click.create({
            data: clickData
        });

        // 4. Retorna o ID do clique (continua igual)
        res.status(201).json({ click_id: newClick.id });

    } catch (error) {
        console.error("Erro ao registrar clique:", error);
        res.status(500).json({ message: "Erro interno ao registrar o clique." });
    }
};