const FormularioTarefa = {
  props: {
    tarefa: { type: Object, default: null },
    usuarios: { type: Array, default: () => [] },
    mostrarResponsavel: Boolean,
    enviando: Boolean,
    erroServidor: { type: String, default: '' }
  },
  emits: ['salvar', 'cancelar'],
  data() {
    const atual = this.tarefa || {};
    return {
      erro: '',
      opcoesStatus: OPCOES_STATUS,
      opcoesPrioridade: OPCOES_PRIORIDADE,
      campos: {
        titulo: atual.titulo || '',
        descricao: atual.descricao || '',
        status: atual.status || 'pendente',
        prioridade: atual.prioridade || 'media',
        prazo: atual.prazo ? String(atual.prazo).slice(0, 10) : '',
        publica: Boolean(atual.publica),
        usuarioId: atual.usuarioId || (this.usuarios.length > 0 ? this.usuarios[0].id : '')
      }
    };
  },
  methods: {
    enviar() {
      const titulo = this.campos.titulo.trim();
      if (titulo.length < 3) {
        this.erro = 'Informe um título com pelo menos 3 caracteres.';
        return;
      }

      this.erro = '';
      const dados = { ...this.campos, titulo, prazo: this.campos.prazo || null };
      if (!this.mostrarResponsavel) {
        delete dados.usuarioId;
      }
      this.$emit('salvar', dados);
    }
  },
  template: `
    <form @submit.prevent="enviar" novalidate>
      <div v-if="erro || erroServidor" class="alerta alerta-erro">{{ erro || erroServidor }}</div>

      <div class="campo">
        <label for="tarefa-titulo">Título</label>
        <input id="tarefa-titulo" type="text" v-model="campos.titulo" maxlength="120" autocomplete="off">
      </div>

      <div class="campo">
        <label for="tarefa-descricao">Descrição</label>
        <textarea id="tarefa-descricao" v-model="campos.descricao" maxlength="2000"></textarea>
      </div>

      <div class="campo-linha">
        <div class="campo">
          <label for="tarefa-status">Status</label>
          <select id="tarefa-status" v-model="campos.status">
            <option v-for="opcao in opcoesStatus" :key="opcao.valor" :value="opcao.valor">{{ opcao.rotulo }}</option>
          </select>
        </div>
        <div class="campo">
          <label for="tarefa-prioridade">Prioridade</label>
          <select id="tarefa-prioridade" v-model="campos.prioridade">
            <option v-for="opcao in opcoesPrioridade" :key="opcao.valor" :value="opcao.valor">{{ opcao.rotulo }}</option>
          </select>
        </div>
      </div>

      <div class="campo-linha">
        <div class="campo">
          <label for="tarefa-prazo">Prazo</label>
          <input id="tarefa-prazo" type="date" v-model="campos.prazo">
        </div>
        <div v-if="mostrarResponsavel" class="campo">
          <label for="tarefa-responsavel">Responsável</label>
          <select id="tarefa-responsavel" v-model="campos.usuarioId">
            <option v-for="usuario in usuarios" :key="usuario.id" :value="usuario.id">{{ usuario.nome || usuario.email }}</option>
          </select>
        </div>
      </div>

      <label class="campo-marcar">
        <input type="checkbox" v-model="campos.publica">
        <span>
          Mostrar no mural público
          <span class="campo-ajuda">Qualquer visitante poderá ver o título, a descrição, o status e o prazo.</span>
        </span>
      </label>

      <div class="formulario-acoes">
        <button type="button" class="btn btn-secundario" @click="$emit('cancelar')">Cancelar</button>
        <button type="submit" class="btn btn-primario" :disabled="enviando">{{ tarefa ? 'Salvar alterações' : 'Criar tarefa' }}</button>
      </div>
    </form>
  `
};
