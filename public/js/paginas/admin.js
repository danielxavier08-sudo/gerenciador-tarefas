const PaginaAdmin = {
  template: `
    <div class="admin">
      <nav class="admin-menu" aria-label="Administração">
        <h2>Administração</h2>
        <router-link :to="{ name: 'admin' }">Resumo</router-link>
        <router-link :to="{ name: 'admin-tarefas' }">Tarefas</router-link>
        <router-link :to="{ name: 'admin-usuarios' }">Usuários</router-link>
      </nav>
      <section class="admin-conteudo">
        <router-view></router-view>
      </section>
    </div>
  `
};
