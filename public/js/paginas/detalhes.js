var PaginaDetalhes = {
  template: '#tpl-detalhes',
  props: ['id'],
  data: function () {
    return {
      tarefa: null,
      carregando: true,
      erro: ''
    };
  },
  computed: {
    ehAdmin: function () {
      return estado.usuario && estado.usuario.perfil === 'admin';
    }
  },
  watch: {
    id: function () {
      this.carregar();
    }
  },
  mounted: function () {
    this.carregar();
  },
  methods: {
    carregar: function () {
      var self = this;
      self.carregando = true;
      self.erro = '';
      api('/api/tarefas/' + self.id).then(function (tarefa) {
        self.tarefa = tarefa;
      }).catch(function (e) {
        self.tarefa = null;
        self.erro = e.message;
      }).then(function () {
        self.carregando = false;
      });
    },
    alternar: function () {
      var self = this;
      api('/api/tarefas/' + self.id + '/status', 'POST').then(function (atualizada) {
        self.tarefa = atualizada;
        self.erro = '';
      }).catch(function (e) {
        self.erro = e.message;
      });
    },
    excluir: function () {
      var self = this;
      if (!window.confirm('Excluir esta tarefa?')) {
        return;
      }
      api('/api/tarefas/' + self.id, 'DELETE').then(function () {
        router.push({ name: 'inicial' });
      }).catch(function (e) {
        self.erro = e.message;
      });
    }
  }
};
