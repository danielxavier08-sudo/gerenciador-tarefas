require('dotenv').config();
const app = require('./app');
const { prepararBanco } = require('./config/esquema');

const PORTA = process.env.PORT || 3000;

async function iniciar() {
  await prepararBanco();
  app.listen(PORTA, function () {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
  });
}

iniciar().catch(function (erro) {
  console.error('Não foi possível iniciar o servidor:', erro);
  process.exit(1);
});
