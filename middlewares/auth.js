function requireAuth(req, res, next) {
  if (req.session && req.session.usuario) {
    return next();
  }
  return res.redirect('/login');
}

function requireAdmin(req, res, next) {
  if (req.session && req.session.usuario && req.session.usuario.perfil === 'admin') {
    return next();
  }
  const erro = new Error('Voce nao tem permissao para realizar esta acao.');
  erro.status = 403;
  return next(erro);
}

module.exports = { requireAuth, requireAdmin };
