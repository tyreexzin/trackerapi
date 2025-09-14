const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.saveSettings = async (req, res) => {
    const { sellerId } = req; // Vem do authMiddleware
    const settingsData = req.body; // Pega todos os campos do formulário

    try {
        const updatedSettings = await prisma.setting.upsert({
            where: { sellerId: sellerId },
            update: settingsData,
            create: {
                sellerId: sellerId,
                ...settingsData
            }
        });

        res.status(200).json(updatedSettings);
    } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        res.status(500).json({ message: "Erro ao salvar as configurações." });
    }
};