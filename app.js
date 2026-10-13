const path = require('path');
const express = require('express');
const rotasApi = require('./routes/api');
const rotasWeb = require('./routes/web');
const { naoEncontrado, tratarErros } = require('./middlewares/erros');
const formatadores = require('./utils/formatadores');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.disable('x-powered-by');
Object.assign(app.locals, formatadores);

app.use(express.json());

app.get('/vendor/vue.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'node_modules', 'vue', 'dist', 'vue.global.prod.js'));
});

app.get('/vendor/vue-router.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'node_modules', 'vue-router', 'dist', 'vue-router.global.prod.js'));
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/api', rotasApi);
app.use(rotasWeb);
app.use(naoEncontrado);
app.use(tratarErros);

module.exports = app;
