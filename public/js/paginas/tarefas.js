const PaginaTarefas = {
  data() {
    return {
      itens: [],
      pagina: 1,
      totalPaginas: 1,
      total: 0,
      carregando: true,
      erro: '',
      busca: this.$route.query.busca || '',
      modalAberto: false,
      tarefaEmEdicao: null,
      enviando: false,
      erroServidor: '',
      opcoesStatus: OPCOES_STATUS,
      opcoesPrioridade: OPCOES_PRIORIDADE
    };
  },
  computed: {
    filtros() {
      const consulta = this.$route.query;
      return {
        busca: consulta.busca || '',
        status: consulta.status || '',
        prioridade: consulta.prioridade || '',
        ordem: consulta.ordem || 'recentes',
        pagina: Number(consulta.pagina) || 1
      };
    },
    temFiltro() {
      return Boolean(this.filtros.busca || this.filtros.status || this.filtros.prioridade);
    }
  },
  watch: {
    '$route.query'() {
      if (this.$route.name === 'tarefas') {
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
    atualizarFiltros(mudancas) {
      const novos = { ...this.filtros, pagina: 1, ...mudancas };
      const consulta = {};

      if (novos.busca) consulta.busca = novos.busca;
      if (novos.status) consulta.status = novos.status;
      if (novos.prioridade) consulta.prioridade = novos.prioridade;
      if (novos.ordem !== 'recentes') consulta.ordem = novos.ordem;
      if (novos.pagina > 1) consulta.pagina = novos.pagina;

      this.$router.push({ name: 'tarefas', query: consulta });
    },
    limparFiltros() {
      this.busca = '';
      this.$router.push({ name: 'tarefas' });
    },
    async carregar(silencioso = false) {
      if (!silencioso) {
        this.carregando = true;
      }
      try {
        const resposta = await api.get(`/api/tarefas${montarQuery(this.filtros)}`);
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
          await api.put(`/api/tarefas/${this.tarefaEmEdicao.id}`, dados);
          avisar('Tarefa atualizada.');
        } else {
          await api.post('/api/tarefas', dados);
          avisar('Tarefa criada com sucesso.');
        }
        this.modalAberto = false;
        await this.carregar(true);
      } catch (erro) {
        this.erroServidor = erro.message;
      } finally {
        this.enviando = false;
      }
    },
    async alternar(tarefa) {
      const status = tarefa.status === 'concluida' ? 'pendente' : 'concluida';
      try {
        await api.patch(`/api/tarefas/${tarefa.id}/status`, { status });
        avisar(status === 'concluida' ? 'Tarefa concluída.' : 'Tarefa reaberta.');
        await this.carregar(true);
      } catch (erro) {
        avisar(erro.message, 'erro');
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
        await api.delete(`/api/tarefas/${tarefa.id}`);
        avisar('Tarefa excluída.');
        await this.carregar(true);
      } catch (erro) {
        avisar(erro.message, 'erro');
      }
    }
  },
  template: `
    <section>
      <div class="secao-topo">
        <h1>Minhas tarefas</h1>
        <button type="button" class="btn btn-primario" @click="abrirNova">Nova tarefa</button>
      </div>

      <div class="barra-ferramentas">
        <input type="search" v-model="busca" placeholder="Buscar por título ou descrição" aria-label="Buscar" @input="buscarComAtraso">
        <select :value="filtros.status" aria-label="Filtrar por status" @change="atualizarFiltros({ status: $event.target.value })">
          <option value="">Todos os status</option>
          <option v-for="opcao in opcoesStatus" :key="opcao.valor" :value="opcao.valor">{{ opcao.rotulo }}</option>
        </select>
        <select :value="filtros.prioridade" aria-label="Filtrar por prioridade" @change="atualizarFiltros({ prioridade: $event.target.value })">
          <option value="">Todas as prioridades</option>
          <option v-for="opcao in opcoesPrioridade" :key="opcao.valor" :value="opcao.valor">{{ opcao.rotulo }}</option>
        </select>
        <select :value="filtros.ordem" aria-label="Ordenar" @change="atualizarFiltros({ ordem: $event.target.value })">
          <option value="recentes">Mais recentes</option>
          <option value="antigas">Mais antigas</option>
          <option value="prazo">Prazo mais próximo</option>
          <option value="prioridade">Maior prioridade</option>
        </select>
        <button v-if="temFiltro" type="button" class="btn btn-fantasma" @click="limparFiltros">Limpar filtros</button>
      </div>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>
      <p v-if="carregando" class="carregando">Carregando tarefas...</p>

      <div v-else-if="!erro && itens.length === 0" class="vazio">
        <h3>{{ temFiltro ? 'Nenhuma tarefa encontrada' : 'Você ainda não tem tarefas' }}</h3>
        <p>{{ temFiltro ? 'Ajuste os filtros para ver outros resultados.' : 'Crie a sua primeira tarefa para começar.' }}</p>
        <button v-if="!temFiltro" type="button" class="btn btn-primario" @click="abrirNova">Nova tarefa</button>
      </div>

      <transition-group v-else name="lista" tag="div">
        <cartao-tarefa
          v-for="tarefa in itens"
          :key="tarefa.id"
          :tarefa="tarefa"
          @alternar="alternar"
          @editar="abrirEdicao"
          @excluir="excluir"
        />
      </transition-group>

      <app-paginacao
        :pagina="pagina"
        :total-paginas="totalPaginas"
        :total="total"
        @mudar="(numero) => atualizarFiltros({ pagina: numero })"
      />

      <app-modal :aberto="modalAberto" :titulo="tarefaEmEdicao ? 'Editar tarefa' : 'Nova tarefa'" @fechar="modalAberto = false">
        <formulario-tarefa
          :tarefa="tarefaEmEdicao"
          :enviando="enviando"
          :erro-servidor="erroServidor"
          @salvar="salvar"
          @cancelar="modalAberto = false"
        />
      </app-modal>
    </section>
  `
};
