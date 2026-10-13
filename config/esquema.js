const { DataTypes, literal } = require('sequelize');
const sequelize = require('./database');

const COLUNAS_NOVAS = {
  tarefas: {
    prioridade: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'media' },
    prazo: { type: DataTypes.DATEONLY, allowNull: true },
    publica: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    criadoEm: { type: DataTypes.DATE, allowNull: true, defaultValue: literal('CURRENT_TIMESTAMP') }
  },
  usuarios: {
    nome: { type: DataTypes.STRING(80), allowNull: true }
  }
};

async function adicionarColunasFaltantes(tabela, colunas) {
  const consulta = sequelize.getQueryInterface();
  const existentes = await consulta.describeTable(tabela);

  for (const [nome, definicao] of Object.entries(colunas)) {
    if (!existentes[nome]) {
      await consulta.addColumn(tabela, nome, definicao);
    }
  }
}

async function prepararBanco() {
  await sequelize.authenticate();
  await sequelize.sync();

  for (const [tabela, colunas] of Object.entries(COLUNAS_NOVAS)) {
    await adicionarColunasFaltantes(tabela, colunas);
  }
}

module.exports = { prepararBanco };
