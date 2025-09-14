// src/controllers/paymentController.js
const { PrismaClient } = require('@prisma/client');
const paymentService = require('../services/paymentService');
const prisma = new PrismaClient();

exports.generatePix = async (req, res) => {
    const { value_cents, click_id } = req.body;
    const { seller } = req; // O middleware anexa o vendedor aqui

    if (!value_cents || !click_id) {
        return res.status(400).json({ message: 'Valor e ID do clique são obrigatórios.' });
    }

    try {
        // 1. Chama nosso serviço para gerar o PIX (ele já tem a lógica de fallback)
        const paymentResult = await paymentService.generatePix(seller, value_cents);

        // 2. Cria a transação no nosso banco de dados
        const transaction = await prisma.transaction.create({
            data: {
                clickId: click_id,
                sellerId: seller.id,
                status: 'pending',
                pix_value: parseFloat((value_cents / 100).toFixed(2)),
                provider: paymentResult.provider,
                transaction_id_provider: paymentResult.transaction_id_provider,
            }
        });

        // 3. Retorna os dados para o front-end exibir o QR Code
        res.status(201).json({
            transaction_id: transaction.id, // Nosso ID interno
            qr_code_text: paymentResult.qr_code_text,
            qr_code_base64: paymentResult.qr_code_base64
        });
    } catch (error) {
        console.error("Erro no controller generatePix:", error);
        res.status(500).json({ message: error.message || "Não foi possível gerar o PIX." });
    }
};

exports.getPixStatus = async (req, res) => {
    const { transactionId } = req.params;
    const { seller } = req;

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: transactionId }
        });

        // Validação de segurança: garante que a transação pertence ao vendedor da API Key
        if (!transaction || transaction.sellerId !== seller.id) {
            return res.status(404).json({ message: 'Transação não encontrada.' });
        }

        res.status(200).json({ status: transaction.status });
    } catch (error) {
        res.status(500).json({ message: 'Erro ao consultar status da transação.' });
    }
};

exports.testProviderConnection = async (req, res) => {
    const { provider } = req.body;
    const { sellerId } = req;

    if (!provider) {
        return res.status(400).json({ message: "O nome do provedor é obrigatório." });
    }

    try {
        const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
        
        // CORREÇÃO: Chamando a função de teste dedicada
        const testResult = await paymentService.testProvider(seller, provider);

        res.status(200).json({
            message: `Conexão com ${provider} bem-sucedida!`,
            provider: provider, // Usamos o provider que veio na requisição
            qr_code_text: testResult.qr_code_text,
            responseTime: '0.8s' // Valor simulado
        });

    } catch (error) {
        console.error(`Erro ao testar o provedor ${provider}:`, error);
        res.status(500).json({ message: `Falha na conexão com ${provider}: ${error.message}` });
    }
};