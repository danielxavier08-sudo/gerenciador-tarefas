const AppPaginacao = {
  props: {
    pagina: { type: Number, required: true },
    totalPaginas: { type: Number, required: true },
    total: { type: Number, default: 0 }
  },
  emits: ['mudar'],
  template: `
    <nav v-if="totalPaginas > 1" class="paginacao" aria-label="Paginação">
      <button type="button" class="btn btn-secundario btn-pequeno" :disabled="pagina <= 1" @click="$emit('mudar', pagina - 1)">Anterior</button>
      <span>Página {{ pagina }} de {{ totalPaginas }} ({{ total }} registros)</span>
      <button type="button" class="btn btn-secundario btn-pequeno" :disabled="pagina >= totalPaginas" @click="$emit('mudar', pagina + 1)">Próxima</button>
    </nav>
  `
};
