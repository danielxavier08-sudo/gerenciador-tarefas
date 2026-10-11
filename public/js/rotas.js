var rotas = [
  {
    path: '/',
    name: 'inicial',
    component: PaginaInicial,
    meta: { requerLogin: true }
  },
  {
    path: '/tarefa/:id',
    name: 'detalhes',
    component: PaginaDetalhes,
    props: true,
    meta: { requerLogin: true }
  },
  {
    path: '/login',
    name: 'login',
    component: PaginaLogin
  },
  {
    path: '/admin',
    component: PaginaAdmin,
    meta: { requerLogin: true, requerAdmin: true },
    children: [
      {
        path: '',
        name: 'admin-inicial',
        component: PaginaAdminInicial
      },
      {
        path: 'objeto',
        name: 'admin-objeto',
        component: PaginaAdminObjeto
      },
      {
        path: 'usuarios',
        name: 'admin-usuarios',
        component: PaginaAdminUsuarios
      }
    ]
  },
  {
    path: '/autor',
    name: 'autor',
    component: PaginaAutor
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'nao-encontrada',
    component: PaginaNaoEncontrada
  }
];

var router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes: rotas
});

// Guarda de navegacao: protege as rotas que exigem login e perfil admin
router.beforeEach(function (to) {
  var preparar = estado.carregado ? Promise.resolve() : carregarSessao();

  return preparar.then(function () {
    var exigeLogin = to.matched.some(function (r) { return r.meta.requerLogin; });
    var exigeAdmin = to.matched.some(function (r) { return r.meta.requerAdmin; });

    if (exigeLogin && !estado.usuario) {
      return { name: 'login', query: { destino: to.fullPath } };
    }

    if (exigeAdmin && estado.usuario.perfil !== 'admin') {
      return { name: 'inicial' };
    }

    if (to.name === 'login' && estado.usuario) {
      return { name: estado.usuario.perfil === 'admin' ? 'admin-inicial' : 'inicial' };
    }

    return true;
  });
});
