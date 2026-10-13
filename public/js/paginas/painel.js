const PaginaPainel = {
  data() {
    return {
      resumo: null,
      carregando: true,
      erro: '',
      modalAberto: false,
      enviando: false,
      erroServidor: ''
    };
  },
  computed: {
    nome() {
      return estado.usuario.nome || estado.usuario.email;
    },
    percentualConcluido() {
      if (!this.resumo || this.resumo.total === 0) {
        return 0;
      }
      return Math.round((this.resumo.concluidas / this.resumo.total) * 100);
    }
  },
  mounted() {
    this.carregar();
  },
  methods: {
    async carregar() {
      try {
        this.resumo = await api.get('/api/tarefas/resumo');
        this.erro = '';
      } catch (erro) {
        this.erro = erro.message;
      } finally {
        this.carregando = false;
      }
    },
    abrirModal() {
      this.erroServidor = '';
      this.modalAberto = true;
    },
    async criar(dados) {
      this.enviando = true;
      this.erroServidor = '';
      try {
        await api.post('/api/tarefas', dados);
        this.modalAberto = false;
        avisar('Tarefa criada com sucesso.');
        await this.carregar();
      } catch (erro) {
        this.erroServidor = erro.message;
      } finally {
        this.enviando = false;
      }
    }
  },
  template: `
    <section>
      <div class="secao-topo">
        <div>
          <h1>Olá, {{ nome }}</h1>
          <p class="texto-suave" style="margin: 0">Veja como estão as suas tarefas hoje.</p>
        </div>
        <button type="button" class="btn btn-primario" @click="abrirModal">Nova tarefa</button>
      </div>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>
      <p v-if="carregando" class="carregando">Carregando painel...</p>

      <template v-else-if="resumo">
        <div class="grade-metricas">
          <cartao-metrica rotulo="Total de tarefas" :valor="resumo.total" />
          <cartao-metrica rotulo="Pendentes" :valor="resumo.pendentes" tom="aviso" />
          <cartao-metrica rotulo="Em andamento" :valor="resumo.andamento" tom="azul" />
          <cartao-metrica rotulo="Concluídas" :valor="resumo.concluidas">
            <span class="campo-ajuda">{{ percentualConcluido }}% do total</span>
          </cartao-metrica>
          <cartao-metrica rotulo="Atrasadas" :valor="resumo.atrasadas" tom="perigo" />
        </div>

        <div class="secao-topo">
          <h2>Próximos prazos</h2>
          <router-link :to="{ name: 'tarefas' }">Ver todas as tarefas</router-link>
        </div>

        <div v-if="resumo.proximas.length === 0" class="vazio">
          <h3>Nenhuma tarefa com prazo em aberto</h3>
          <p>Crie uma tarefa com prazo para acompanhá-la por aqui.</p>
        </div>
        <transition-group v-else name="lista" tag="div">
          <cartao-tarefa v-for="tarefa in resumo.proximas" :key="tarefa.id" :tarefa="tarefa" compacto />
        </transition-group>
      </template>

      <app-modal :aberto="modalAberto" titulo="Nova tarefa" @fechar="modalAberto = false">
        <formulario-tarefa
          :enviando="enviando"
          :erro-servidor="erroServidor"
          @salvar="criar"
          @cancelar="modalAberto = false"
        />
      </app-modal>
    </section>
  `
};
