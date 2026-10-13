const { Op } = require('sequelize');
const { escaparLike } = require('./validacao');

function hojeISO() {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, '0');
  const dia = String(agora.getDate()).padStart(2, '0');
  return `${agora.getFullYear()}-${mes}-${dia}`;
}

function estaAtrasada(tarefa) {
  return Boolean(tarefa.prazo) && tarefa.status !== 'concluida' && tarefa.prazo < hojeISO();
}

function serializarTarefa(tarefa, dono) {
  const responsavel = dono || tarefa.dono || null;

  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    descricao: tarefa.descricao || '',
    status: tarefa.status,
    prioridade: tarefa.prioridade,
    prazo: tarefa.prazo || null,
    publica: Boolean(tarefa.publica),
    criadoEm: tarefa.criadoEm || null,
    atrasada: estaAtrasada(tarefa),
    usuarioId: tarefa.usuarioId,
    dono: responsavel
      ? { id: responsavel.id, nome: responsavel.nome || null, email: responsavel.email }
      : null
  };
}

function serializarPublica(tarefa) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    descricao: tarefa.descricao || '',
    status: tarefa.status,
    prioridade: tarefa.prioridade,
    prazo: tarefa.prazo || null,
    criadoEm: tarefa.criadoEm || null,
    atrasada: estaAtrasada(tarefa),
    autor: tarefa.dono && tarefa.dono.nome ? tarefa.dono.nome : 'Usuário'
  };
}

function filtroBusca(busca) {
  const termo = typeof busca === 'string' ? busca.trim() : '';
  if (termo === '') {
    return {};
  }

  const padrao = `%${escaparLike(termo)}%`;
  return {
    [Op.or]: [
      { titulo: { [Op.like]: padrao } },
      { descricao: { [Op.like]: padrao } }
    ]
  };
}

module.exports = { hojeISO, estaAtrasada, serializarTarefa, serializarPublica, filtroBusca };
