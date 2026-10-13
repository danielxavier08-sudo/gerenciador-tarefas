const { ErroHttp } = require('../utils/erros');

function querJson(req) {
  return req.originalUrl.startsWith('/api') || req.accepts(['html', 'json']) === 'json';
}

function naoEncontrado(req, res, next) {
  next(new ErroHttp(404, 'A página que você procura não existe.'));
}

function tratarErros(erro, req, res, next) {
  let status = erro.status || 500;
  let mensagem = erro.message;

  if (erro.type === 'entity.parse.failed') {
    status = 400;
    mensagem = 'O corpo da requisição não é um JSON válido.';
  }

  if (status >= 500) {
    console.error('Erro interno:', erro);
    status = 500;
    mensagem = 'Erro interno do servidor.';
  }

  if (res.headersSent) {
    return next(erro);
  }

  if (querJson(req)) {
    return res.status(status).json({ erro: mensagem });
  }

  return res.status(status).render('erro', { titulo: 'Ops', status, mensagem });
}

module.exports = { naoEncontrado, tratarErros };
