const CartaoMetrica = {
  props: {
    rotulo: { type: String, required: true },
    valor: { type: [Number, String], required: true },
    tom: { type: String, default: '' }
  },
  template: `
    <div class="metrica" :class="tom ? 'metrica-' + tom : ''">
      <strong>{{ valor }}</strong>
      <span>{{ rotulo }}</span>
      <slot></slot>
    </div>
  `
};
