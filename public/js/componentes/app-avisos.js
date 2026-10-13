const AppAvisos = {
  data() {
    return { avisos };
  },
  methods: {
    fechar(id) {
      removerAviso(id);
    }
  },
  template: `
    <transition-group name="aviso" tag="div" class="avisos" aria-live="polite">
      <div
        v-for="aviso in avisos.itens"
        :key="aviso.id"
        class="aviso"
        :class="{ 'aviso-erro': aviso.tipo === 'erro' }"
        @click="fechar(aviso.id)"
      >
        {{ aviso.mensagem }}
      </div>
    </transition-group>
  `
};
