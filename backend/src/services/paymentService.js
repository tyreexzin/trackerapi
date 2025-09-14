const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const prisma = new PrismaClient();
const Stripe = require('stripe');


async function _handlePushinPay(seller, value_cents) {
    const sellerSettings = await prisma.setting.findUnique({
        where: { sellerId: seller.id },
        select: { pushinpay_token: true }
    });

    let token = sellerSettings?.pushinpay_token;
    if (!token) throw new Error("Token da PushinPay não configurado no banco de dados.");

    if (token.includes('|')) {
        token = token.split('|')[1];
    }

    // --- CORREÇÕES BASEADAS NA DOCUMENTAÇÃO ---

    // 1. URL correta do endpoint
    const pushinPayApiUrl = 'https://api.pushinpay.com.br/api/pix/cashIn';

    // 2. Payload com os campos corretos ('value' em vez de 'amount', etc)
    const payload = {
        value: value_cents, // A documentação pede 'value'
        // description e payer não são listados como obrigatórios no exemplo, então removemos por segurança
        // webhook_url: "SUA_URL_DE_WEBHOOK_AQUI" // Adicionar no futuro
    };
    
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    };

    console.log(`Enviando para PushinPay:`, { url: pushinPayApiUrl, payload, headers: { Authorization: `Bearer ${token.substring(0, 10)}...` } });

    try {
        const response = await axios.post(pushinPayApiUrl, payload, { headers });

        // 3. Leitura da resposta correta
        // A documentação diz que a resposta não vem dentro de um objeto 'data'
        const responseData = response.data;
        if (!responseData || !responseData.id) {
            console.error("ERRO: Resposta da PushinPay em formato inesperado:", responseData);
            throw new Error('Resposta inválida da API PushinPay.');
        }

        // 4. Mapeamento dos campos de resposta corretos
        return {
            transaction_id_provider: responseData.id,
            qr_code_text: responseData.qr_code,
            qr_code_base64: responseData.qr_code_base64,
        };
    } catch (error) {
        console.error("ERRO na API PushinPay:", error.response?.data || error.message);
        const errorMessage = error.response?.data?.message || 'Não foi possível conectar. Verifique seu token.';
        throw new Error(`PushinPay: ${errorMessage}`);
    }
}

async function _handleStripe(seller, value_cents) {
    const settings = await prisma.setting.findUnique({
        where: { sellerId: seller.id },
        select: { stripe_secret_key: true }
    });
    
    const secretKey = settings?.stripe_secret_key;
    if (!secretKey) throw new Error("Chave secreta (secret_key) da Stripe não configurada.");

    const stripe = new Stripe(secretKey);

    try {
        // Criamos uma Sessão de Checkout na Stripe
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price_data: {
                    currency: 'brl', // Moeda em Reais
                    product_data: {
                        name: 'Pagamento Tracker', // Nome do produto que aparecerá para o cliente
                    },
                    unit_amount: value_cents, // Valor em centavos
                },
                quantity: 1,
            }],
            mode: 'payment',
            // IMPORTANTE: URLs para onde o cliente é redirecionado após o pagamento
            success_url: `https://seusite.com.br/sucesso?session_id={CHECKOUT_SESSION_ID}`, // Mude para seu domínio
            cancel_url: `https://seusite.com.br/cancelar`, // Mude para seu domínio
        });

        // Para a Stripe, o que precisamos é da URL de redirecionamento
        return {
            transaction_id_provider: session.id, // O ID da sessão da Stripe
            redirect_url: session.url // A URL para onde o cliente deve ser enviado para pagar
        };
    } catch (error) {
        console.error("ERRO na API da Stripe:", error.message);
        throw new Error(`Stripe: ${error.message}`);
    }
}

function _simulateGateway(providerName, value_cents) {
    console.log(`AVISO: Usando simulação para o gateway '${providerName}'.`);
    return {
        transaction_id_provider: `${providerName}_${Date.now()}`,
        qr_code_text: `pix_copia_e_cola_simulado_pelo_${providerName}`,
        qr_code_base64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
    };
}

// --- FUNÇÃO DE TESTE DEDICADA ---
exports.testProvider = async (seller, providerName) => {
    console.log(`Iniciando teste real para o provedor: ${providerName}`);

    // Define os valores de teste para cada gateway
    const pushinpay_test_value = 50;  // R$ 0,50
    const stripe_test_value = 300; // R$ 3,00 (mínimo comum para Stripe)

    if (providerName === 'pushinpay') {
        return await _handlePushinPay(seller, pushinpay_test_value);
    } else if (providerName === 'stripe') {
        return await _handleStripe(seller, stripe_test_value);
    } else {
        // Se for um gateway não implementado, usa a simulação
        console.log(`Gateway '${providerName}' não possui integração real, usando simulação.`);
        return _simulateGateway(providerName, pushinpay_test_value);
    }
};

// --- FUNÇÃO DE GERAÇÃO DE PIX (CORRIGIDA) ---
exports.generatePix = async (seller, value_cents) => {
    const settings = await prisma.setting.findUnique({ where: { sellerId: seller.id } });
    const providers = [
        settings?.pix_provider_primary,
        settings?.pix_provider_secondary,
        settings?.pix_provider_tertiary
    ].filter(p => p); // Remove os slots de provedor que estiverem vazios

    if (providers.length === 0) {
        throw new Error("Nenhum gateway de pagamento configurado na Ordem de Prioridade.");
    }

    for (const provider of providers) {
        try {
            console.log(`Tentando gerar pagamento com o provedor da fila: ${provider}`);
            let result;

            // Lógica para chamar o gateway correto
            if (provider === 'pushinpay') {
                result = await _handlePushinPay(seller, value_cents);
            } else if (provider === 'stripe') {
                result = await _handleStripe(seller, value_cents);
            } else {
                // Fallback para qualquer outro provedor que não esteja implementado
                result = _simulateGateway(provider, value_cents);
            }
            
            console.log(`SUCESSO: Pagamento gerado com ${provider}`);
            return { ...result, provider }; // Retorna o resultado e o nome do provedor que funcionou

        } catch (error) {
            console.error(`Falha com o provedor ${provider}. Tentando o próximo...`, error.message);
            // Se der erro, o 'catch' segura o erro e o loop 'for' continua para o próximo provedor
        }
    }

    // Se o loop terminar e nenhuma função tiver retornado sucesso, significa que todos falharam
    throw new Error("Todos os gateways de pagamento na sua fila de prioridade falharam.");
};