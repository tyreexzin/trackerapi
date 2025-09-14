// src/controllers/authController.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Verifica se o email já existe
        const existingSeller = await prisma.seller.findUnique({ where: { email } });
        if (existingSeller) {
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cria o usuário no banco de dados
        const seller = await prisma.seller.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        // Cria as configurações iniciais para o usuário
        await prisma.setting.create({
            data: {
                sellerId: seller.id
            }
        });

        res.status(201).json({ message: 'Usuário cadastrado com sucesso!' });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail and senha são obrigatórios.' });
    }

    try {
        // Busca o usuário pelo e-mail
        const seller = await prisma.seller.findUnique({ where: { email } });
        if (!seller) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Compara a senha enviada com a senha criptografada no banco
        const isPasswordValid = await bcrypt.compare(password, seller.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Gera o Token JWT
        const token = jwt.sign(
            { sellerId: seller.id }, // O que vai dentro do token
            process.env.JWT_SECRET,   // A chave secreta do .env
            { expiresIn: '7d' }       // Duração do token
        );

        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Erro no servidor.', error: error.message });
    }
};