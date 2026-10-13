const rotas = [
  { path: '/', name: 'painel', component: PaginaPainel, meta: { titulo: 'Painel', requerLogin: true } },
  { path: '/tarefas', name: 'tarefas', component: PaginaTarefas, meta: { titulo: 'Minhas tarefas', requerLogin: true } },
  { path: '/tarefas/:id', name: 'tarefa', component: PaginaTarefaDetalhe, props: true, meta: { titulo: 'Tarefa', requerLogin: true } },
  { path: '/entrar', name: 'entrar', component: PaginaEntrar, meta: { titulo: 'Entrar' } },
  {
    path: '/admin',
    component: PaginaAdmin,
    meta: { requerLogin: true, requerAdmin: true },
    children: [
      { path: '', name: 'admin', component: PaginaAdminResumo, meta: { titulo: 'Administração' } },
      { path: 'tarefas', name: 'admin-tarefas', component: PaginaAdminTarefas, meta: { titulo: 'Administração de tarefas' } },
      { path: 'usuarios', name: 'admin-usuarios', component: PaginaAdminUsuarios, meta: { titulo: 'Administração de usuários' } }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'nao-encontrada', component: PaginaNaoEncontrada, meta: { titulo: 'Página não encontrada' } }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory('/app'),
  routes: rotas,
  scrollBehavior: () => ({ top: 0 })
});

router.beforeEach((destino) => {
  if (destino.meta.requerLogin && !estado.usuario) {
    return { name: 'entrar', query: { destino: destino.fullPath } };
  }
  if (destino.meta.requerAdmin && estado.usuario.perfil !== 'admin') {
    avisar('Esta área é restrita a administradores.', 'erro');
    return { name: 'painel' };
  }
  if (destino.name === 'entrar' && estado.usuario) {
    return { name: 'painel' };
  }
  return true;
});

router.afterEach((destino) => {
  document.title = `${destino.meta.titulo || 'Sistema'} | Gerenciador de Tarefas`;
});
