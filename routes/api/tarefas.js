const express = require('express');
const { Op, fn, col, literal } = require('sequelize');
const { Tarefa, Usuario } = require('../../models');
const { requireAuth } = require('../../middlewares/auth');
const { ErroHttp, rota } = require('../../utils/erros');
const { STATUS, PRIORIDADES } = require('../../utils/constantes');
const { lerTarefa, lerStatus } = require('../../utils/validacao');
const { paginar } = require('../../utils/paginacao');
const { hojeISO, serializarTarefa, filtroBusca } = require('../../utils/tarefas');

const POR_PAGINA = 6;

const ORDENACOES = {
  recentes: [['id', 'DESC']],
  antigas: [['id', 'ASC']],
  prazo: [[literal('prazo IS NULL'), 'ASC'], ['prazo', 'ASC'], ['id', 'DESC']],
  prioridade: [[literal("FIELD(prioridade, 'alta', 'media', 'baixa')"), 'ASC'], ['id', 'DESC']]
};

const router = express.Router();
router.use(requireAuth);

async function carregarTarefa(id, usuario) {
  const tarefa = await Tarefa.findByPk(id, {
    include: [{ model: Usuario, as: 'dono', attributes: ['id', 'nome', 'email'] }]
  });

  if (!tarefa) {
    throw new ErroHttp(404, 'Tarefa não encontrada.');
  }
  if (tarefa.usuarioId !== usuario.id && usuario.perfil !== 'admin') {
    throw new ErroHttp(403, 'Você não tem permissão para acessar esta tarefa.');
  }
  return tarefa;
}

router.get('/', rota(async function (req, res) {
  const where = { usuarioId: req.usuario.id, ...filtroBusca(req.query.busca) };

  if (STATUS.includes(req.query.status)) {
    where.status = req.query.status;
  }
  if (PRIORIDADES.includes(req.query.prioridade)) {
    where.prioridade = req.query.prioridade;
  }

  const order = ORDENACOES[req.query.ordem] || ORDENACOES.recentes;
  const resultado = await paginar(Tarefa, { where, order }, req.query, POR_PAGINA);

  res.json({ ...resultado, itens: resultado.itens.map((tarefa) => serializarTarefa(tarefa)) });
}));

router.get('/resumo', rota(async function (req, res) {
  const usuarioId = req.usuario.id;
  const abertas = { usuarioId, status: { [Op.ne]: 'concluida' } };

  const porStatus = await Tarefa.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'quantidade']],
    where: { usuarioId },
    group: ['status'],
    raw: true
  });

  const contagem = { pendente: 0, andamento: 0, concluida: 0 };
  porStatus.forEach((linha) => {
    contagem[linha.status] = Number(linha.quantidade);
  });

  const atrasadas = await Tarefa.count({ where: { ...abertas, prazo: { [Op.lt]: hojeISO() } } });
  const proximas = await Tarefa.findAll({
    where: { ...abertas, prazo: { [Op.ne]: null } },
    order: [['prazo', 'ASC'], ['id', 'ASC']],
    limit: 5
  });

  res.json({
    total: contagem.pendente + contagem.andamento + contagem.concluida,
    pendentes: contagem.pendente,
    andamento: contagem.andamento,
    concluidas: contagem.concluida,
    atrasadas,
    proximas: proximas.map((tarefa) => serializarTarefa(tarefa))
  });
}));

router.get('/:id', rota(async function (req, res) {
  const tarefa = await carregarTarefa(req.params.id, req.usuario);
  res.json(serializarTarefa(tarefa));
}));

router.post('/', rota(async function (req, res) {
  const dados = lerTarefa(req.body);
  const tarefa = await Tarefa.create({ ...dados, usuarioId: req.usuario.id });
  res.status(201).json(serializarTarefa(tarefa));
}));

router.put('/:id', rota(async function (req, res) {
  const tarefa = await carregarTarefa(req.params.id, req.usuario);
  tarefa.set(lerTarefa(req.body));
  await tarefa.save();
  res.json(serializarTarefa(tarefa));
}));

router.patch('/:id/status', rota(async function (req, res) {
  const tarefa = await carregarTarefa(req.params.id, req.usuario);
  tarefa.status = lerStatus(req.body.status);
  await tarefa.save();
  res.json(serializarTarefa(tarefa));
}));

router.delete('/:id', rota(async function (req, res) {
  const tarefa = await carregarTarefa(req.params.id, req.usuario);
  await tarefa.destroy();
  res.status(204).end();
}));

module.exports = router;
