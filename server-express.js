require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');

const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');
const Tarefa = require('./models/Tarefa');
const { requireAuth, requireAdmin } = require('./middlewares/auth');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo-padrao-troque-isso',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

app.use((req, res, next) => {
  res.locals.usuarioLogado = req.session.usuario || null;
  next();
});

app.get('/login', (req, res) => {
  if (req.session.usuario) return res.redirect('/');
  res.render('login', { erro: null });
});

app.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      const erro = new Error('E-mail e senha sao obrigatorios.');
      erro.status = 400;
      return next(erro);
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.render('login', { erro: 'E-mail ou senha invalidos.' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      return res.render('login', { erro: 'E-mail ou senha invalidos.' });
    }

    req.session.usuario = { id: usuario.id, email: usuario.email, perfil: usuario.perfil };
    res.redirect('/');
  } catch (erro) {
    next(erro);
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

app.get('/', requireAuth, async (req, res, next) => {
  try {
    const filtro = req.session.usuario.perfil === 'admin'
      ? {}
      : { usuarioId: req.session.usuario.id };

    const tarefas = await Tarefa.findAll({ where: filtro, order: [['id', 'DESC']] });
    res.render('index', { tarefas, tituloPagina: 'Minhas Tarefas' });
  } catch (erro) {
    next(erro);
  }
});

app.post('/tarefas', requireAuth, async (req, res, next) => {
  try {
    const { titulo, descricao } = req.body;

    if (!titulo || titulo.trim() === '') {
      const erro = new Error('O titulo da tarefa e obrigatorio.');
      erro.status = 400;
      return next(erro);
    }

    await Tarefa.create({
      titulo: titulo.trim(),
      descricao: descricao || '',
      status: 'pendente',
      usuarioId: req.session.usuario.id
    });

    res.redirect('/');
  } catch (erro) {
    next(erro);
  }
});

app.post('/tarefas/:id/status', requireAuth, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      const erro = new Error('Tarefa nao encontrada.');
      erro.status = 404;
      return next(erro);
    }

    const ehDono = tarefa.usuarioId === req.session.usuario.id;
    const ehAdmin = req.session.usuario.perfil === 'admin';
    if (!ehDono && !ehAdmin) {
      const erro = new Error('Voce nao tem permissao para alterar esta tarefa.');
      erro.status = 403;
      return next(erro);
    }

    tarefa.status = tarefa.status === 'pendente' ? 'concluida' : 'pendente';
    await tarefa.save();

    res.redirect('/');
  } catch (erro) {
    next(erro);
  }
});

app.post('/tarefas/:id/excluir', requireAuth, requireAdmin, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      const erro = new Error('Tarefa nao encontrada.');
      erro.status = 404;
      return next(erro);
    }

    await tarefa.destroy();
    res.redirect('/');
  } catch (erro) {
    next(erro);
  }
});

// ---------------------------------------------------------------------
// Tarefa 4.1 (Unidade 4) - Interface Vue.js
// ---------------------------------------------------------------------

// Rota protegida que serve a página Vue (exige login, igual as demais rotas)
app.get('/vue', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'vue-tarefas.html'));
});

// API JSON usada pela interface Vue via fetch()
app.get('/api/tarefas', requireAuth, async (req, res, next) => {
  try {
    const filtro = req.session.usuario.perfil === 'admin'
      ? {}
      : { usuarioId: req.session.usuario.id };

    const tarefas = await Tarefa.findAll({ where: filtro, order: [['id', 'DESC']] });
    res.json(tarefas);
  } catch (erro) {
    next(erro);
  }
});

app.post('/api/tarefas', requireAuth, async (req, res, next) => {
  try {
    const { titulo, descricao } = req.body;

    if (!titulo || titulo.trim() === '') {
      return res.status(400).json({ erro: 'O titulo da tarefa e obrigatorio.' });
    }

    const tarefa = await Tarefa.create({
      titulo: titulo.trim(),
      descricao: descricao || '',
      status: 'pendente',
      usuarioId: req.session.usuario.id
    });

    res.status(201).json(tarefa);
  } catch (erro) {
    next(erro);
  }
});

app.post('/api/tarefas/:id/status', requireAuth, async (req, res, next) => {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa nao encontrada.' });
    }

    const ehDono = tarefa.usuarioId === req.session.usuario.id;
    const ehAdmin = req.session.usuario.perfil === 'admin';
    if (!ehDono && !ehAdmin) {
      return res.status(403).json({ erro: 'Voce nao tem permissao para alterar esta tarefa.' });
    }

    tarefa.status = tarefa.status === 'pendente' ? 'concluida' : 'pendente';
    await tarefa.save();

    res.json(tarefa);
  } catch (erro) {
    next(erro);
  }
});

app.use((req, res) => {
  res.status(404).render('errors/404');
});

app.use((erro, req, res, next) => {
  const status = erro.status || 500;

  if (status !== 500) {
    console.warn(`Erro ${status}: ${erro.message}`);
  } else {
    console.error('Erro interno:', erro);
  }

  switch (status) {
    case 400:
      return res.status(400).render('errors/400', { mensagem: erro.message });
    case 403:
      return res.status(403).render('errors/403', { mensagem: erro.message });
    case 404:
      return res.status(404).render('errors/404');
    default:
      return res.status(500).render('errors/500');
  }
});

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log('Conexao com o MariaDB estabelecida com sucesso.');

    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados.');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
  } catch (erro) {
    console.error('Nao foi possivel conectar ao banco de dados:', erro);
  }
}

iniciarServidor();
