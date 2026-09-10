const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  email: {
    type: DataTypes.STRING(120),
    allowNull: false,
    unique: true
  },
  senhaHash: {
    type: DataTypes.STRING(120),
    allowNull: false
  },
  perfil: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'usuario'
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

module.exports = Usuario;
