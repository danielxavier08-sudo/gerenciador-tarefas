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
      // Com JWT nao ha nada para desfazer no servidor: basta descartar o token
      sessionStorage.removeItem('token');
      estado.usuario = null;
      router.push({ name: 'login' });
    }
  }
};

Vue.createApp(App).use(router).mount('#app');
