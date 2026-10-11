// Funcao unica para conversar com a API do servidor.
// O token JWT fica na sessionStorage e vai em todas as requisicoes.
function api(url, metodo, dados) {
  var opcoes = {
    method: metodo || 'GET',
    headers: { 'Accept': 'application/json' }
  };

  var token = sessionStorage.getItem('token');
  if (token) {
    opcoes.headers['Authorization'] = 'Bearer ' + token;
  }

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

        // Token ausente, invalido ou expirado: limpa tudo e volta para o login
        if (resposta.status === 401 && url !== '/api/login') {
          sessionStorage.removeItem('token');
          estado.usuario = null;
          if (estado.carregado) {
            router.push({ name: 'login' });
          }
        }

        throw erro;
      }
      return corpo;
    });
  });
}

// Descobre quem esta logado a partir do token guardado (usado ao abrir ou recarregar a pagina)
function carregarSessao() {
  if (!sessionStorage.getItem('token')) {
    estado.usuario = null;
    estado.carregado = true;
    return Promise.resolve();
  }

  return api('/api/sessao').then(function (dados) {
    estado.usuario = dados.usuario;
    estado.carregado = true;
  }).catch(function () {
    estado.usuario = null;
    estado.carregado = true;
  });
}
