const AppModal = {
  props: {
    aberto: Boolean,
    titulo: String,
    largura: { type: String, default: '560px' }
  },
  emits: ['fechar'],
  watch: {
    aberto(valor) {
      document.body.classList.toggle('sem-rolagem', valor);
    }
  },
  mounted() {
    this.aoTeclar = (evento) => {
      if (evento.key === 'Escape' && this.aberto) {
        this.$emit('fechar');
      }
    };
    document.addEventListener('keydown', this.aoTeclar);
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.aoTeclar);
    document.body.classList.remove('sem-rolagem');
  },
  template: `
    <transition name="modal">
      <div v-if="aberto" class="modal-fundo" @mousedown.self="$emit('fechar')">
        <div class="modal" role="dialog" aria-modal="true" :style="{ maxWidth: largura }">
          <header class="modal-topo">
            <h2>{{ titulo }}</h2>
            <button type="button" class="btn btn-fantasma btn-pequeno" @click="$emit('fechar')">Fechar</button>
          </header>
          <div class="modal-corpo">
            <slot></slot>
          </div>
          <footer v-if="$slots.rodape" class="modal-rodape">
            <slot name="rodape"></slot>
          </footer>
        </div>
      </div>
    </transition>
  `
};
