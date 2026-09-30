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
        estado.usuario = dados.usuario;
        var destino = self.$route.query.destino || '/';
        router.push(destino);
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.enviando = false;
      });
    }
  }
};
