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

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'segredo-padrao-troque-isso',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

// Arquivos do Vue e do Vue Router, servidos a partir do node_modules
app.get('/vendor/vue.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'node_modules', 'vue', 'dist', 'vue.global.prod.js'));
});

app.get('/vendor/vue-router.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'node_modules', 'vue-router', 'dist', 'vue-router.global.prod.js'));
});

// Arquivos estaticos da aplicacao (index.html, css e js)
app.use(express.static(path.join(__dirname, 'public')));

function criarErro(status, mensagem) {
  const erro = new Error(mensagem);
  erro.status = status;
  return erro;
}

function podeAcessar(tarefa, usuario) {
  return tarefa.usuarioId === usuario.id || usuario.perfil === 'admin';
}

// ---------------------------------------------------------------------
// Sessao
// ---------------------------------------------------------------------

app.get('/api/sessao', function (req, res) {
  res.json({ usuario: req.session.usuario || null });
});

app.post('/api/login', async function (req, res, next) {
  try {
    const email = req.body.email;
    const senha = req.body.senha;

    if (!email || !senha) {
      return next(criarErro(400, 'E-mail e senha sao obrigatorios.'));
    }

    const usuario = await Usuario.findOne({ where: { email: email } });
    if (!usuario) {
      return next(criarErro(401, 'E-mail ou senha invalidos.'));
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaValida) {
      return next(criarErro(401, 'E-mail ou senha invalidos.'));
    }

    req.session.usuario = { id: usuario.id, email: usuario.email, perfil: usuario.perfil };
    res.json({ usuario: req.session.usuario });
  } catch (erro) {
    next(erro);
  }
});

app.post('/api/logout', function (req, res) {
  req.session.destroy(function () {
    res.json({ ok: true });
  });
});

// ---------------------------------------------------------------------
// Tarefas
// ---------------------------------------------------------------------

app.get('/api/tarefas', requireAuth, async function (req, res, next) {
  try {
    const usuario = req.session.usuario;
    const filtro = usuario.perfil === 'admin' ? {} : { usuarioId: usuario.id };
    const tarefas = await Tarefa.findAll({ where: filtro, order: [['id', 'DESC']] });
    res.json(tarefas);
  } catch (erro) {
    next(erro);
  }
});

app.get('/api/tarefas/:id', requireAuth, async function (req, res, next) {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return next(criarErro(404, 'Tarefa nao encontrada.'));
    }

    if (!podeAcessar(tarefa, req.session.usuario)) {
      return next(criarErro(403, 'Voce nao tem permissao para ver esta tarefa.'));
    }

    res.json(tarefa);
  } catch (erro) {
    next(erro);
  }
});

app.post('/api/tarefas', requireAuth, async function (req, res, next) {
  try {
    const titulo = req.body.titulo;
    const descricao = req.body.descricao;

    if (!titulo || titulo.trim() === '') {
      return next(criarErro(400, 'O titulo da tarefa e obrigatorio.'));
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

app.post('/api/tarefas/:id/status', requireAuth, async function (req, res, next) {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return next(criarErro(404, 'Tarefa nao encontrada.'));
    }

    if (!podeAcessar(tarefa, req.session.usuario)) {
      return next(criarErro(403, 'Voce nao tem permissao para alterar esta tarefa.'));
    }

    tarefa.status = tarefa.status === 'pendente' ? 'concluida' : 'pendente';
    await tarefa.save();

    res.json(tarefa);
  } catch (erro) {
    next(erro);
  }
});

app.delete('/api/tarefas/:id', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);

    if (!tarefa) {
      return next(criarErro(404, 'Tarefa nao encontrada.'));
    }

    await tarefa.destroy();
    res.json({ ok: true });
  } catch (erro) {
    next(erro);
  }
});

// ---------------------------------------------------------------------
// Area administrativa
// ---------------------------------------------------------------------

app.get('/api/admin/tarefas', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const tarefas = await Tarefa.findAll({ order: [['id', 'DESC']] });
    const usuarios = await Usuario.findAll();

    const emailPorId = {};
    usuarios.forEach(function (u) {
      emailPorId[u.id] = u.email;
    });

    const resposta = tarefas.map(function (t) {
      return {
        id: t.id,
        titulo: t.titulo,
        descricao: t.descricao,
        status: t.status,
        usuarioId: t.usuarioId,
        usuarioEmail: emailPorId[t.usuarioId] || ''
      };
    });

    res.json(resposta);
  } catch (erro) {
    next(erro);
  }
});

app.get('/api/admin/usuarios', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'email', 'perfil'],
      order: [['id', 'ASC']]
    });
    res.json(usuarios);
  } catch (erro) {
    next(erro);
  }
});

app.post('/api/admin/usuarios', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const email = req.body.email;
    const senha = req.body.senha;
    const perfil = req.body.perfil === 'admin' ? 'admin' : 'usuario';

    if (!email || email.trim() === '' || !senha || senha.length < 4) {
      return next(criarErro(400, 'Informe um e-mail e uma senha com pelo menos 4 caracteres.'));
    }

    const existente = await Usuario.findOne({ where: { email: email.trim() } });
    if (existente) {
      return next(criarErro(400, 'Ja existe um usuario com este e-mail.'));
    }

    const senhaHash = await bcrypt.hash(senha, 10);
    const novo = await Usuario.create({ email: email.trim(), senhaHash: senhaHash, perfil: perfil });

    res.status(201).json({ id: novo.id, email: novo.email, perfil: novo.perfil });
  } catch (erro) {
    next(erro);
  }
});

// ---------------------------------------------------------------------
// Fim da API e entrega da pagina unica
// ---------------------------------------------------------------------

// Qualquer rota /api que nao existe devolve 404 em JSON
app.use('/api', function (req, res, next) {
  next(criarErro(404, 'Rota da API nao encontrada.'));
});

// Qualquer outro GET devolve a pagina unica, e o Vue Router decide o que mostrar
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(function (erro, req, res, next) {
  const status = erro.status || 500;

  if (status === 500) {
    console.error('Erro interno:', erro);
    return res.status(500).json({ erro: 'Erro interno do servidor.' });
  }

  console.warn('Erro ' + status + ': ' + erro.message);
  res.status(status).json({ erro: erro.message });
});

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log('Conexao com o MariaDB estabelecida com sucesso.');

    await sequelize.sync();
    console.log('Modelos sincronizados com o banco de dados.');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, function () {
      console.log('Servidor rodando em http://localhost:' + PORT);
    });
  } catch (erro) {
    console.error('Nao foi possivel conectar ao banco de dados:', erro);
  }
}

iniciarServidor();
