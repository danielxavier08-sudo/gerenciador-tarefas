var PaginaLogin = {
  template: '#tpl-login',
  data: function () {
    return {
      email: '',
      senha: '',
      erro: '',
      enviando: false
    };
  },
  methods: {
    entrar: function () {
      var self = this;
      self.enviando = true;
      self.erro = '';
      api('/api/login', 'POST', { email: self.email, senha: self.senha }).then(function (dados) {
        sessionStorage.setItem('token', dados.token);
        estado.usuario = dados.usuario;

        // Admin vai para a administracao; usuario comum vai para a lista de tarefas
        var destino = self.$route.query.destino;
        if (!destino) {
          destino = dados.usuario.perfil === 'admin' ? '/admin' : '/';
        }
        router.push(destino);
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.enviando = false;
      });
    }
  }
};
