require('dotenv').config();
const bcrypt = require('bcrypt');
const { prepararBanco } = require('./config/esquema');
const { sequelize, Usuario, Tarefa } = require('./models');

function dataEmDias(dias) {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${data.getFullYear()}-${mes}-${dia}`;
}

async function garantirUsuario(email, nome, senha, perfil) {
  const senhaHash = await bcrypt.hash(senha, 10);
  const [usuario, criado] = await Usuario.findOrCreate({
    where: { email },
    defaults: { nome, senhaHash, perfil }
  });

  if (!criado && !usuario.nome) {
    await usuario.update({ nome });
  }
  console.log(`${criado ? 'Criado' : 'Já existia'}: ${email} / ${senha} / ${perfil}`);
  return usuario;
}

async function semear() {
  await prepararBanco();

  await garantirUsuario('admin@teste.com', 'Administrador', 'admin123', 'admin');
  const usuario = await garantirUsuario('usuario@teste.com', 'Usuário de Teste', 'user123', 'usuario');

  const existentes = await Tarefa.count({ where: { usuarioId: usuario.id } });
  if (existentes > 0) {
    console.log('As tarefas de exemplo não foram criadas porque o usuário já possui tarefas.');
    return;
  }

  const base = { usuarioId: usuario.id };
  await Tarefa.bulkCreate([
    { ...base, titulo: 'Entregar o projeto final de Desenvolvimento Web III', descricao: 'Revisar o repositório, o README e o relatório antes do envio.', status: 'andamento', prioridade: 'alta', prazo: dataEmDias(3), publica: true },
    { ...base, titulo: 'Estudar associações do Sequelize', descricao: 'Ler sobre hasMany, belongsTo e include.', status: 'pendente', prioridade: 'media', prazo: dataEmDias(7), publica: true },
    { ...base, titulo: 'Revisar rotas protegidas com JWT', descricao: 'Testar as rotas administrativas com e sem token.', status: 'concluida', prioridade: 'alta', prazo: dataEmDias(-2), publica: true },
    { ...base, titulo: 'Preparar apresentação do sistema', descricao: 'Montar um roteiro curto mostrando login, painel e administração.', status: 'pendente', prioridade: 'media', prazo: dataEmDias(5), publica: false },
    { ...base, titulo: 'Corrigir tarefa atrasada de exemplo', descricao: 'Esta tarefa serve para mostrar o indicador de atraso.', status: 'pendente', prioridade: 'alta', prazo: dataEmDias(-4), publica: false },
    { ...base, titulo: 'Organizar a documentação do projeto', descricao: '', status: 'pendente', prioridade: 'baixa', prazo: null, publica: true },
    { ...base, titulo: 'Configurar o banco de dados local', descricao: 'Criar o banco e rodar o seed.', status: 'concluida', prioridade: 'media', prazo: null, publica: false },
    { ...base, titulo: 'Revisar o layout em telas pequenas', descricao: 'Abrir o sistema no celular e conferir o menu.', status: 'andamento', prioridade: 'baixa', prazo: dataEmDias(10), publica: false }
  ]);
  console.log('Tarefas de exemplo criadas.');
}

semear()
  .then(function () {
    return sequelize.close();
  })
  .catch(function (erro) {
    console.error('Erro ao rodar o seed:', erro);
    process.exit(1);
  });
