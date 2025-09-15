// backend/src/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

const app = express();

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

// A rota de webhook continua separada
app.use('/webhooks', webhookRoutes);

if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local rodando na porta ${PORT}`);
  });
}

// Exportamos o app para a Vercel usar como Serverless Function
module.exports = app;