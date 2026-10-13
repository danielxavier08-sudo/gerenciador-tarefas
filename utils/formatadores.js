const { ROTULOS_STATUS, ROTULOS_PRIORIDADE } = require('./constantes');

function rotuloStatus(valor) {
  return ROTULOS_STATUS[valor] || valor;
}

function rotuloPrioridade(valor) {
  return ROTULOS_PRIORIDADE[valor] || valor;
}

function formatarData(valor) {
  if (!valor) {
    return '';
  }
  const [ano, mes, dia] = new Date(valor).toISOString().slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function formatarPrazo(valor) {
  if (!valor) {
    return 'Sem prazo';
  }
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function montarUrl(base, parametros) {
  const consulta = new URLSearchParams();
  Object.entries(parametros).forEach(function ([chave, valor]) {
    if (valor !== '' && valor !== null && valor !== undefined) {
      consulta.set(chave, valor);
    }
  });
  const texto = consulta.toString();
  return texto ? `${base}?${texto}` : base;
}

module.exports = { rotuloStatus, rotuloPrioridade, formatarData, formatarPrazo, montarUrl };
