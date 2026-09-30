// Funcao unica para conversar com a API do servidor
function api(url, metodo, dados) {
  var opcoes = {
    method: metodo || 'GET',
    credentials: 'same-origin',
    headers: {}
  };

  if (dados !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(dados);
  }

  return fetch(url, opcoes).then(function (resposta) {
    return resposta.json().catch(function () {
      return {};
    }).then(function (corpo) {
      if (!resposta.ok) {
        var erro = new Error(corpo.erro || 'Erro na requisicao.');
        erro.status = resposta.status;

        // Sessao expirada: volta para o login
        if (resposta.status === 401 && url !== '/api/login') {
          estado.usuario = null;
          router.push({ name: 'login' });
        }

        throw erro;
      }
      return corpo;
    });
  });
}

function carregarSessao() {
  return api('/api/sessao').then(function (dados) {
    estado.usuario = dados.usuario;
    estado.carregado = true;
  }).catch(function () {
    estado.usuario = null;
    estado.carregado = true;
  });
}
