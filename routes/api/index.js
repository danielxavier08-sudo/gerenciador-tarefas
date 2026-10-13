const express = require('express');
const { ErroHttp } = require('../../utils/erros');

const router = express.Router();

router.use('/', require('./auth'));
router.use('/tarefas', require('./tarefas'));
router.use('/admin', require('./admin'));

router.use(function (req, res, next) {
  next(new ErroHttp(404, 'Rota da API não encontrada.'));
});

module.exports = router;
