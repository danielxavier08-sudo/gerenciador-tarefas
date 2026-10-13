const CartaoTarefa = {
  props: {
    tarefa: { type: Object, required: true },
    compacto: Boolean
  },
  emits: ['alternar', 'editar', 'excluir'],
  computed: {
    textoAlternar() {
      return this.tarefa.status === 'concluida' ? 'Reabrir' : 'Concluir';
    }
  },
  methods: {
    formatarData
  },
  template: `
    <article class="cartao-tarefa" :class="['prioridade-' + tarefa.prioridade, { concluida: tarefa.status === 'concluida' }]">
      <div class="cartao-principal">
        <div class="cartao-cabecalho">
          <router-link class="cartao-titulo" :to="{ name: 'tarefa', params: { id: tarefa.id } }">{{ tarefa.titulo }}</router-link>
          <div class="etiquetas">
            <app-etiqueta tipo="status" :valor="tarefa.status" />
            <app-etiqueta tipo="prioridade" :valor="tarefa.prioridade" />
            <span v-if="tarefa.publica" class="etiqueta etiqueta-publica">Pública</span>
          </div>
        </div>
        <slot>
          <p v-if="tarefa.descricao" class="cartao-descricao">{{ tarefa.descricao }}</p>
        </slot>
        <p class="cartao-meta">
          <span v-if="tarefa.prazo" :class="{ 'texto-perigo': tarefa.atrasada }">
            Prazo: {{ formatarData(tarefa.prazo) }}<template v-if="tarefa.atrasada"> (atrasada)</template>
          </span>
          <span v-else>Sem prazo definido</span>
        </p>
      </div>
      <div v-if="!compacto" class="cartao-acoes">
        <button type="button" class="btn btn-primario btn-pequeno" @click="$emit('alternar', tarefa)">{{ textoAlternar }}</button>
        <button type="button" class="btn btn-secundario btn-pequeno" @click="$emit('editar', tarefa)">Editar</button>
        <button type="button" class="btn btn-perigo btn-pequeno" @click="$emit('excluir', tarefa)">Excluir</button>
      </div>
    </article>
  `
};
