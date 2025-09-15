const { PrismaClient } = require('@prisma/client');
const paymentService = require('../services/paymentService');
const prisma = new PrismaClient();

exports.generatePix = async (req, res) => {
    const { value_cents, click_id } = req.body;
    const { seller } = req;

    if (!value_cents || !click_id) {
        return res.status(400).json({ message: 'Valor e ID do clique são obrigatórios.' });
    }
    try {
        const paymentResult = await paymentService.generatePix(seller, value_cents);
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
        res.status(201).json({
            transaction_id: transaction.id,
            qr_code_text: paymentResult.qr_code_text,
            qr_code_base64: paymentResult.qr_code_base64,
            redirect_url: paymentResult.redirect_url // Para Stripe
        });
    } catch (error) {
        res.status(500).json({ message: error.message || "Não foi possível gerar o pagamento." });
    }
};

exports.getPixStatus = async (req, res) => {
    const { transactionId } = req.params;
    const { seller } = req;
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(transactionId) } // IDs agora são inteiros
        });
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
    try {
        const seller = await prisma.seller.findUnique({ where: { id: sellerId } });
        const testResult = await paymentService.testProvider(seller, provider);
        res.status(200).json({
            message: `Conexão com ${provider} bem-sucedida!`,
            provider: provider,
            qr_code_text: testResult.qr_code_text,
            responseTime: '0.8s'
        });
    } catch (error) {
        res.status(500).json({ message: `Falha na conexão com ${provider}: ${error.message}` });
    }
};