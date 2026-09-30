# Gerenciador de Tarefas (SPA)

Aplicacao de Pagina Unica (SPA) com Node.js, Express, Sequelize e MariaDB no servidor, e Vue 3 com Vue Router no navegador.

O servidor entrega uma unica pagina (public/index.html) e uma API JSON em /api. Quem troca as telas e o Vue Router, sem recarregar a pagina.

## Como rodar

1. Instalar Node.js e MariaDB.
2. Criar o banco `gerenciador_tarefas` no phpMyAdmin.
3. Rodar `npm install`.
4. Copiar `.env.example` para `.env` e colocar a senha do root do MariaDB.
5. Rodar `npm run seed` (cria as tabelas e os usuarios de teste).
6. Rodar `npm start`.
7. Acessar `http://localhost:3000`.

## Usuarios de teste

admin@teste.com / admin123 / perfil admin

usuario@teste.com / user123 / perfil usuario

## Rotas da aplicacao (Vue Router)

| Rota | Nome | Acesso |
| --- | --- | --- |
| `/` | Inicial | logado |
| `/tarefa/:id` | Detalhes | logado (dono da tarefa ou admin) |
| `/login` | Login | publico |
| `/admin` | Admin (redireciona para Objeto) | admin |
| `/admin/objeto` | Admin, Objeto (todas as tarefas) | admin |
| `/admin/usuarios` | Admin, Usuarios | admin |
| `/autor` | Autor | publico |

Qualquer outro endereco mostra a tela de pagina nao encontrada.

A protecao das rotas fica em `public/js/rotas.js` (funcao `beforeEach`): quem nao esta logado vai para `/login`, e quem nao e admin nao entra em `/admin`.

## API (Express)

| Metodo | Endereco | Acesso |
| --- | --- | --- |
| GET | `/api/sessao` | publico |
| POST | `/api/login` | publico |
| POST | `/api/logout` | publico |
| GET | `/api/tarefas` | logado |
| GET | `/api/tarefas/:id` | dono ou admin |
| POST | `/api/tarefas` | logado |
| POST | `/api/tarefas/:id/status` | dono ou admin |
| DELETE | `/api/tarefas/:id` | admin |
| GET | `/api/admin/tarefas` | admin |
| GET | `/api/admin/usuarios` | admin |
| POST | `/api/admin/usuarios` | admin |

Erros 400, 401, 403, 404 e 500 voltam em JSON, no formato `{ "erro": "mensagem" }`.

## Estrutura

```
server-express.js      servidor e API
middlewares/auth.js    protecao por login e por perfil
public/index.html      pagina unica com os modelos de tela
public/css/estilo.css  estilos
public/js/             estado, api, rotas e paginas do Vue
```
