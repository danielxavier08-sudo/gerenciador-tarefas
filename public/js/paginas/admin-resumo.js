const PaginaAdminResumo = {
  data() {
    return {
      resumo: null,
      carregando: true,
      erro: ''
    };
  },
  computed: {
    barras() {
      if (!this.resumo) {
        return [];
      }
      const total = Math.max(this.resumo.tarefas, 1);
      return OPCOES_STATUS.map((opcao) => {
        const quantidade = this.resumo.tarefasPorStatus[opcao.valor] || 0;
        return {
          chave: opcao.valor,
          rotulo: opcao.rotulo,
          quantidade,
          largura: Math.round((quantidade / total) * 100)
        };
      });
    }
  },
  async mounted() {
    try {
      this.resumo = await api.get('/api/admin/resumo');
    } catch (erro) {
      this.erro = erro.message;
    } finally {
      this.carregando = false;
    }
  },
  template: `
    <div>
      <div class="secao-topo">
        <h1>Resumo do sistema</h1>
      </div>

      <div v-if="erro" class="alerta alerta-erro">{{ erro }}</div>
      <p v-if="carregando" class="carregando">Carregando resumo...</p>

      <template v-else-if="resumo">
        <div class="grade-metricas">
          <cartao-metrica rotulo="Usuários" :valor="resumo.usuarios" />
          <cartao-metrica rotulo="Administradores" :valor="resumo.administradores" tom="azul" />
          <cartao-metrica rotulo="Tarefas" :valor="resumo.tarefas" />
          <cartao-metrica rotulo="Tarefas públicas" :valor="resumo.publicas" tom="aviso" />
        </div>

        <section class="painel">
          <h2>Tarefas por status</h2>
          <div v-for="barra in barras" :key="barra.chave" class="barra-status">
            <span>{{ barra.rotulo }}</span>
            <div class="barra-trilho">
              <div class="barra-preenchimento" :class="barra.chave" :style="{ width: barra.largura + '%' }"></div>
            </div>
            <strong>{{ barra.quantidade }}</strong>
          </div>
        </section>
      </template>
    </div>
  `
};
