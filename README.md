# Gerenciador de Tarefas

Aplicação web completa para organizar tarefas com prioridades, prazos e compartilhamento público. Projeto da disciplina de Desenvolvimento Web III, curso Técnico em Informática para Internet, IFCE.

O sistema tem três partes:

- **Site público (SSR)**: páginas renderizadas no servidor com EJS (início, mural de tarefas públicas, detalhe da tarefa e autor).
- **API REST**: endpoints em JSON protegidos por JWT, com acesso ao banco via Sequelize.
- **Painel (SPA)**: aplicação de página única em Vue 3 e Vue Router, servida em `/app`.

## Tecnologias

Node.js, Express, EJS, Sequelize, MariaDB, bcrypt, JSON Web Token, Vue 3 e Vue Router.

## Como executar

1. Instale o Node.js e o MariaDB.
2. Crie o banco `gerenciador_tarefas`.
3. Instale as dependências: `npm install`.
4. Copie `.env.example` para `.env` e preencha a senha do banco e o `JWT_SECRET`.
5. Crie os dados iniciais: `npm run seed`.
6. Inicie o servidor: `npm start`.
7. Acesse `http://localhost:3000`.

As tabelas são criadas automaticamente na primeira execução. Colunas novas são adicionadas às tabelas existentes sem apagar dados.

### Usuários de teste

| E-mail | Senha | Perfil |
| --- | --- | --- |
| admin@teste.com | admin123 | Administrador |
| usuario@teste.com | user123 | Usuário |

Também é possível criar uma conta pela aba "Criar conta" na tela de entrada.

## Funcionalidades

- Cadastro, edição, exclusão e conclusão de tarefas.
- Prioridade (baixa, média, alta), status (pendente, em andamento, concluída) e prazo com indicação de atraso.
- Busca, filtros, ordenação e paginação na lista de tarefas, com os filtros guardados na URL.
- Painel com resumo e próximos prazos.
- Mural público: o usuário escolhe quais tarefas ficam visíveis para qualquer visitante.
- Área administrativa com resumo, gestão de tarefas e gestão de usuários.
- Autenticação por token JWT guardado na `sessionStorage`, com perfis de usuário e administrador.

## Páginas

| Endereço | Tipo | Descrição |
| --- | --- | --- |
| `/` | SSR | Página inicial com os números do mural e as últimas tarefas públicas |
| `/tarefas` | SSR ou JSON | Mural de tarefas públicas, com busca e paginação |
| `/tarefas/:id` | SSR ou JSON | Detalhe de uma tarefa pública |
| `/autor` | SSR ou JSON | Nome e lista de formações do autor |
| `/app` | SPA | Painel do usuário (exige login) |
| `/app/tarefas` | SPA | Minhas tarefas |
| `/app/tarefas/:id` | SPA | Detalhe e edição de uma tarefa |
| `/app/entrar` | SPA | Entrar ou criar conta |
| `/app/admin` | SPA | Administração (apenas administradores) |

As rotas marcadas como "SSR ou JSON" devolvem HTML para o navegador e JSON quando a requisição envia o cabeçalho `Accept: application/json`:

```bash
curl -H "Accept: application/json" http://localhost:3000/autor
curl -H "Accept: application/json" "http://localhost:3000/tarefas?pagina=1"
```

## API REST

Todas as rotas abaixo ficam sob `/api`. As protegidas exigem o cabeçalho `Authorization: Bearer <token>`.

| Método | Rota | Acesso | Descrição |
| --- | --- | --- | --- |
| POST | `/login` | público | Autentica e devolve o token |
| POST | `/registro` | público | Cria uma conta de usuário |
| GET | `/sessao` | logado | Dados do usuário do token |
| GET | `/tarefas` | logado | Lista paginada das próprias tarefas (`busca`, `status`, `prioridade`, `ordem`, `pagina`) |
| GET | `/tarefas/resumo` | logado | Contagens por status, atrasadas e próximos prazos |
| GET | `/tarefas/:id` | dono ou admin | Detalhe da tarefa |
| POST | `/tarefas` | logado | Cria uma tarefa |
| PUT | `/tarefas/:id` | dono ou admin | Edita a tarefa |
| PATCH | `/tarefas/:id/status` | dono ou admin | Altera o status |
| DELETE | `/tarefas/:id` | dono ou admin | Exclui a tarefa |
| GET | `/admin/resumo` | admin | Totais do sistema |
| GET, POST | `/admin/tarefas` | admin | Lista paginada e criação de tarefas |
| GET, PUT, DELETE | `/admin/tarefas/:id` | admin | Consulta, edição e exclusão |
| GET, POST | `/admin/usuarios` | admin | Lista paginada e criação de usuários |
| GET | `/admin/usuarios/opcoes` | admin | Lista simples para seletores |
| GET, PUT, DELETE | `/admin/usuarios/:id` | admin | Consulta, edição e exclusão |

Respostas de erro seguem o formato `{ "erro": "mensagem" }`. A resposta 401 indica falta de autenticação e a 403 indica falta de permissão.

## Requisitos do projeto final

| Requisito | Onde está |
| --- | --- |
| Endpoints GET, POST, PUT e DELETE | `routes/api/tarefas.js` e `routes/api/admin.js` |
| Conteúdo gerado dinamicamente (SSR) | `routes/web.js` e as views em `views/` |
| Template language | EJS: variáveis, condicionais, repetições e partials em `views/partials/` |
| Endpoints REST | `routes/api/` |
| Endpoint do autor | `GET /autor` em `routes/web.js`, dados em `config/autor.js` |
| Arquivos estáticos | `express.static` em `app.js`, pasta `public/` (CSS, JavaScript e imagens) |
| Acesso a banco com ORM | Sequelize em `models/` e nas rotas |
| Autenticação e autorização | `middlewares/auth.js` (JWT, perfis, `requireAdmin`) |
| Dados no DOM, condições e repetições | `{{ }}`, `v-if` e `v-for` nos templates de `public/js/` |
| Recuperar dados do DOM | `v-model` nos formulários |
| Tratamento de eventos | `@click`, `@submit.prevent`, `@input`, `@change` |
| Componentes: propriedades, slots e eventos | `public/js/componentes/` (`cartao-tarefa`, `app-modal`, `formulario-tarefa`, entre outros) |
| Rotas | `public/js/rotas.js` (Vue Router com guardas de acesso) |
| Requisições assíncronas | `public/js/api.js` (`fetch` com `async` e `await`) |

## Estrutura

```
app.js                 configuração do Express
server-express.js      inicialização do servidor
seed.js                usuários e tarefas de exemplo
config/                banco de dados, ajuste de colunas e dados do autor
models/                modelos Sequelize e associações
middlewares/           autenticação, autorização e tratamento de erros
routes/api/            API REST
routes/web.js          páginas SSR e entrega do painel
utils/                 validação, paginação e funções de apoio
views/                 templates EJS
public/css/            estilos
public/img/            logotipo e ícones
public/app/            página HTML do painel
public/js/             painel em Vue (núcleo, componentes, páginas e rotas)
```
