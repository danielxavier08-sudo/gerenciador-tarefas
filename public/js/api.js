async function requisitar(url, metodo, dados) {
  const opcoes = { method: metodo, headers: { Accept: 'application/json' } };
  const token = sessionStorage.getItem('token');

  if (token) {
    opcoes.headers.Authorization = `Bearer ${token}`;
  }
  if (dados !== undefined) {
    opcoes.headers['Content-Type'] = 'application/json';
    opcoes.body = JSON.stringify(dados);
  }

  let resposta;
  try {
    resposta = await fetch(url, opcoes);
  } catch (falha) {
    throw new Error('Não foi possível conectar ao servidor. Tente novamente em instantes.');
  }

  const corpo = await resposta.json().catch(() => ({}));

  if (!resposta.ok) {
    const erro = new Error(corpo.erro || 'Não foi possível concluir a operação.');
    erro.status = resposta.status;

    if (resposta.status === 401 && token) {
      encerrarSessao();
      const atual = router.currentRoute.value;
      if (estado.carregado && atual.name !== 'entrar') {
        router.push({ name: 'entrar', query: { destino: atual.fullPath } });
      }
    }
    throw erro;
  }

  return corpo;
}

const api = {
  get: (url) => requisitar(url, 'GET'),
  post: (url, dados) => requisitar(url, 'POST', dados),
  put: (url, dados) => requisitar(url, 'PUT', dados),
  patch: (url, dados) => requisitar(url, 'PATCH', dados),
  delete: (url) => requisitar(url, 'DELETE')
};

async function restaurarSessao() {
  if (sessionStorage.getItem('token')) {
    try {
      const resposta = await api.get('/api/sessao');
      estado.usuario = resposta.usuario;
    } catch (erro) {
      encerrarSessao();
    }
  }
  estado.carregado = true;
}
