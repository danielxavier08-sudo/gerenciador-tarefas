const path = require('path');
const express = require('express');
const { Tarefa, Usuario } = require('../models');
const autor = require('../config/autor');
const { ErroHttp, rota } = require('../utils/erros');
const { paginar } = require('../utils/paginacao');
const { serializarPublica, filtroBusca } = require('../utils/tarefas');

const POR_PAGINA = 9;
const INCLUIR_DONO = [{ model: Usuario, as: 'dono', attributes: ['id', 'nome'] }];

const router = express.Router();

router.get('/', rota(async function (req, res) {
  const [publicas, concluidas, usuarios, recentes] = await Promise.all([
    Tarefa.count({ where: { publica: true } }),
    Tarefa.count({ where: { publica: true, status: 'concluida' } }),
    Usuario.count(),
    Tarefa.findAll({ where: { publica: true }, include: INCLUIR_DONO, order: [['id', 'DESC']], limit: 6 })
  ]);

  res.render('inicio', {
    titulo: 'Início',
    totais: { publicas, concluidas, usuarios },
    tarefas: recentes.map(serializarPublica)
  });
}));

router.get('/tarefas', rota(async function (req, res) {
  const busca = typeof req.query.busca === 'string' ? req.query.busca.trim() : '';
  const where = { publica: true, ...filtroBusca(busca) };

  const resultado = await paginar(
    Tarefa,
    { where, include: INCLUIR_DONO, order: [['id', 'DESC']] },
    req.query,
    POR_PAGINA
  );
  const dados = { ...resultado, itens: resultado.itens.map(serializarPublica) };

  res.format({
    html: function () {
      res.render('mural', { titulo: 'Mural de tarefas', busca, ...dados });
    },
    json: function () {
      res.json(dados);
    },
    default: function () {
      res.render('mural', { titulo: 'Mural de tarefas', busca, ...dados });
    }
  });
}));

router.get('/tarefas/:id', rota(async function (req, res) {
  const tarefa = await Tarefa.findOne({
    where: { id: req.params.id, publica: true },
    include: INCLUIR_DONO
  });

  if (!tarefa) {
    throw new ErroHttp(404, 'Tarefa não encontrada ou não é pública.');
  }

  const dados = serializarPublica(tarefa);

  res.format({
    html: function () {
      res.render('tarefa', { titulo: dados.titulo, tarefa: dados });
    },
    json: function () {
      res.json(dados);
    },
    default: function () {
      res.render('tarefa', { titulo: dados.titulo, tarefa: dados });
    }
  });
}));

router.get('/autor', function (req, res) {
  res.format({
    html: function () {
      res.render('autor', { titulo: 'Autor', autor });
    },
    json: function () {
      res.json(autor);
    },
    default: function () {
      res.render('autor', { titulo: 'Autor', autor });
    }
  });
});

router.get('/login', function (req, res) {
  res.redirect('/app/entrar');
});

router.get(['/app', '/app/*'], function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public', 'app', 'index.html'));
});

module.exports = router;
