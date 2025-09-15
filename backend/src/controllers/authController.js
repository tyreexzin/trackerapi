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
        console.log(`[Register] Tentando registrar usuário: ${email}`);
        const hashedPassword = await bcrypt.hash(password, 10);

        const newSeller = await prisma.seller.create({
            data: { name, email, password: hashedPassword }
        });

        console.log(`[Register] Usuário ${email} registrado com sucesso.`);
        // Remove a senha da resposta por segurança
        delete newSeller.password;
        res.status(201).json(newSeller);

    } catch (error) {
        // Erro comum: email já existe (definido como @unique no schema)
        if (error.code === 'P2002') {
            console.error(`[Register] Erro: E-mail ${email} já cadastrado.`);
            return res.status(409).json({ message: 'Este e-mail já está em uso.' });
        }
        console.error("[Register] Erro crítico:", error);
        res.status(500).json({ message: 'Erro interno ao registrar usuário.', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
    }

    try {
        console.log(`[Login] Tentativa de login para: ${email}`);
        const seller = await prisma.seller.findUnique({
            where: { email }
        });

        if (!seller) {
            console.log(`[Login] Falha: Usuário ${email} não encontrado.`);
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        console.log(`[Login] Usuário ${email} encontrado. Verificando senha...`);
        const isPasswordValid = await bcrypt.compare(password, seller.password);

        if (!isPasswordValid) {
            console.log(`[Login] Falha: Senha inválida para o usuário ${email}.`);
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        console.log(`[Login] Senha válida. Gerando token JWT...`);
        const token = jwt.sign(
            { sellerId: seller.id },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log(`[Login] Login bem-sucedido para ${email}.`);
        res.status(200).json({ token });

    } catch (error) {
        console.error("[Login] Erro crítico:", error);
        res.status(500).json({ message: 'Erro interno ao processar o login.', error: error.message });
    }
};