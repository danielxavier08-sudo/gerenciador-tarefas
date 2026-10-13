class ErroHttp extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

function rota(manipulador) {
  return function (req, res, next) {
    Promise.resolve(manipulador(req, res, next)).catch(next);
  };
}

module.exports = { ErroHttp, rota };
