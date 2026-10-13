const express = require('express');
const bcrypt = require('bcrypt');
const { Usuario } = require('../../models');
const { gerarToken, requireAuth } = require('../../middlewares/auth');
const { ErroHttp, rota } = require('../../utils/erros');
const { texto, lerNome, lerEmail, lerSenha } = require('../../utils/validacao');

const router = express.Router();

function respostaDeSessao(usuario) {
  return {
    token: gerarToken(usuario),
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, perfil: usuario.perfil }
  };
}

router.post('/login', rota(async function (req, res) {
  const email = texto(req.body.email).toLowerCase();
  const senha = typeof req.body.senha === 'string' ? req.body.senha : '';

  if (email === '' || senha === '') {
    throw new ErroHttp(400, 'Informe o e-mail e a senha.');
  }

  const usuario = await Usuario.findOne({ where: { email } });
  const senhaCorreta = usuario ? await bcrypt.compare(senha, usuario.senhaHash) : false;

  if (!senhaCorreta) {
    throw new ErroHttp(401, 'E-mail ou senha inválidos.');
  }

  res.json(respostaDeSessao(usuario));
}));

router.post('/registro', rota(async function (req, res) {
  const nome = lerNome(req.body.nome, true);
  const email = lerEmail(req.body.email);
  const senha = lerSenha(req.body.senha);

  const existente = await Usuario.findOne({ where: { email } });
  if (existente) {
    throw new ErroHttp(409, 'Já existe uma conta com este e-mail.');
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await Usuario.create({ nome, email, senhaHash, perfil: 'usuario' });

  res.status(201).json(respostaDeSessao(usuario));
}));

router.get('/sessao', requireAuth, function (req, res) {
  res.json({ usuario: req.usuario });
});

module.exports = router;
