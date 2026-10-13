const Raiz = {
  data() {
    return { estado };
  },
  computed: {
    nomeUsuario() {
      return this.estado.usuario ? (this.estado.usuario.nome || this.estado.usuario.email) : '';
    },
    ehAdmin() {
      return Boolean(this.estado.usuario) && this.estado.usuario.perfil === 'admin';
    },
    naAreaAdmin() {
      return this.$route.path.startsWith('/admin');
    }
  },
  methods: {
    sair() {
      encerrarSessao();
      this.$router.push({ name: 'entrar' });
    }
  },
  template: `
    <header class="site-cabecalho">
      <div class="container site-cabecalho-interno">
        <a class="marca" href="/">
          <img src="/img/simbolo-ifce.png" alt="Símbolo do IFCE">
          <span class="marca-texto">
            Gerenciador de Tarefas
            <small>Instituto Federal do Ceará</small>
          </span>
        </a>

        <nav class="menu-principal" aria-label="Principal">
          <template v-if="estado.usuario">
            <router-link :to="{ name: 'painel' }">Painel</router-link>
            <router-link :to="{ name: 'tarefas' }">Tarefas</router-link>
            <router-link v-if="ehAdmin" :to="{ name: 'admin' }" :class="{ 'router-link-active': naAreaAdmin }">Administração</router-link>
          </template>
          <a href="/tarefas">Mural</a>
          <a href="/autor">Autor</a>

          <div class="usuario-menu">
            <template v-if="estado.usuario">
              <span class="usuario-nome">{{ nomeUsuario }}</span>
              <button type="button" class="btn btn-secundario btn-pequeno" @click="sair">Sair</button>
            </template>
            <router-link v-else :to="{ name: 'entrar' }" class="btn btn-primario btn-pequeno">Entrar</router-link>
          </div>
        </nav>
      </div>
    </header>

    <main class="container conteudo">
      <router-view></router-view>
    </main>

    <footer class="site-rodape">
      <div class="container site-rodape-interno">
        <img src="/img/logo-ifce.png" alt="Instituto Federal do Ceará">
        <p>
          Projeto acadêmico da disciplina de Desenvolvimento Web III<br>
          Técnico em Informática para Internet, IFCE
        </p>
      </div>
    </footer>

    <app-avisos></app-avisos>
    <app-confirmacao></app-confirmacao>
  `
};

const componentes = {
  AppModal,
  AppConfirmacao,
  AppAvisos,
  AppEtiqueta,
  AppPaginacao,
  CartaoMetrica,
  CartaoTarefa,
  FormularioTarefa
};

restaurarSessao().then(() => {
  const aplicacao = Vue.createApp(Raiz);
  Object.entries(componentes).forEach(([nome, definicao]) => aplicacao.component(nome, definicao));
  aplicacao.use(router).mount('#app');
});
