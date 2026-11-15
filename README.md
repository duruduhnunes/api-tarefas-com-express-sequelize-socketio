# API de Tarefas

API REST de tarefas em **TypeScript** com **Express**, **Sequelize** e **Socket.IO**, testada com **Mocha**, **Chai** e **Supertest**.

Projeto de estudo para aprender essas ferramentas, comparando com o que uso no dia a dia (NestJS, TypeORM, Vitest/Jest).

## Tecnologias

- **Express 5**: servidor HTTP, rotas e middlewares (log, 404 e tratamento de erros)
- **Sequelize 6 + SQLite**: modelo `Tarefa`, validação e filtros com `where`
- **Socket.IO**: notifica os clientes conectados quando uma tarefa é criada, atualizada ou removida
- **Mocha + Chai + Supertest**: testes das rotas com banco SQLite em memória

## Requisitos

- Node.js 22+

## Como rodar

```bash
npm install
npm run dev
```

A API sobe em `http://localhost:3000`. Abra essa URL no navegador para ver a página que lista as tarefas em tempo real.

## Scripts

| Script              | O que faz                                          |
| ------------------- | -------------------------------------------------- |
| `npm run dev`       | Sobe o servidor com recarga automática (tsx watch) |
| `npm run build`     | Compila para `dist/`                               |
| `npm start`         | Roda a versão compilada                            |
| `npm test`          | Roda os testes (SQLite em memória)                 |
| `npm run typecheck` | Checa os tipos com o `tsc`                         |
| `npm run cliente`   | Cliente Socket.IO de teste no terminal             |

> Os scripts usam variáveis de ambiente no estilo Linux/macOS (`NODE_ENV=test ...`). No Windows, use o `cross-env`.

## Rotas

| Método | Rota           | Descrição                                                     |
| ------ | -------------- | ------------------------------------------------------------- |
| GET    | `/tarefas`     | Lista as tarefas. Filtros: `?concluida=true` e `?busca=texto` |
| GET    | `/tarefas/:id` | Busca uma tarefa (404 se não existir)                         |
| POST   | `/tarefas`     | Cria uma tarefa (`titulo` obrigatório)                        |
| PATCH  | `/tarefas/:id` | Atualiza só os campos enviados                                |
| DELETE | `/tarefas/:id` | Remove uma tarefa (204)                                       |

### Exemplos

```bash
curl -X POST http://localhost:3000/tarefas \
  -H "Content-Type: application/json" \
  -d '{"titulo":"Estudar Express","descricao":"rotas e middlewares"}'

curl "http://localhost:3000/tarefas?concluida=false"

curl -X PATCH http://localhost:3000/tarefas/1 \
  -H "Content-Type: application/json" \
  -d '{"concluida":true}'

curl -X DELETE http://localhost:3000/tarefas/1
```

## Eventos Socket.IO

| Evento              | Quando | Dados               |
| ------------------- | ------ | ------------------- |
| `tarefa:criada`     | POST   | a tarefa criada     |
| `tarefa:atualizada` | PATCH  | a tarefa atualizada |
| `tarefa:removida`   | DELETE | `{ id }`            |

## Estrutura

```
src/
  app.ts          # app Express: middlewares e rotas (sem listen)
  server.ts       # servidor HTTP + Socket.IO + conexão com o banco
  db.ts           # instância do Sequelize
  realtime.ts     # ponte entre as rotas e o Socket.IO
  models/tarefa.ts
public/index.html # página que atualiza em tempo real
scripts/          # cliente Socket.IO de teste
test/             # testes com Mocha, Chai e Supertest
```

O `app` é separado do `listen` para que o Supertest teste as rotas sem subir o servidor, e o Socket.IO fica opcional (nos testes, os eventos simplesmente não são emitidos).

## Próximos passos

- Trocar o `sync()` por migrations (`sequelize-cli`)
- Suporte a PostgreSQL via variáveis de ambiente
- Autenticação nos sockets e uso de rooms
- Adapter Redis para rodar várias instâncias
