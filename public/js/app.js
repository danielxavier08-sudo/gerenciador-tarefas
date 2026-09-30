var App = {
  template: '#tpl-app',
  computed: {
    usuario: function () {
      return estado.usuario;
    },
    ehAdmin: function () {
      return estado.usuario && estado.usuario.perfil === 'admin';
    }
  },
  methods: {
    sair: function () {
      api('/api/logout', 'POST').then(function () {
        estado.usuario = null;
        router.push({ name: 'login' });
      });
    }
  }
};

Vue.createApp(App).use(router).mount('#app');
