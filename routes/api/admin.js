const express = require('express');
const bcrypt = require('bcrypt');
const { Op, fn, col } = require('sequelize');
const { Tarefa, Usuario } = require('../../models');
const { requireAuth, requireAdmin } = require('../../middlewares/auth');
const { ErroHttp, rota } = require('../../utils/erros');
const { STATUS } = require('../../utils/constantes');
const { lerTarefa, lerNome, lerEmail, lerSenha, lerPerfil, escaparLike } = require('../../utils/validacao');
const { paginar } = require('../../utils/paginacao');
const { serializarTarefa, filtroBusca } = require('../../utils/tarefas');

const POR_PAGINA = 8;
const INCLUIR_DONO = [{ model: Usuario, as: 'dono', attributes: ['id', 'nome', 'email'] }];

const router = express.Router();
router.use(requireAuth, requireAdmin);

function serializarUsuario(usuario, quantidadeTarefas) {
  return {
    id: usuario.id,
    nome: usuario.nome || null,
    email: usuario.email,
    perfil: usuario.perfil,
    tarefas: quantidadeTarefas
  };
}

async function contarTarefasPorUsuario(ids) {
  const linhas = await Tarefa.findAll({
    attributes: ['usuarioId', [fn('COUNT', col('id')), 'quantidade']],
    where: { usuarioId: ids },
    group: ['usuarioId'],
    raw: true
  });

  const mapa = {};
  linhas.forEach((linha) => {
    mapa[linha.usuarioId] = Number(linha.quantidade);
  });
  return mapa;
}

async function buscarResponsavel(valor) {
  const responsavel = await Usuario.findByPk(Number(valor));
  if (!responsavel) {
    throw new ErroHttp(400, 'Escolha um responsável válido para a tarefa.');
  }
  return responsavel;
}

async function buscarTarefa(id) {
  const tarefa = await Tarefa.findByPk(id, { include: INCLUIR_DONO });
  if (!tarefa) {
    throw new ErroHttp(404, 'Tarefa não encontrada.');
  }
  return tarefa;
}

async function buscarUsuario(id) {
  const usuario = await Usuario.findByPk(id);
  if (!usuario) {
    throw new ErroHttp(404, 'Usuário não encontrado.');
  }
  return usuario;
}

router.get('/resumo', rota(async function (req, res) {
  const porStatus = await Tarefa.findAll({
    attributes: ['status', [fn('COUNT', col('id')), 'quantidade']],
    group: ['status'],
    raw: true
  });

  const tarefasPorStatus = {};
  STATUS.forEach((status) => {
    tarefasPorStatus[status] = 0;
  });
  porStatus.forEach((linha) => {
    tarefasPorStatus[linha.status] = Number(linha.quantidade);
  });

  const [usuarios, administradores, publicas] = await Promise.all([
    Usuario.count(),
    Usuario.count({ where: { perfil: 'admin' } }),
    Tarefa.count({ where: { publica: true } })
  ]);

  res.json({
    usuarios,
    administradores,
    tarefas: Object.values(tarefasPorStatus).reduce((soma, valor) => soma + valor, 0),
    publicas,
    tarefasPorStatus
  });
}));

router.get('/tarefas', rota(async function (req, res) {
  const where = filtroBusca(req.query.busca);

  if (STATUS.includes(req.query.status)) {
    where.status = req.query.status;
  }

  const resultado = await paginar(
    Tarefa,
    { where, include: INCLUIR_DONO, order: [['id', 'DESC']] },
    req.query,
    POR_PAGINA
  );

  res.json({ ...resultado, itens: resultado.itens.map((tarefa) => serializarTarefa(tarefa)) });
}));

router.get('/tarefas/:id', rota(async function (req, res) {
  res.json(serializarTarefa(await buscarTarefa(req.params.id)));
}));

router.post('/tarefas', rota(async function (req, res) {
  const dados = lerTarefa(req.body);
  const responsavel = await buscarResponsavel(req.body.usuarioId);
  const tarefa = await Tarefa.create({ ...dados, usuarioId: responsavel.id });
  res.status(201).json(serializarTarefa(tarefa, responsavel));
}));

router.put('/tarefas/:id', rota(async function (req, res) {
  const tarefa = await buscarTarefa(req.params.id);
  const dados = lerTarefa(req.body);
  const responsavel = await buscarResponsavel(req.body.usuarioId);

  tarefa.set({ ...dados, usuarioId: responsavel.id });
  await tarefa.save();
  res.json(serializarTarefa(tarefa, responsavel));
}));

router.delete('/tarefas/:id', rota(async function (req, res) {
  const tarefa = await buscarTarefa(req.params.id);
  await tarefa.destroy();
  res.status(204).end();
}));

router.get('/usuarios/opcoes', rota(async function (req, res) {
  const usuarios = await Usuario.findAll({
    attributes: ['id', 'nome', 'email'],
    order: [['nome', 'ASC'], ['email', 'ASC']]
  });
  res.json(usuarios);
}));

router.get('/usuarios', rota(async function (req, res) {
  const termo = typeof req.query.busca === 'string' ? req.query.busca.trim() : '';
  const where = termo === '' ? {} : {
    [Op.or]: [
      { nome: { [Op.like]: `%${escaparLike(termo)}%` } },
      { email: { [Op.like]: `%${escaparLike(termo)}%` } }
    ]
  };

  const resultado = await paginar(Usuario, { where, order: [['id', 'ASC']] }, req.query, POR_PAGINA);
  const quantidades = await contarTarefasPorUsuario(resultado.itens.map((usuario) => usuario.id));

  res.json({
    ...resultado,
    itens: resultado.itens.map((usuario) => serializarUsuario(usuario, quantidades[usuario.id] || 0))
  });
}));

router.get('/usuarios/:id', rota(async function (req, res) {
  const usuario = await buscarUsuario(req.params.id);
  const quantidades = await contarTarefasPorUsuario([usuario.id]);
  res.json(serializarUsuario(usuario, quantidades[usuario.id] || 0));
}));

router.post('/usuarios', rota(async function (req, res) {
  const nome = lerNome(req.body.nome, false);
  const email = lerEmail(req.body.email);
  const senha = lerSenha(req.body.senha);
  const perfil = lerPerfil(req.body.perfil);

  if (await Usuario.findOne({ where: { email } })) {
    throw new ErroHttp(409, 'Já existe um usuário com este e-mail.');
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await Usuario.create({ nome, email, senhaHash, perfil });
  res.status(201).json(serializarUsuario(usuario, 0));
}));

router.put('/usuarios/:id', rota(async function (req, res) {
  const usuario = await buscarUsuario(req.params.id);
  const nome = lerNome(req.body.nome, false);
  const email = lerEmail(req.body.email);
  const perfil = lerPerfil(req.body.perfil);

  if (usuario.id === req.usuario.id && perfil !== 'admin') {
    throw new ErroHttp(400, 'Você não pode remover o seu próprio perfil de administrador.');
  }

  const repetido = await Usuario.findOne({ where: { email, id: { [Op.ne]: usuario.id } } });
  if (repetido) {
    throw new ErroHttp(409, 'Já existe um usuário com este e-mail.');
  }

  usuario.nome = nome;
  usuario.email = email;
  usuario.perfil = perfil;

  if (req.body.senha) {
    usuario.senhaHash = await bcrypt.hash(lerSenha(req.body.senha), 10);
  }

  await usuario.save();
  const quantidades = await contarTarefasPorUsuario([usuario.id]);
  res.json(serializarUsuario(usuario, quantidades[usuario.id] || 0));
}));

router.delete('/usuarios/:id', rota(async function (req, res) {
  const usuario = await buscarUsuario(req.params.id);

  if (usuario.id === req.usuario.id) {
    throw new ErroHttp(400, 'Você não pode apagar o seu próprio usuário.');
  }

  const quantidade = await Tarefa.count({ where: { usuarioId: usuario.id } });
  if (quantidade > 0) {
    throw new ErroHttp(400, `Este usuário possui ${quantidade} tarefa(s). Apague ou reatribua as tarefas antes de removê-lo.`);
  }

  await usuario.destroy();
  res.status(204).end();
}));

module.exports = router;
