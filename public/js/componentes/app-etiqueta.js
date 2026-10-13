const AppEtiqueta = {
  props: {
    tipo: { type: String, required: true },
    valor: { type: String, required: true }
  },
  computed: {
    rotulo() {
      return (ROTULOS[this.tipo] && ROTULOS[this.tipo][this.valor]) || this.valor;
    }
  },
  template: `<span class="etiqueta" :class="'etiqueta-' + tipo + '-' + valor">{{ rotulo }}</span>`
};
