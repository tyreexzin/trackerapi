// src/controllers/checkoutController.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.createCheckout = async (req, res) => {
    const { 
        name, 
        product_name, 
        redirect_url, 
        value_type, 
        fixed_value_cents,
        pixel_ids
    } = req.body;
    
    const { sellerId } = req;

    if (!name || !product_name || !redirect_url || !pixel_ids || pixel_ids.length === 0) {
        return res.status(400).json({ message: "Campos obrigatórios faltando. Pelo menos um pixel deve ser selecionado." });
    }

    try {
        const newCheckoutWithPixels = await prisma.checkout.create({
            data: {
                name,
                product_name,
                redirect_url,
                value_type,
                fixed_value_cents: fixed_value_cents ? parseInt(fixed_value_cents) : null,
                sellerId,
                pixels: {
                    connect: pixel_ids.map(id => ({ id: id }))
                }
            },
            // CORREÇÃO: Inclui os pixels relacionados na resposta
            include: {
                pixels: {
                    select: { id: true } // Pega apenas o ID de cada pixel
                }
            }
        });

        // Formata a resposta para o front-end esperar exatamente o que precisa
        const response = {
            ...newCheckoutWithPixels,
            // Cria a propriedade 'pixel_ids' que o front-end estava esperando
            pixel_ids: newCheckoutWithPixels.pixels.map(p => p.id)
        };
        delete response.pixels; // Remove o objeto 'pixels' para evitar redundância

        res.status(201).json(response);
    } catch (error) {
        console.error("Erro ao criar checkout:", error);
        res.status(500).json({ message: "Erro ao criar o checkout.", error: error.message });
    }
};

exports.deleteCheckout = async (req, res) => {
    const { id } = req.params;
    const { sellerId } = req;

    try {
        const checkout = await prisma.checkout.findUnique({ where: { id } });

        if (!checkout || checkout.sellerId !== sellerId) {
            return res.status(403).json({ message: "Acesso negado ou checkout não encontrado." });
        }

        await prisma.checkout.delete({ where: { id } });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: "Erro ao deletar o checkout.", error: error.message });
    }
};