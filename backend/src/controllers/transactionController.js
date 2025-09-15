const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Lista as transações do usuário que está logado
exports.listTransactions = async (req, res) => {
    const { sellerId } = req; // Vem do authMiddleware

    try {
        const transactions = await prisma.transaction.findMany({
            where: { sellerId },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.status(200).json(transactions);
    } catch (error) {
        console.error("Erro ao buscar transações:", error);
        res.status(500).json({ message: "Erro ao buscar transações." });
    }
};