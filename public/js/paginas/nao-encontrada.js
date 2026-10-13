const PaginaNaoEncontrada = {
  template: `
    <section class="vazio vazio-grande">
      <p class="codigo-erro">404</p>
      <h1>Página não encontrada</h1>
      <p>O endereço acessado não existe neste sistema.</p>
      <router-link :to="{ name: 'painel' }" class="btn btn-primario">Ir para o painel</router-link>
    </section>
  `
};
