const PaginaAdminUsuarios = {
  data() {
    return {
      itens: [],
      pagina: 1,
      totalPaginas: 1,
      total: 0,
      busca: this.$route.query.busca || '',
      carregando: true,
      erro: '',
      modalAberto: false,
      usuarioEmEdicao: null,
      formulario: this.formularioVazio(),
      enviando: false,
      erroServidor: ''
    };
  },
  computed: {
    filtros() {
      const consulta = this.$route.query;
      return {
        busca: consulta.busca || '',
        pagina: Number(consulta.pagina) || 1
      };
    },
    meuId() {
      return estado.usuario.id;
    }
  },
  watch: {
    '$route.query'() {
      if (this.$route.name === 'admin-usuarios') {
        this.carregar();
      }
    }
  },
  created() {
    this.buscarComAtraso = atrasar(() => this.atualizarFiltros({ busca: this.busca.trim() }));
  },
  mounted() {
    this.carregar();
  },
  methods: {
    rotuloPerfil(perfil) {
      return ROTULOS.perfil[perfil] || perfil;
    },
    formularioVazio() {
      return { nome: '', email: '', senha: '', perfil: 'usuario' };
    },
    atualizarFiltros(mudancas) {
      const novos = { ...this.filtros, pagina: 1, ...mudancas };
      const consulta = {};

      if (novos.busca) consulta.busca = novos.busca;
      if (novos.pagina > 1) consulta.pagina = novos.pagina;

      this.$router.push({ name: 'admin-usuarios', query: consulta });
    },
    async carregar() {
      this.carregando = true;
      try {
        const resposta = await api.get(`/api/admin/usuarios${montarQuery(this.filtros)}`);
        this.itens = resposta.itens;
        this.pagina = resposta.pagina;
        this.totalPaginas = resposta.totalPaginas;
        this.total = resposta.total;
        this.erro = '';
      } catch (erro) {
        this.erro = erro.message;
      } finally {
        this.carregando = false;
      }
    },
    abrirNovo() {
      this.usuarioEmEdicao = null;
      this.formulario = this.formularioVazio();
      this.erroServidor = '';
      this.modalAberto = true;
    },
    abrirEdicao(usuario) {
      this.usuarioEmEdicao = usuario;
      this.formulario = { nome: usuario.nome || '', email: usuario.email, senha: '', perfil: usuario.perfil };
      this.erroServidor = '';
      this.modalAberto = true;
    },
    async salvar() {
      this.enviando = true;
      this.erroServidor = '';
      try {
        if (this.usuarioEmEdicao) {
          await api.put(`/api/admin/usuarios/${this.usuarioEmEdicao.id}`, this.formulario);
          avisar('Usuário atualizado.');
        } else {
          await api.post('/api/admin/usuarios', this.formulario);
          avisar('Usuário criado com sucesso.');
        }
        this.modalAberto = false;
        await this.carregar();
      } catch (erro) {
        this.erroServidor = erro.message;
      } finally {
        this.enviando = false;
      }
    },
    async excluir(usuario) {
      const confirmado = await confirmar({
        titulo: 'Excluir usuário',
        mensagem: `Deseja excluir o usuário ${usuario.email}? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir'
      });
      if (!confirmado) {
        return;
      }
      try {
        await api.delete(`/api/admin/usuarios/${usuario.id}`);
        avisar('Usuário excluído.');
        await this.carregar();
      } catch (erro) {
        avisar(erro.message, 'erro');
      }
    }
  },
  template: `
    <div>
      <div class="secao-topo">
        <h1>Usuários</h1>
        <button type="button" class="btn btn-primario" @click="abrirNovo">Novo usuário</button>
      </div>

      <div class="barra-ferramentas">
        <input type="search" v-model="busca" placeholder="Buscar por nome ou e-mail" aria-label="Buscar" @input="buscarComAtraso">
      </div>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>
      <p v-if="carregando" class="carregando">Carregando usuários...</p>
      <div v-else-if="!erro && itens.length === 0" class="vazio">
        <h3>Nenhum usuário encontrado</h3>
        <p>Ajuste a busca ou cadastre um novo usuário.</p>
      </div>

      <div v-else-if="itens.length > 0" class="tabela-envoltorio">
        <table class="tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Perfil</th>
              <th>Tarefas</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="usuario in itens" :key="usuario.id">
              <td>{{ usuario.id }}</td>
              <td>{{ usuario.nome || 'Não informado' }}</td>
              <td>{{ usuario.email }}</td>
              <td><span class="etiqueta" :class="'etiqueta-' + usuario.perfil">{{ rotuloPerfil(usuario.perfil) }}</span></td>
              <td>{{ usuario.tarefas }}</td>
              <td class="acoes">
                <button type="button" class="btn btn-secundario btn-pequeno" @click="abrirEdicao(usuario)">Editar</button>
                <button type="button" class="btn btn-perigo btn-pequeno" :disabled="usuario.id === meuId" @click="excluir(usuario)">Excluir</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <app-paginacao
        :pagina="pagina"
        :total-paginas="totalPaginas"
        :total="total"
        @mudar="(numero) => atualizarFiltros({ pagina: numero })"
      />

      <app-modal :aberto="modalAberto" :titulo="usuarioEmEdicao ? 'Editar usuário' : 'Novo usuário'" largura="480px" @fechar="modalAberto = false">
        <form @submit.prevent="salvar">
          <div v-if="erroServidor" class="alerta alerta-erro">{{ erroServidor }}</div>

          <div class="campo">
            <label for="usuario-nome">Nome</label>
            <input id="usuario-nome" type="text" v-model="formulario.nome" maxlength="80">
          </div>
          <div class="campo">
            <label for="usuario-email">E-mail</label>
            <input id="usuario-email" type="email" v-model="formulario.email" required>
          </div>
          <div class="campo">
            <label for="usuario-senha">{{ usuarioEmEdicao ? 'Nova senha' : 'Senha' }}</label>
            <input id="usuario-senha" type="password" v-model="formulario.senha" autocomplete="new-password" :required="!usuarioEmEdicao">
            <p class="campo-ajuda">{{ usuarioEmEdicao ? 'Deixe em branco para manter a senha atual.' : 'Use no mínimo 6 caracteres.' }}</p>
          </div>
          <div class="campo">
            <label for="usuario-perfil">Perfil</label>
            <select id="usuario-perfil" v-model="formulario.perfil">
              <option value="usuario">Usuário</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div class="formulario-acoes">
            <button type="button" class="btn btn-secundario" @click="modalAberto = false">Cancelar</button>
            <button type="submit" class="btn btn-primario" :disabled="enviando">{{ usuarioEmEdicao ? 'Salvar alterações' : 'Criar usuário' }}</button>
          </div>
        </form>
      </app-modal>
    </div>
  `
};
