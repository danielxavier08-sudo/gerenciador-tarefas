var PaginaInicial = {
  template: '#tpl-inicial',
  data: function () {
    return {
      tarefas: [],
      carregando: true,
      enviando: false,
      erro: '',
      titulo: '',
      descricao: ''
    };
  },
  mounted: function () {
    this.carregar();
  },
  methods: {
    carregar: function () {
      var self = this;
      self.carregando = true;
      api('/api/tarefas').then(function (lista) {
        self.tarefas = lista;
        self.erro = '';
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.carregando = false;
      });
    },
    cadastrar: function () {
      var self = this;
      if (self.titulo.trim() === '') {
        self.erro = 'O titulo da tarefa e obrigatorio.';
        return;
      }
      self.enviando = true;
      api('/api/tarefas', 'POST', { titulo: self.titulo, descricao: self.descricao }).then(function () {
        self.titulo = '';
        self.descricao = '';
        self.erro = '';
        self.carregar();
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.enviando = false;
      });
    },
    alternar: function (tarefa) {
      var self = this;
      api('/api/tarefas/' + tarefa.id + '/status', 'POST').then(function (atualizada) {
        tarefa.status = atualizada.status;
        self.erro = '';
      }).catch(function (e) {
        self.erro = e.message;
      });
    }
  }
};
