# Gerenciador de Tarefas

Sistema de tarefas com Node.js, Express, EJS, Sequelize e MariaDB, com login, controle de acesso por perfil e tratamento de erros.

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

## O que foi implementado

- Login por e-mail e senha, com senha guardada como hash (bcrypt).
- Sessao de usuario logado com express-session.
- Rotas de tarefas protegidas: sem login, o sistema redireciona pra /login.
- Excluir tarefa e restrito ao perfil admin. Usuario comum so mexe nas proprias tarefas.
- Tratamento de erro 400 (dados invalidos, ex: form sem titulo), 403 (acao sem permissao), 404 (rota ou tarefa nao encontrada) e 500 (erro inesperado, capturado no middleware final do Express).
