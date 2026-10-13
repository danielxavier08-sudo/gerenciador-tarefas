const PaginaTarefaDetalhe = {
  props: {
    id: { type: String, required: true }
  },
  data() {
    return {
      tarefa: null,
      carregando: true,
      erro: '',
      modalAberto: false,
      enviando: false,
      erroServidor: '',
      opcoesStatus: OPCOES_STATUS
    };
  },
  watch: {
    id() {
      this.carregar();
    }
  },
  mounted() {
    this.carregar();
  },
  methods: {
    formatarData,
    async carregar() {
      this.carregando = true;
      try {
        this.tarefa = await api.get(`/api/tarefas/${this.id}`);
        this.erro = '';
      } catch (erro) {
        this.tarefa = null;
        this.erro = erro.message;
      } finally {
        this.carregando = false;
      }
    },
    async mudarStatus(status) {
      if (status === this.tarefa.status) {
        return;
      }
      try {
        this.tarefa = await api.patch(`/api/tarefas/${this.id}/status`, { status });
        avisar('Status atualizado.');
      } catch (erro) {
        avisar(erro.message, 'erro');
      }
    },
    async salvar(dados) {
      this.enviando = true;
      this.erroServidor = '';
      try {
        this.tarefa = await api.put(`/api/tarefas/${this.id}`, dados);
        this.modalAberto = false;
        avisar('Tarefa atualizada.');
      } catch (erro) {
        this.erroServidor = erro.message;
      } finally {
        this.enviando = false;
      }
    },
    async excluir() {
      const confirmado = await confirmar({
        titulo: 'Excluir tarefa',
        mensagem: `Deseja excluir a tarefa "${this.tarefa.titulo}"? Esta ação não pode ser desfeita.`,
        textoConfirmar: 'Excluir'
      });
      if (!confirmado) {
        return;
      }
      try {
        await api.delete(`/api/tarefas/${this.id}`);
        avisar('Tarefa excluída.');
        this.$router.push({ name: 'tarefas' });
      } catch (erro) {
        avisar(erro.message, 'erro');
      }
    }
  },
  template: `
    <section>
      <p><router-link :to="{ name: 'tarefas' }">Voltar para as tarefas</router-link></p>

      <p v-if="carregando" class="carregando">Carregando tarefa...</p>
      <div v-else-if="erro" class="alerta alerta-erro">{{ erro }}</div>

      <article v-else-if="tarefa" class="painel detalhe">
        <div class="etiquetas">
          <app-etiqueta tipo="status" :valor="tarefa.status" />
          <app-etiqueta tipo="prioridade" :valor="tarefa.prioridade" />
          <span v-if="tarefa.atrasada" class="etiqueta etiqueta-atrasada">Atrasada</span>
          <span v-if="tarefa.publica" class="etiqueta etiqueta-publica">Pública</span>
        </div>

        <h1>{{ tarefa.titulo }}</h1>
        <p v-if="tarefa.descricao" class="detalhe-descricao">{{ tarefa.descricao }}</p>
        <p v-else class="texto-suave">Esta tarefa não possui descrição.</p>

        <dl class="lista-dados">
          <div>
            <dt>Prazo</dt>
            <dd>{{ tarefa.prazo ? formatarData(tarefa.prazo) : 'Sem prazo' }}</dd>
          </div>
          <div>
            <dt>Criada em</dt>
            <dd>{{ tarefa.criadoEm ? formatarData(tarefa.criadoEm) : 'Não informado' }}</dd>
          </div>
          <div v-if="tarefa.dono">
            <dt>Responsável</dt>
            <dd>{{ tarefa.dono.nome || tarefa.dono.email }}</dd>
          </div>
        </dl>

        <div class="detalhe-acoes">
          <div class="grupo-status" role="group" aria-label="Alterar status">
            <button
              v-for="opcao in opcoesStatus"
              :key="opcao.valor"
              type="button"
              :class="{ ativo: tarefa.status === opcao.valor }"
              @click="mudarStatus(opcao.valor)"
            >
              {{ opcao.rotulo }}
            </button>
          </div>
          <button type="button" class="btn btn-secundario" @click="modalAberto = true">Editar</button>
          <button type="button" class="btn btn-perigo" @click="excluir">Excluir</button>
          <a v-if="tarefa.publica" class="btn btn-fantasma" :href="'/tarefas/' + tarefa.id">Ver página pública</a>
        </div>
      </article>

      <app-modal :aberto="modalAberto" titulo="Editar tarefa" @fechar="modalAberto = false">
        <formulario-tarefa
          :tarefa="tarefa"
          :enviando="enviando"
          :erro-servidor="erroServidor"
          @salvar="salvar"
          @cancelar="modalAberto = false"
        />
      </app-modal>
    </section>
  `
};
