// backend/src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');

// Importa todas as nossas rotas
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const pixelRoutes = require('./routes/pixelRoutes');
const botRoutes = require('./routes/botRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const presselRoutes = require('./routes/presselRoutes');
const trackingRoutes = require('./routes/trackingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const webhookRoutes = require('./routes/webhookRoutes');
const internalRoutes = require('./routes/internalRoutes');

const app = express();

// --- CONFIGURAÇÃO DE CORS (A CORREÇÃO ESTÁ AQUI) ---
// Isso permite que QUALQUER site acesse sua API.
// Para produção, você poderia restringir para domínios específicos.
app.use(cors());

app.use(express.json());

// --- Registra todas as rotas da API ---
app.use('/api', authRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', transactionRoutes);
app.use('/api', dispatchRoutes);
app.use('/api', pixelRoutes);
app.use('/api', botRoutes);
app.use('/api', checkoutRoutes);
app.use('/api', presselRoutes);
app.use('/api', trackingRoutes);
app.use('/api', paymentRoutes);
app.use('/api', settingsRoutes);
app.use('/api', internalRoutes);

// A rota de webhook continua separada
app.use('/webhooks', webhookRoutes);

// Rota de Health Check (Ping)
app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

// --- LÓGICA PARA INICIAR O SERVIDOR ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);

  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  const PING_INTERVALO_MS = 60 * 1000;

  if (RENDER_URL) {
    const selfPing = async () => {
      try {
        await https.get(`${RENDER_URL}/ping`);
        console.log(`[Ping] Ping enviado com sucesso para ${RENDER_URL}`);
      } catch (err) {
        console.error(`[Ping] Erro no auto-ping: ${err.message}`);
      }
    };
    setInterval(selfPing, PING_INTERVALO_MS);
    console.log(`🔁 Auto-ping configurado para a cada 14 minutos.`);
  } else {
    console.log(`[Ping] Auto-ping desativado (não estamos no ambiente Render).`);
  }
});

module.exports = app;