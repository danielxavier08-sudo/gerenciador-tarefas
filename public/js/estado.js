const estado = Vue.reactive({
  usuario: null,
  carregado: false
});

const avisos = Vue.reactive({
  itens: [],
  contador: 0
});

const dialogo = Vue.reactive({
  aberto: false,
  titulo: '',
  mensagem: '',
  textoConfirmar: 'Confirmar',
  resolver: null
});

function iniciarSessao(resposta) {
  sessionStorage.setItem('token', resposta.token);
  estado.usuario = resposta.usuario;
}

function encerrarSessao() {
  sessionStorage.removeItem('token');
  estado.usuario = null;
}

function removerAviso(id) {
  const posicao = avisos.itens.findIndex((aviso) => aviso.id === id);
  if (posicao >= 0) {
    avisos.itens.splice(posicao, 1);
  }
}

function avisar(mensagem, tipo = 'sucesso') {
  avisos.contador += 1;
  const id = avisos.contador;
  avisos.itens.push({ id, mensagem, tipo });
  setTimeout(() => removerAviso(id), 4500);
}

function confirmar(opcoes) {
  return new Promise((resolve) => {
    Object.assign(dialogo, {
      aberto: true,
      titulo: 'Confirmação',
      textoConfirmar: 'Confirmar',
      ...opcoes,
      resolver: resolve
    });
  });
}
