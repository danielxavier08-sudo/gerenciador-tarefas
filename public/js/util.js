const ROTULOS = {
  status: { pendente: 'Pendente', andamento: 'Em andamento', concluida: 'Concluída' },
  prioridade: { baixa: 'Baixa', media: 'Média', alta: 'Alta' },
  perfil: { admin: 'Administrador', usuario: 'Usuário' }
};

const OPCOES_STATUS = Object.entries(ROTULOS.status).map(([valor, rotulo]) => ({ valor, rotulo }));
const OPCOES_PRIORIDADE = Object.entries(ROTULOS.prioridade).map(([valor, rotulo]) => ({ valor, rotulo }));

function formatarData(valor) {
  if (!valor) {
    return '';
  }
  const [ano, mes, dia] = String(valor).slice(0, 10).split('-');
  return `${dia}/${mes}/${ano}`;
}

function montarQuery(parametros) {
  const consulta = new URLSearchParams();
  Object.entries(parametros).forEach(([chave, valor]) => {
    if (valor !== '' && valor !== null && valor !== undefined) {
      consulta.set(chave, valor);
    }
  });
  const texto = consulta.toString();
  return texto ? `?${texto}` : '';
}

function atrasar(funcao, espera = 350) {
  let temporizador;
  return function (...argumentos) {
    clearTimeout(temporizador);
    temporizador = setTimeout(() => funcao.apply(this, argumentos), espera);
  };
}

function destinoSeguro(destino) {
  return typeof destino === 'string' && destino.startsWith('/') && !destino.startsWith('//') ? destino : null;
}
