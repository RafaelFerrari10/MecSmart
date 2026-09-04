const express = require('express');
const cors = require('cors');
const cadastroRoutes = require('./routes/cadastro');
const veiculosRoutes = require('./routes/veiculos');
const pecasRoutes = require('./routes/pecas');
const itensOSRoutes = require('./routes/itensOS');
const financeiroRoutes = require('./routes/financeiro');
const agendamentosRoutes = require('./routes/agendamentos');
const ordensServicoRoutes = require('./routes/ordensServico');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 🔥 CORS - permite requisições de outras origens (ex.: Expo web em :8081)
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use('/api', cadastroRoutes);
app.use('/api', veiculosRoutes);
app.use('/api', pecasRoutes);
app.use('/api', itensOSRoutes);
app.use('/api', financeiroRoutes);
app.use('/api', agendamentosRoutes);
app.use('/api', ordensServicoRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'API de cadastro da oficina rodando' });
});

app.get('/api/firebase-test', async (req, res) => {
  try {
    const { db } = require('./firebase-db');
    const snapshot = await db.collection('usuarios').limit(5).get();
    const usuarios = [];
    snapshot.forEach(doc => {
      usuarios.push({ id: doc.id, ...doc.data() });
    });
    res.json({
      status: 'Firebase conectado!',
      total: usuarios.length,
      usuarios
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});