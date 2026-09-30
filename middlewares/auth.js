function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.status(401).json({ erro: 'Voce precisa fazer login.' });
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.perfil === 'admin') {
    return next();
  }
  return res.status(403).json({ erro: 'Voce nao tem permissao para realizar esta acao.' });
}

module.exports = { requireAuth, requireAdmin };
