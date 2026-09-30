var PaginaAdmin = {
  template: '#tpl-admin'
};

var PaginaAdminObjeto = {
  template: '#tpl-admin-objeto',
  data: function () {
    return {
      tarefas: [],
      carregando: true,
      erro: ''
    };
  },
  mounted: function () {
    this.carregar();
  },
  methods: {
    carregar: function () {
      var self = this;
      self.carregando = true;
      api('/api/admin/tarefas').then(function (lista) {
        self.tarefas = lista;
        self.erro = '';
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.carregando = false;
      });
    },
    excluir: function (tarefa) {
      var self = this;
      if (!window.confirm('Excluir a tarefa ' + tarefa.titulo + '?')) {
        return;
      }
      api('/api/tarefas/' + tarefa.id, 'DELETE').then(function () {
        self.carregar();
      }).catch(function (e) {
        self.erro = e.message;
      });
    }
  }
};

var PaginaAdminUsuarios = {
  template: '#tpl-admin-usuarios',
  data: function () {
    return {
      usuarios: [],
      carregando: true,
      erro: '',
      email: '',
      senha: '',
      perfil: 'usuario'
    };
  },
  mounted: function () {
    this.carregar();
  },
  methods: {
    carregar: function () {
      var self = this;
      self.carregando = true;
      api('/api/admin/usuarios').then(function (lista) {
        self.usuarios = lista;
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.carregando = false;
      });
    },
    criar: function () {
      var self = this;
      api('/api/admin/usuarios', 'POST', {
        email: self.email,
        senha: self.senha,
        perfil: self.perfil
      }).then(function () {
        self.email = '';
        self.senha = '';
        self.perfil = 'usuario';
        self.erro = '';
        self.carregar();
      }).catch(function (e) {
        self.erro = e.message;
      });
    }
  }
};
