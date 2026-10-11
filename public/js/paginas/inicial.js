var PaginaInicial = {
  template: '#tpl-inicial',
  data: function () {
    return {
      tarefas: [],
      carregando: true,
      enviando: false,
      erro: '',
      titulo: '',
      descricao: '',
      filtro: 'todas',
      opcoesFiltro: [
        { valor: 'todas', rotulo: 'Todas' },
        { valor: 'pendente', rotulo: 'Pendentes' },
        { valor: 'concluida', rotulo: 'Concluidas' }
      ]
    };
  },
  computed: {
    // Lista exibida: recalculada sozinha quando o filtro ou as tarefas mudam
    tarefasFiltradas: function () {
      var filtro = this.filtro;
      if (filtro === 'todas') {
        return this.tarefas;
      }
      return this.tarefas.filter(function (tarefa) {
        return tarefa.status === filtro;
      });
    }
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
