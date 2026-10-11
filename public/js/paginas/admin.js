var PaginaAdmin = {
  template: '#tpl-admin'
};

// Admin / Inicial: resumo do sistema
var PaginaAdminInicial = {
  template: '#tpl-admin-inicial',
  data: function () {
    return {
      tarefas: [],
      usuarios: [],
      carregando: true,
      erro: ''
    };
  },
  computed: {
    pendentes: function () {
      return this.tarefas.filter(function (t) { return t.status === 'pendente'; }).length;
    },
    concluidas: function () {
      return this.tarefas.filter(function (t) { return t.status === 'concluida'; }).length;
    }
  },
  mounted: function () {
    var self = this;
    Promise.all([api('/api/admin/tarefas'), api('/api/admin/usuarios')]).then(function (resultado) {
      self.tarefas = resultado[0];
      self.usuarios = resultado[1];
      self.erro = '';
    }).catch(function (e) {
      self.erro = e.message;
    }).then(function () {
      self.carregando = false;
    });
  }
};

// Admin / Objeto: cadastro de tarefas (formulario de cadastro e edicao + tabela com exclusao)
var PaginaAdminObjeto = {
  template: '#tpl-admin-objeto',
  data: function () {
    return {
      tarefas: [],
      usuarios: [],
      carregando: true,
      enviando: false,
      erro: '',
      editandoId: null,
      titulo: '',
      descricao: '',
      status: 'pendente',
      usuarioId: ''
    };
  },
  mounted: function () {
    this.carregar();
  },
  methods: {
    carregar: function () {
      var self = this;
      self.carregando = true;
      Promise.all([api('/api/admin/tarefas'), api('/api/admin/usuarios')]).then(function (resultado) {
        self.tarefas = resultado[0];
        self.usuarios = resultado[1];
        if (self.usuarioId === '' && self.usuarios.length > 0) {
          self.usuarioId = self.usuarios[0].id;
        }
        self.erro = '';
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.carregando = false;
      });
    },
    limparFormulario: function () {
      this.editandoId = null;
      this.titulo = '';
      this.descricao = '';
      this.status = 'pendente';
      this.usuarioId = this.usuarios.length > 0 ? this.usuarios[0].id : '';
    },
    salvar: function () {
      var self = this;
      var dados = {
        titulo: self.titulo,
        descricao: self.descricao,
        status: self.status,
        usuarioId: self.usuarioId
      };
      var pedido = self.editandoId
        ? api('/api/admin/tarefas/' + self.editandoId, 'PUT', dados)
        : api('/api/admin/tarefas', 'POST', dados);

      self.enviando = true;
      pedido.then(function () {
        self.limparFormulario();
        self.erro = '';
        self.carregar();
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.enviando = false;
      });
    },
    editar: function (tarefa) {
      this.editandoId = tarefa.id;
      this.titulo = tarefa.titulo;
      this.descricao = tarefa.descricao;
      this.status = tarefa.status;
      this.usuarioId = tarefa.usuarioId;
      this.erro = '';
      window.scrollTo(0, 0);
    },
    excluir: function (tarefa) {
      var self = this;
      if (!window.confirm('Excluir a tarefa ' + tarefa.titulo + '?')) {
        return;
      }
      api('/api/admin/tarefas/' + tarefa.id, 'DELETE').then(function () {
        if (self.editandoId === tarefa.id) {
          self.limparFormulario();
        }
        self.carregar();
      }).catch(function (e) {
        self.erro = e.message;
      });
    }
  }
};

// Admin / Usuarios: cadastro de usuarios (formulario de cadastro e edicao + tabela com exclusao)
var PaginaAdminUsuarios = {
  template: '#tpl-admin-usuarios',
  data: function () {
    return {
      usuarios: [],
      carregando: true,
      enviando: false,
      erro: '',
      editandoId: null,
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
    limparFormulario: function () {
      this.editandoId = null;
      this.email = '';
      this.senha = '';
      this.perfil = 'usuario';
    },
    salvar: function () {
      var self = this;
      var dados = { email: self.email, senha: self.senha, perfil: self.perfil };
      var pedido = self.editandoId
        ? api('/api/admin/usuarios/' + self.editandoId, 'PUT', dados)
        : api('/api/admin/usuarios', 'POST', dados);

      self.enviando = true;
      pedido.then(function () {
        self.limparFormulario();
        self.erro = '';
        self.carregar();
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.enviando = false;
      });
    },
    editar: function (usuario) {
      this.editandoId = usuario.id;
      this.email = usuario.email;
      this.senha = '';
      this.perfil = usuario.perfil;
      this.erro = '';
      window.scrollTo(0, 0);
    },
    excluir: function (usuario) {
      var self = this;
      if (!window.confirm('Excluir o usuario ' + usuario.email + '?')) {
        return;
      }
      api('/api/admin/usuarios/' + usuario.id, 'DELETE').then(function () {
        if (self.editandoId === usuario.id) {
          self.limparFormulario();
        }
        self.erro = '';
        self.carregar();
      }).catch(function (e) {
        self.erro = e.message;
      });
    }
  }
};
