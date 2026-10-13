const AppConfirmacao = {
  data() {
    return { dialogo };
  },
  methods: {
    responder(valor) {
      const resolver = this.dialogo.resolver;
      this.dialogo.aberto = false;
      this.dialogo.resolver = null;
      if (resolver) {
        resolver(valor);
      }
    }
  },
  template: `
    <app-modal :aberto="dialogo.aberto" :titulo="dialogo.titulo" largura="440px" @fechar="responder(false)">
      <p>{{ dialogo.mensagem }}</p>
      <template #rodape>
        <button type="button" class="btn btn-secundario" @click="responder(false)">Cancelar</button>
        <button type="button" class="btn btn-perigo" @click="responder(true)">{{ dialogo.textoConfirmar }}</button>
      </template>
    </app-modal>
  `
};
