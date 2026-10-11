const jwt = require('jsonwebtoken');

// O segredo vem do .env (JWT_SECRET). O valor padrao serve so para desenvolvimento.
const SEGREDO = process.env.JWT_SECRET || 'segredo-de-desenvolvimento-troque-isso';

if (!process.env.JWT_SECRET) {
  console.warn('Aviso: JWT_SECRET nao definido no .env, usando o segredo padrao de desenvolvimento.');
}

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, email: usuario.email, perfil: usuario.perfil },
    SEGREDO,
    { algorithm: 'HS256', expiresIn: '1h' }
  );
}

// Le o cabecalho "Authorization: Bearer <token>" e coloca o usuario em req.usuario
function requireAuth(req, res, next) {
  const cabecalho = req.headers.authorization || '';
  const partes = cabecalho.split(' ');

  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Voce precisa fazer login.' });
  }

  try {
    const dados = jwt.verify(partes[1], SEGREDO, { algorithms: ['HS256'] });
    req.usuario = { id: dados.id, email: dados.email, perfil: dados.perfil };
    return next();
  } catch (erro) {
    return res.status(401).json({ erro: 'Sessao invalida ou expirada. Faca login novamente.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.usuario && req.usuario.perfil === 'admin') {
    return next();
  }
  return res.status(403).json({ erro: 'Voce nao tem permissao para realizar esta acao.' });
}

module.exports = { gerarToken, requireAuth, requireAdmin };
