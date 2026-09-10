require('dotenv').config();
const bcrypt = require('bcrypt');
const sequelize = require('./config/database');
const Usuario = require('./models/Usuario');

async function seed() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    const senhaAdminHash = await bcrypt.hash('admin123', 10);
    const senhaUserHash = await bcrypt.hash('user123', 10);

    const [admin, criouAdmin] = await Usuario.findOrCreate({
      where: { email: 'admin@teste.com' },
      defaults: { senhaHash: senhaAdminHash, perfil: 'admin' }
    });

    const [usuario, criouUsuario] = await Usuario.findOrCreate({
      where: { email: 'usuario@teste.com' },
      defaults: { senhaHash: senhaUserHash, perfil: 'usuario' }
    });

    console.log(criouAdmin ? 'Criado' : 'Ja existia', 'admin@teste.com / admin123 / admin');
    console.log(criouUsuario ? 'Criado' : 'Ja existia', 'usuario@teste.com / user123 / usuario');

    process.exit(0);
  } catch (erro) {
    console.error('Erro ao rodar o seed:', erro);
    process.exit(1);
  }
}

seed();
