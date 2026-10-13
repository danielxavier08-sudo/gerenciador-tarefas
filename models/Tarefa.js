const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Tarefa = sequelize.define('Tarefa', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  titulo: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  descricao: {
    type: DataTypes.TEXT,
    defaultValue: ''
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'pendente'
  },
  prioridade: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'media'
  },
  prazo: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  publica: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  criadoEm: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  usuarioId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'tarefas',
  timestamps: false
});

module.exports = Tarefa;
