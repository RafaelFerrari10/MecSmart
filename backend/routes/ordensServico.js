const express = require('express');
const crypto = require('crypto');
const { carregarOrdens, salvarOrdens, carregarUsuarios, carregarVeiculos } = require('../db');

// Integração com o Firebase (opcional)
const { db, admin } = require('../firebase-db');

const router = express.Router();

// GET /api/ordensServico
// Query params: clienteId, veiculoId, mecanicoId, status
router.get('/ordensServico', (req, res) => {
  const { clienteId, veiculoId, mecanicoId, status } = req.query;
  let ordens = carregarOrdens();

  if (clienteId) ordens = ordens.filter((o) => o.clienteId === clienteId);
  if (veiculoId) ordens = ordens.filter((o) => o.veiculoId === veiculoId);
  if (mecanicoId) ordens = ordens.filter((o) => o.mecanicoId === mecanicoId);
  if (status !== undefined) ordens = ordens.filter((o) => o.status === status);

  // Mais recentes primeiro
  ordens = [...ordens].sort((a, b) => (b.numero || 0) - (a.numero || 0));

  return res.json({ sucesso: true, ordens });
});

// GET /api/ordensServico/:id
router.get('/ordensServico/:id', (req, res) => {
  const os = carregarOrdens().find((o) => o.id === req.params.id);
  if (!os) {
    return res.status(404).json({ sucesso: false, erros: ['Ordem de serviço não encontrada.'] });
  }
  return res.json({ sucesso: true, ordem: os });
});

// POST /api/ordensServico
router.post('/ordensServico', (req, res) => {
  const {
    clienteId,
    veiculoId,
    mecanicoId,
    status,
    dataAbertura,
    valorTotal,
    valorDesconto,
    valorFinal,
    observacoes,
    problemas,
    condicao,
    checklist,
  } = req.body;

  if (veiculoId && !carregarVeiculos().some((v) => v.id === veiculoId)) {
    return res.status(404).json({ sucesso: false, erros: ['Veículo não encontrado.'] });
  }
  if (mecanicoId && !carregarUsuarios().some((u) => u.uid === mecanicoId)) {
    return res.status(404).json({ sucesso: false, erros: ['Mecânico não encontrado.'] });
  }

  const ordens = carregarOrdens();
  const proximoNumero = ordens.reduce((max, o) => Math.max(max, o.numero || 0), 0) + 1;

  const novaOS = {
    id: crypto.randomUUID(),
    numero: proximoNumero,
    clienteId: clienteId || '',
    veiculoId: veiculoId || '',
    mecanicoId: mecanicoId || '',
    status: status || 'PENDENTE',
    dataAbertura: dataAbertura || new Date().toLocaleDateString('pt-BR'),
    dataConclusao: null,
    valorTotal: valorTotal ?? 0,
    valorDesconto: valorDesconto ?? 0,
    valorFinal: valorFinal ?? 0,
    observacoes: observacoes || '',
    problemas: Array.isArray(problemas) ? problemas : [],
    condicao: condicao || 'ok',
    checklist: Array.isArray(checklist) ? checklist : [],
    criadoEm: new Date().toISOString(),
  };

  ordens.push(novaOS);
  salvarOrdens(ordens);

  return res.status(201).json({
    sucesso: true,
    mensagem: 'Ordem de serviço criada com sucesso!',
    ordem: novaOS,
  });
});

// Salva a OS também no Firebase (rota opcional)
router.post('/ordensServico-firebase', async (req, res) => {
  const {
    clienteId,
    veiculoId,
    mecanicoId,
    status,
    dataAbertura,
    valorTotal,
    valorDesconto,
    valorFinal,
    observacoes,
    problemas,
    condicao,
    checklist,
  } = req.body;

  const ordens = carregarOrdens();
  const proximoNumero = ordens.reduce((max, o) => Math.max(max, o.numero || 0), 0) + 1;

  try {
    const firebaseData = {
      numero: proximoNumero,
      clienteId: clienteId || '',
      veiculoId: veiculoId || '',
      mecanicoId: mecanicoId || '',
      status: status || 'PENDENTE',
      dataAbertura: dataAbertura || new Date().toLocaleDateString('pt-BR'),
      dataConclusao: null,
      valorTotal: valorTotal ?? 0,
      valorDesconto: valorDesconto ?? 0,
      valorFinal: valorFinal ?? 0,
      observacoes: observacoes || '',
      problemas: Array.isArray(problemas) ? problemas : [],
      condicao: condicao || 'ok',
      checklist: Array.isArray(checklist) ? checklist : [],
      criadoEm: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection('ordensServico').add(firebaseData);
    const firebaseId = docRef.id;

    const novaOS = {
      ...firebaseData,
      id: firebaseId,
      dataConclusao: null,
      criadoEm: new Date().toISOString(),
      firebaseId,
    };

    ordens.push(novaOS);
    salvarOrdens(ordens);

    return res.status(201).json({
      sucesso: true,
      mensagem: 'Ordem de serviço salva no Firebase e no JSON!',
      firebaseId,
      ordem: novaOS,
    });
  } catch (error) {
    console.error('Erro ao salvar ordem de serviço no Firebase:', error);
    return res.status(500).json({
      sucesso: false,
      erros: ['Erro ao salvar no Firebase: ' + error.message],
    });
  }
});

// Lista as OS direto do Firebase (rota opcional)
router.get('/ordensServico-firebase', async (req, res) => {
  try {
    const { clienteId, veiculoId, mecanicoId, status } = req.query;
    let query = db.collection('ordensServico');

    if (clienteId) query = query.where('clienteId', '==', clienteId);
    if (veiculoId) query = query.where('veiculoId', '==', veiculoId);
    if (mecanicoId) query = query.where('mecanicoId', '==', mecanicoId);
    if (status !== undefined) query = query.where('status', '==', status);

    const snapshot = await query.get();
    const ordens = [];
    snapshot.forEach((doc) => {
      ordens.push({ id: doc.id, ...doc.data() });
    });

    return res.json({ sucesso: true, ordens });
  } catch (error) {
    console.error('Erro ao listar ordens de serviço do Firebase:', error);
    return res.status(500).json({
      sucesso: false,
      erros: ['Erro ao listar do Firebase: ' + error.message],
    });
  }
});

// GET /api/ordensServico/:id/detalhada
router.get('/ordensServico/:id/detalhada', (req, res) => {
  const os = carregarOrdens().find((o) => o.id === req.params.id);
  if (!os) {
    return res.status(404).json({ sucesso: false, erros: ['Ordem de serviço não encontrada.'] });
  }

  const veiculo = carregarVeiculos().find((v) => v.id === os.veiculoId) || null;
  const cliente = os.clienteId
    ? carregarUsuarios().find((u) => u.uid === os.clienteId) || null
    : null;

  return res.json({ sucesso: true, ordem: os, veiculo, cliente });
});

// PUT /api/ordensServico/:id
router.put('/ordensServico/:id', (req, res) => {
  const ordens = carregarOrdens();
  const indice = ordens.findIndex((o) => o.id === req.params.id);

  if (indice === -1) {
    return res.status(404).json({ sucesso: false, erros: ['Ordem de serviço não encontrada.'] });
  }

  const atual = ordens[indice];
  const {
    status,
    dataConclusao,
    valorTotal,
    valorDesconto,
    valorFinal,
    observacoes,
    problemas,
    condicao,
    checklist,
    aprovada,
    retiradaSolicitada,
  } = req.body;

  ordens[indice] = {
    ...atual,
    status: status !== undefined ? status : atual.status,
    dataConclusao: dataConclusao !== undefined ? dataConclusao : atual.dataConclusao,
    valorTotal: valorTotal !== undefined ? valorTotal : atual.valorTotal,
    valorDesconto: valorDesconto !== undefined ? valorDesconto : atual.valorDesconto,
    valorFinal: valorFinal !== undefined ? valorFinal : atual.valorFinal,
    observacoes: observacoes !== undefined ? observacoes : atual.observacoes,
    problemas: problemas !== undefined ? problemas : atual.problemas,
    condicao: condicao !== undefined ? condicao : atual.condicao,
    checklist: checklist !== undefined ? checklist : atual.checklist,
    aprovada: aprovada !== undefined ? aprovada : atual.aprovada,
    retiradaSolicitada: retiradaSolicitada !== undefined ? retiradaSolicitada : atual.retiradaSolicitada,
  };

  salvarOrdens(ordens);

  return res.json({
    sucesso: true,
    mensagem: 'Ordem de serviço atualizada com sucesso!',
    ordem: ordens[indice],
  });
});

// PATCH /api/ordensServico/:id/status  -> body: { status }
router.patch('/ordensServico/:id/status', (req, res) => {
  const { status } = req.body;
  if (!status) {
    return res.status(400).json({ sucesso: false, erros: ['Informe o novo status.'] });
  }

  const ordens = carregarOrdens();
  const indice = ordens.findIndex((o) => o.id === req.params.id);
  if (indice === -1) {
    return res.status(404).json({ sucesso: false, erros: ['Ordem de serviço não encontrada.'] });
  }

  ordens[indice].status = status;
  if (status === 'APROVADA') {
    ordens[indice].dataConclusao = new Date().toLocaleDateString('pt-BR');
    ordens[indice].aprovada = true;
  }
  if (status === 'RETIRADA SOLICITADA') {
    ordens[indice].retiradaSolicitada = true;
  }

  salvarOrdens(ordens);

  return res.json({
    sucesso: true,
    mensagem: 'Status atualizado com sucesso!',
    ordem: ordens[indice],
  });
});

// DELETE /api/ordensServico/:id
router.delete('/ordensServico/:id', (req, res) => {
  const ordens = carregarOrdens();
  const indice = ordens.findIndex((o) => o.id === req.params.id);
  if (indice === -1) {
    return res.status(404).json({ sucesso: false, erros: ['Ordem de serviço não encontrada.'] });
  }

  const [removida] = ordens.splice(indice, 1);
  salvarOrdens(ordens);

  return res.json({
    sucesso: true,
    mensagem: 'Ordem de serviço removida com sucesso!',
    ordem: removida,
  });
});

module.exports = router;
