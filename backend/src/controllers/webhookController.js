// src/controllers/webhookController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.handlePaymentConfirmation = async (req, res) => {
    // Cada gateway envia os dados de uma forma. Estamos simulando que eles
    // enviam o `transaction_id_provider`, que é o ID que eles nos deram.
    const { transaction_id_provider } = req.body;

    console.log(`[WEBHOOK RECEBIDO] Tentando confirmar pagamento para a transação do provedor: ${transaction_id_provider}`);

    if (!transaction_id_provider) {
        return res.status(400).json({ message: "ID da transação do provedor não foi enviado." });
    }

    try {
        const transaction = await prisma.transaction.findFirst({
            where: {
                transaction_id_provider: transaction_id_provider,
                status: 'pending'
            }
        });

        if (!transaction) {
            console.log(`[WEBHOOK AVISO] Nenhuma transação pendente encontrada para o ID: ${transaction_id_provider}`);
            return res.status(200).json({ message: "Nenhuma transação pendente encontrada ou já processada." });
        }

        await prisma.transaction.update({
            where: { id: transaction.id },
            data: { status: 'paid' }
        });

        console.log(`[SUCESSO] Transação ${transaction.id} atualizada para 'paid'.`);

        res.status(200).json({ message: "Pagamento confirmado com sucesso." });

    } catch (error) {
        console.error("[WEBHOOK ERRO]", error);
        res.status(500).json({ message: "Erro interno ao processar a notificação." });
    }
};