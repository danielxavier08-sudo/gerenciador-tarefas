const PaginaEntrar = {
  data() {
    return {
      modo: 'entrar',
      nome: '',
      email: '',
      senha: '',
      erro: '',
      enviando: false
    };
  },
  computed: {
    ehRegistro() {
      return this.modo === 'registro';
    }
  },
  methods: {
    trocarModo(modo) {
      this.modo = modo;
      this.erro = '';
    },
    async enviar() {
      this.enviando = true;
      this.erro = '';

      try {
        const dados = this.ehRegistro
          ? { nome: this.nome, email: this.email, senha: this.senha }
          : { email: this.email, senha: this.senha };
        const resposta = await api.post(this.ehRegistro ? '/api/registro' : '/api/login', dados);

        iniciarSessao(resposta);
        const padrao = resposta.usuario.perfil === 'admin' ? '/admin' : '/';
        this.$router.push(destinoSeguro(this.$route.query.destino) || padrao);
      } catch (erro) {
        this.erro = erro.message;
      } finally {
        this.enviando = false;
      }
    }
  },
  template: `
    <section class="entrar">
      <div class="entrar-lateral">
        <img src="/img/logo-ifce.png" alt="Instituto Federal do Ceará">
        <p>Organize tarefas, prazos e prioridades em um só lugar.</p>
      </div>

      <div class="entrar-formulario">
        <div class="abas" role="tablist">
          <button type="button" :class="{ ativo: !ehRegistro }" @click="trocarModo('entrar')">Entrar</button>
          <button type="button" :class="{ ativo: ehRegistro }" @click="trocarModo('registro')">Criar conta</button>
        </div>

        <form @submit.prevent="enviar">
          <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>

          <div v-if="ehRegistro" class="campo">
            <label for="entrar-nome">Nome</label>
            <input id="entrar-nome" type="text" v-model="nome" autocomplete="name" required>
          </div>
          <div class="campo">
            <label for="entrar-email">E-mail</label>
            <input id="entrar-email" type="email" v-model="email" autocomplete="email" required>
          </div>
          <div class="campo">
            <label for="entrar-senha">Senha</label>
            <input id="entrar-senha" type="password" v-model="senha" :autocomplete="ehRegistro ? 'new-password' : 'current-password'" required>
            <p v-if="ehRegistro" class="campo-ajuda">Use no mínimo 6 caracteres.</p>
          </div>

          <button type="submit" class="btn btn-primario" style="width: 100%" :disabled="enviando">
            {{ enviando ? 'Aguarde...' : (ehRegistro ? 'Criar conta' : 'Entrar') }}
          </button>
        </form>
      </div>
    </section>
  `
};
