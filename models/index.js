const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Tarefa = require('./Tarefa');

Usuario.hasMany(Tarefa, { foreignKey: 'usuarioId', as: 'tarefas', constraints: false });
Tarefa.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'dono', constraints: false });

module.exports = { sequelize, Usuario, Tarefa };
