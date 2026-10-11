require('dotenv').config();
const path = require('path');
const express = require('express');
const bcrypt = require('bcrypt');

const { Op } = require('sequelize');
const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');
const Tarefa = require('./models/Tarefa');
const { gerarToken, requireAuth, requireAdmin } = require('./middlewares/auth');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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

const STATUS_VALIDOS = ['pendente', 'concluida'];
const POR_PAGINA = 5;

// ---------------------------------------------------------------------
// Autenticacao (JWT)
// ---------------------------------------------------------------------

// Devolve o usuario dono do token. O front usa isto ao recarregar a pagina.
app.get('/api/sessao', requireAuth, function (req, res) {
  res.json({ usuario: req.usuario });
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

    const dadosUsuario = { id: usuario.id, email: usuario.email, perfil: usuario.perfil };
    res.json({ token: gerarToken(dadosUsuario), usuario: dadosUsuario });
  } catch (erro) {
    next(erro);
  }
});

// ---------------------------------------------------------------------
// Tarefas
// ---------------------------------------------------------------------

// Lista paginada: /api/tarefas?pagina=2&status=pendente
app.get('/api/tarefas', requireAuth, async function (req, res, next) {
  try {
    const usuario = req.usuario;
    const filtro = usuario.perfil === 'admin' ? {} : { usuarioId: usuario.id };

    if (STATUS_VALIDOS.includes(req.query.status)) {
      filtro.status = req.query.status;
    }

    const total = await Tarefa.count({ where: filtro });
    const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

    let pagina = parseInt(req.query.pagina, 10);
    if (!pagina || pagina < 1) { pagina = 1; }
    if (pagina > totalPaginas) { pagina = totalPaginas; }

    const itens = await Tarefa.findAll({
      where: filtro,
      order: [['id', 'DESC']],
      limit: POR_PAGINA,
      offset: (pagina - 1) * POR_PAGINA
    });

    res.json({ itens: itens, pagina: pagina, totalPaginas: totalPaginas, total: total });
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

    if (!podeAcessar(tarefa, req.usuario)) {
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
      usuarioId: req.usuario.id
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

    if (!podeAcessar(tarefa, req.usuario)) {
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

// Monta o JSON de uma tarefa com o e-mail do dono
function tarefaComEmail(tarefa, email) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    descricao: tarefa.descricao,
    status: tarefa.status,
    usuarioId: tarefa.usuarioId,
    usuarioEmail: email || ''
  };
}

// Valida e normaliza o corpo de uma tarefa (usado no POST e no PUT)
async function lerDadosTarefa(corpo) {
  const titulo = typeof corpo.titulo === 'string' ? corpo.titulo.trim() : '';
  if (titulo === '') {
    throw criarErro(400, 'O titulo da tarefa e obrigatorio.');
  }
  if (titulo.length > 120) {
    throw criarErro(400, 'O titulo pode ter no maximo 120 caracteres.');
  }

  const status = corpo.status || 'pendente';
  if (!STATUS_VALIDOS.includes(status)) {
    throw criarErro(400, 'Status invalido.');
  }

  const dono = await Usuario.findByPk(Number(corpo.usuarioId));
  if (!dono) {
    throw criarErro(400, 'Escolha um dono valido para a tarefa.');
  }

  return {
    dados: { titulo: titulo, descricao: corpo.descricao || '', status: status, usuarioId: dono.id },
    email: dono.email
  };
}

app.get('/api/admin/tarefas/:id', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);
    if (!tarefa) {
      return next(criarErro(404, 'Tarefa nao encontrada.'));
    }
    const dono = await Usuario.findByPk(tarefa.usuarioId);
    res.json(tarefaComEmail(tarefa, dono ? dono.email : ''));
  } catch (erro) {
    next(erro);
  }
});

app.post('/api/admin/tarefas', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const lido = await lerDadosTarefa(req.body);
    const tarefa = await Tarefa.create(lido.dados);
    res.status(201).json(tarefaComEmail(tarefa, lido.email));
  } catch (erro) {
    next(erro);
  }
});

app.put('/api/admin/tarefas/:id', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const tarefa = await Tarefa.findByPk(req.params.id);
    if (!tarefa) {
      return next(criarErro(404, 'Tarefa nao encontrada.'));
    }
    const lido = await lerDadosTarefa(req.body);
    await tarefa.update(lido.dados);
    res.json(tarefaComEmail(tarefa, lido.email));
  } catch (erro) {
    next(erro);
  }
});

app.delete('/api/admin/tarefas/:id', requireAuth, requireAdmin, async function (req, res, next) {
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

app.get('/api/admin/usuarios/:id', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id, { attributes: ['id', 'email', 'perfil'] });
    if (!usuario) {
      return next(criarErro(404, 'Usuario nao encontrado.'));
    }
    res.json(usuario);
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

// A senha e opcional na edicao: se vier vazia, a senha atual e mantida
app.put('/api/admin/usuarios/:id', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return next(criarErro(404, 'Usuario nao encontrado.'));
    }

    const email = typeof req.body.email === 'string' ? req.body.email.trim() : '';
    const senha = req.body.senha;
    const perfil = req.body.perfil === 'admin' ? 'admin' : 'usuario';

    if (email === '') {
      return next(criarErro(400, 'Informe o e-mail.'));
    }
    if (senha && senha.length < 4) {
      return next(criarErro(400, 'A senha deve ter pelo menos 4 caracteres.'));
    }
    if (usuario.id === req.usuario.id && perfil !== 'admin') {
      return next(criarErro(400, 'Voce nao pode remover o seu proprio perfil de admin.'));
    }

    const repetido = await Usuario.findOne({ where: { email: email, id: { [Op.ne]: usuario.id } } });
    if (repetido) {
      return next(criarErro(400, 'Ja existe um usuario com este e-mail.'));
    }

    usuario.email = email;
    usuario.perfil = perfil;
    if (senha) {
      usuario.senhaHash = await bcrypt.hash(senha, 10);
    }
    await usuario.save();

    res.json({ id: usuario.id, email: usuario.email, perfil: usuario.perfil });
  } catch (erro) {
    next(erro);
  }
});

app.delete('/api/admin/usuarios/:id', requireAuth, requireAdmin, async function (req, res, next) {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return next(criarErro(404, 'Usuario nao encontrado.'));
    }
    if (usuario.id === req.usuario.id) {
      return next(criarErro(400, 'Voce nao pode apagar o proprio usuario.'));
    }

    // Como usuarioId nao tem chave estrangeira, evitamos deixar tarefas orfas
    const quantas = await Tarefa.count({ where: { usuarioId: usuario.id } });
    if (quantas > 0) {
      return next(criarErro(400, 'Este usuario tem ' + quantas + ' tarefa(s). Apague as tarefas antes de apagar o usuario.'));
    }

    await usuario.destroy();
    res.json({ ok: true });
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
