const { ErroHttp } = require('./erros');
const { STATUS, PRIORIDADES } = require('./constantes');

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PADRAO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;

function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

function lerStatus(valor) {
  if (!STATUS.includes(valor)) {
    throw new ErroHttp(400, 'Status inválido.');
  }
  return valor;
}

function lerPrioridade(valor) {
  if (!PRIORIDADES.includes(valor)) {
    throw new ErroHttp(400, 'Prioridade inválida.');
  }
  return valor;
}

function lerPrazo(valor) {
  if (valor === undefined || valor === null || valor === '') {
    return null;
  }

  const partes = PADRAO_DATA.exec(String(valor));
  if (!partes) {
    throw new ErroHttp(400, 'Prazo inválido. Use o formato AAAA-MM-DD.');
  }

  const ano = Number(partes[1]);
  const mes = Number(partes[2]);
  const dia = Number(partes[3]);
  const data = new Date(ano, mes - 1, dia);
  const valida = data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia;

  if (!valida) {
    throw new ErroHttp(400, 'Prazo inválido.');
  }
  return String(valor);
}

function lerTarefa(corpo) {
  const dados = corpo || {};
  const titulo = texto(dados.titulo);
  const descricao = texto(dados.descricao);

  if (titulo.length < 3 || titulo.length > 120) {
    throw new ErroHttp(400, 'O título deve ter entre 3 e 120 caracteres.');
  }
  if (descricao.length > 2000) {
    throw new ErroHttp(400, 'A descrição pode ter no máximo 2000 caracteres.');
  }

  return {
    titulo,
    descricao,
    status: dados.status === undefined ? 'pendente' : lerStatus(dados.status),
    prioridade: dados.prioridade === undefined ? 'media' : lerPrioridade(dados.prioridade),
    prazo: lerPrazo(dados.prazo),
    publica: dados.publica === true || dados.publica === 'true'
  };
}

function lerNome(valor, obrigatorio) {
  const nome = texto(valor);
  if (nome === '' && !obrigatorio) {
    return null;
  }
  if (nome.length < 2 || nome.length > 80) {
    throw new ErroHttp(400, 'O nome deve ter entre 2 e 80 caracteres.');
  }
  return nome;
}

function lerEmail(valor) {
  const email = texto(valor).toLowerCase();
  if (!PADRAO_EMAIL.test(email) || email.length > 120) {
    throw new ErroHttp(400, 'Informe um e-mail válido.');
  }
  return email;
}

function lerSenha(valor) {
  if (typeof valor !== 'string' || valor.length < 6 || valor.length > 72) {
    throw new ErroHttp(400, 'A senha deve ter entre 6 e 72 caracteres.');
  }
  return valor;
}

function lerPerfil(valor) {
  return valor === 'admin' ? 'admin' : 'usuario';
}

function escaparLike(valor) {
  return String(valor).replace(/[\\%_]/g, '\\$&');
}

module.exports = {
  texto,
  lerStatus,
  lerPrioridade,
  lerPrazo,
  lerTarefa,
  lerNome,
  lerEmail,
  lerSenha,
  lerPerfil,
  escaparLike
};
