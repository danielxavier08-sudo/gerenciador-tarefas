const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { ErroHttp } = require('../utils/erros');

const SEGREDO = process.env.JWT_SECRET || 'segredo-de-desenvolvimento-troque-isso';

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Defina JWT_SECRET no ambiente de producao.');
  }
  console.warn('Aviso: JWT_SECRET não definido, usando segredo de desenvolvimento.');
}

function gerarToken(usuario) {
  return jwt.sign({ id: usuario.id }, SEGREDO, { algorithm: 'HS256', expiresIn: '2h' });
}

async function requireAuth(req, res, next) {
  const [tipo, token] = (req.headers.authorization || '').split(' ');

  if (tipo !== 'Bearer' || !token) {
    return next(new ErroHttp(401, 'Você precisa fazer login.'));
  }

  let usuario;
  try {
    const dados = jwt.verify(token, SEGREDO, { algorithms: ['HS256'] });
    usuario = await Usuario.findByPk(dados.id, { attributes: ['id', 'nome', 'email', 'perfil'] });
  } catch (erro) {
    usuario = null;
  }

  if (!usuario) {
    return next(new ErroHttp(401, 'Sessão inválida ou expirada. Faça login novamente.'));
  }

  req.usuario = usuario.get({ plain: true });
  return next();
}

function requireAdmin(req, res, next) {
  if (req.usuario && req.usuario.perfil === 'admin') {
    return next();
  }
  return next(new ErroHttp(403, 'Você não tem permissão para realizar esta ação.'));
}

module.exports = { gerarToken, requireAuth, requireAdmin };
