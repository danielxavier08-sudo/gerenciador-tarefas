const PaginaAdminTarefas = {
  data() {
    return {
      itens: [],
      usuarios: [],
      pagina: 1,
      totalPaginas: 1,
      total: 0,
      busca: this.$route.query.busca || '',
      carregando: true,
      erro: '',
      modalAberto: false,
      tarefaEmEdicao: null,
      enviando: false,
      erroServidor: '',
      opcoesStatus: OPCOES_STATUS
    };
  },
  computed: {
    filtros() {
      const consulta = this.$route.query;
      return {
        busca: consulta.busca || '',
        status: consulta.status || '',
        pagina: Number(consulta.pagina) || 1
      };
    }
  },
  watch: {
    '$route.query'() {
      if (this.$route.name === 'admin-tarefas') {
        this.carregar();
      }
    }
  },
  created() {
    this.buscarComAtraso = atrasar(() => this.atualizarFiltros({ busca: this.busca.trim() }));
  },
  async mounted() {
    try {
      this.usuarios = await api.get('/api/admin/usuarios/opcoes');
    } catch (erro) {
      this.erro = erro.message;
    }
    await this.carregar();
  },
  methods: {
    formatarData,
    atualizarFiltros(mudancas) {
      const novos = { ...this.filtros, pagina: 1, ...mudancas };
      const consulta = {};

      if (novos.busca) consulta.busca = novos.busca;
      if (novos.status) consulta.status = novos.status;
      if (novos.pagina > 1) consulta.pagina = novos.pagina;

      this.$router.push({ name: 'admin-tarefas', query: consulta });
    },
    async carregar() {
      this.carregando = true;
      try {
        const resposta = await api.get(`/api/admin/tarefas${montarQuery(this.filtros)}`);
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
    abrirNova() {
      this.tarefaEmEdicao = null;
      this.erroServidor = '';
      this.modalAberto = true;
    },
    abrirEdicao(tarefa) {
      this.tarefaEmEdicao = tarefa;
      this.erroServidor = '';
      this.modalAberto = true;
    },
    async salvar(dados) {
      this.enviando = true;
      this.erroServidor = '';
      try {
        if (this.tarefaEmEdicao) {
          await api.put(`/api/admin/tarefas/${this.tarefaEmEdicao.id}`, dados);
          avisar('Tarefa atualizada.');
        } else {
          await api.post('/api/admin/tarefas', dados);
          avisar('Tarefa criada com sucesso.');
        }
        this.modalAberto = false;
        await this.carregar();
      } catch (erro) {
        this.erroServidor = erro.message;
      } finally {
        this.enviando = false;
      }
    },
    async excluir(tarefa) {
      const confirmado = await confirmar({
        titulo: 'Excluir tarefa',
        mensagem: `Deseja excluir a tarefa "${tarefa.titulo}"? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir'
      });
      if (!confirmado) {
        return;
      }
      try {
        await api.delete(`/api/admin/tarefas/${tarefa.id}`);
        avisar('Tarefa excluída.');
        await this.carregar();
      } catch (erro) {
        avisar(erro.message, 'erro');
      }
    }
  },
  template: `
    <div>
      <div class="secao-topo">
        <h1>Tarefas</h1>
        <button type="button" class="btn btn-primario" @click="abrirNova">Nova tarefa</button>
      </div>

      <div class="barra-ferramentas">
        <input type="search" v-model="busca" placeholder="Buscar por título ou descrição" aria-label="Buscar" @input="buscarComAtraso">
        <select :value="filtros.status" aria-label="Filtrar por status" @change="atualizarFiltros({ status: $event.target.value })">
          <option value="">Todos os status</option>
          <option v-for="opcao in opcoesStatus" :key="opcao.valor" :value="opcao.valor">{{ opcao.rotulo }}</option>
        </select>
      </div>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>
      <p v-if="carregando" class="carregando">Carregando tarefas...</p>
      <div v-else-if="!erro && itens.length === 0" class="vazio">
        <h3>Nenhuma tarefa encontrada</h3>
        <p>Ajuste a busca ou cadastre uma nova tarefa.</p>
      </div>

      <div v-else-if="itens.length > 0" class="tabela-envoltorio">
        <table class="tabela">
          <thead>
            <tr>
              <th>Código</th>
              <th>Título</th>
              <th>Responsável</th>
              <th>Status</th>
              <th>Prioridade</th>
              <th>Prazo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tarefa in itens" :key="tarefa.id">
              <td>{{ tarefa.id }}</td>
              <td class="coluna-titulo" :title="tarefa.titulo">{{ tarefa.titulo }}</td>
              <td>{{ tarefa.dono ? (tarefa.dono.nome || tarefa.dono.email) : 'Sem responsável' }}</td>
              <td><app-etiqueta tipo="status" :valor="tarefa.status" /></td>
              <td><app-etiqueta tipo="prioridade" :valor="tarefa.prioridade" /></td>
              <td :class="{ 'texto-perigo': tarefa.atrasada }">{{ tarefa.prazo ? formatarData(tarefa.prazo) : 'Sem prazo' }}</td>
              <td class="acoes">
                <button type="button" class="btn btn-secundario btn-pequeno" @click="abrirEdicao(tarefa)">Editar</button>
                <button type="button" class="btn btn-perigo btn-pequeno" @click="excluir(tarefa)">Excluir</button>
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

      <app-modal :aberto="modalAberto" :titulo="tarefaEmEdicao ? 'Editar tarefa' : 'Nova tarefa'" @fechar="modalAberto = false">
        <formulario-tarefa
          :tarefa="tarefaEmEdicao"
          :usuarios="usuarios"
          mostrar-responsavel
          :enviando="enviando"
          :erro-servidor="erroServidor"
          @salvar="salvar"
          @cancelar="modalAberto = false"
        />
      </app-modal>
    </div>
  `
};
