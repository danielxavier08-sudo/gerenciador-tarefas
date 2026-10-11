// Lista paginada de tarefas. A pagina e o filtro ficam na URL (?pagina=2&status=pendente),
// entao cada pagina e uma rota que o Vue Router entende, sem recarregar o navegador.
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
      pagina: 1,
      totalPaginas: 1,
      total: 0,
      opcoesFiltro: [
        { valor: 'todas', rotulo: 'Todas' },
        { valor: 'pendente', rotulo: 'Pendentes' },
        { valor: 'concluida', rotulo: 'Concluidas' }
      ]
    };
  },
  computed: {
    filtro: function () {
      var status = this.$route.query.status;
      return (status === 'pendente' || status === 'concluida') ? status : 'todas';
    },
    paginaPedida: function () {
      var n = parseInt(this.$route.query.pagina, 10);
      return n > 0 ? n : 1;
    }
  },
  watch: {
    // Mudou a pagina ou o filtro na URL: busca de novo na API
    '$route.query': function () {
      if (this.$route.name === 'inicial') {
        this.carregar();
      }
    }
  },
  mounted: function () {
    this.carregar();
  },
  methods: {
    carregar: function (silencioso) {
      var self = this;
      if (!silencioso) {
        self.carregando = true;
      }
      var parametros = '?pagina=' + self.paginaPedida;
      if (self.filtro !== 'todas') {
        parametros += '&status=' + self.filtro;
      }
      api('/api/tarefas' + parametros).then(function (dados) {
        self.tarefas = dados.itens;
        self.pagina = dados.pagina;
        self.totalPaginas = dados.totalPaginas;
        self.total = dados.total;
        self.erro = '';
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.carregando = false;
      });
    },
    montarQuery: function (pagina, filtro) {
      var query = {};
      if (filtro !== 'todas') { query.status = filtro; }
      if (pagina > 1) { query.pagina = pagina; }
      return query;
    },
    irParaPagina: function (pagina) {
      router.push({ name: 'inicial', query: this.montarQuery(pagina, this.filtro) });
    },
    filtrar: function (valor) {
      router.push({ name: 'inicial', query: this.montarQuery(1, valor) });
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
        self.carregar(true);
      }).catch(function (e) {
        self.erro = e.message;
      }).then(function () {
        self.enviando = false;
      });
    },
    alternar: function (tarefa) {
      var self = this;
      api('/api/tarefas/' + tarefa.id + '/status', 'POST').then(function () {
        self.erro = '';
        // Recarrega: com um filtro ativo, a tarefa pode sair desta pagina
        self.carregar(true);
      }).catch(function (e) {
        self.erro = e.message;
      });
    }
  }
};
