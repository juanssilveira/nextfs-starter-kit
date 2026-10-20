# 03-DATABASE.MD - GUIA DE ARQUITETURA E EVOLUÇÃO DO BANCO DE DADOS

Este documento define os padrões arquiteturais, convenções de código e o fluxo de trabalho obrigatório para criação e evolução de tabelas e schemas do banco de dados no projeto.

---

## 1. Estrutura de Diretórios

Toda a camada de persistência reside em `src/db`:

```
src/db/
├── index.ts                # O ÚNICO index: instancia 'db', agrega schemas e exporta tudo
└── schema/                 # Schemas modularizados por domínio de negócio (sem index aninhado)
    └── auth.ts             # Tabelas do Better Auth (user, session, account, verification)
```

* **`src/db/index.ts`**: Ponto único de entrada da camada de dados. Inicializa o pool de conexão do PostgreSQL via `postgres` driver e o cliente Drizzle (`db`). Agrega todos os domínios no objeto `schema` e re-exporta todas as tabelas e tipos para a aplicação.
* **`src/db/schema/`**: Contém exclusivamente arquivos de domínio com nomes semânticos (ex: `auth.ts`, `billing.ts`, `products.ts`). Não há `index.ts` aninhado aqui.
* **`drizzle.config.ts`**: Configurado com `schema: "./src/db/schema/*"` para ler todos os schemas da pasta automaticamente.

---

## 2. Convenções de Nomenclatura

| Elemento | Convenção | Exemplo |
| :--- | :--- | :--- |
| **Nome do arquivo de schema** | `kebab-case` ou `snake_case` | `src/db/schema/user-profiles.ts` |
| **Nome da tabela no banco (Postgres)** | `snake_case` (singular ou plural consistente) | `user`, `order_items` |
| **Nome da constante da tabela (TS)** | `camelCase` | `export const orderItems = pgTable(...)` |
| **Tipos TypeScript inferidos** | `PascalCase` | `type OrderItem`, `type NewOrderItem` |
| **Chaves estrangeiras e relações** | `camelCase` (TS) / `snake_case` (DB) | `userId` / `user_id` |

---

## 3. Padrão Canônico de um Schema

Ao criar um novo arquivo em `src/db/schema/<dominio>.ts`, siga esta estrutura:

```ts
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// 1. Definição da Tabela
export const posts = pgTable("posts", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  authorId: text("author_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

// 2. Definição de Relações (Drizzle Relations API)
export const postsRelations = relations(posts, ({ one }) => ({
  author: one(user, {
    fields: [posts.authorId],
    references: [user.id],
  }),
}));

// 3. Inferência de Tipos Obrigatória
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
```

### Regras de Modelagem:
1. **Campos Temporais**: Sempre incluir `createdAt` com `.defaultNow().notNull()` e `updatedAt` com `.defaultNow().$onUpdate(() => new Date()).notNull()`.
2. **Chave Primária**: Preferir `uuid("id").defaultRandom().primaryKey()` para novas tabelas de negócio (ou `text("id").primaryKey()` quando gerado externamente, como no Better Auth).
3. **Tipos Exportados**: Todo schema **deve** exportar os tipos de seleção (`$inferSelect`) e inserção (`$inferInsert`).

---

## 4. Checklist para Criação / Evolução de Tabelas

Ao adicionar ou modificar tabelas, execute obrigatoriamente estes passos na ordem:

1. **Criar ou alterar o arquivo de schema**:
   Adicione o modelo em `src/db/schema/<dominio>.ts`.

2. **Registrar no `src/db/index.ts`**:
   Abra `src/db/index.ts`, importe o domínio e adicione ao objeto `schema` e ao re-export:
   ```ts
   import * as posts from "./schema/posts";

   export const schema = {
     ...auth,
     ...posts,
   };

   export * from "./schema/posts";
   ```

3. **Gerar a migração SQL**:
   ```bash
   pnpm db:generate
   ```
   *Um novo arquivo SQL será gerado na pasta `drizzle/`.*

4. **Aplicar a migração no banco de dados**:
   ```bash
   pnpm db:migrate
   ```

5. **Validar tipos e build**:
   ```bash
   pnpm lint
   pnpm build
   ```

---

## 5. Como Consumir o Banco na Aplicação

Siga sempre a regra canônica de imports com o alias `@/`:

```ts
// Exemplo em Server Action, Route Handler ou Server Component:
import { db, posts, type NewPost } from "@/db";
import { eq } from "drizzle-orm";

export async function getPostsByAuthor(authorId: string) {
  return await db.query.posts.findMany({
    where: eq(posts.authorId, authorId),
    with: {
      author: true,
    },
  });
}
```

* **Nunca** importe diretamente de `src/db/schema/*` fora do diretório `src/db`. O ponto único de importação da aplicação é `@/db`.
* **Nunca** recrie conexões manuais com `postgres()`. Use a instância `db` exportada de `@/db`.

---

## 6. Comandos Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `pnpm db:generate` | Compara os schemas em `src/db/schema/index.ts` com o histórico e gera novo arquivo `.sql` em `drizzle/`. |
| `pnpm db:migrate` | Executa no banco PostgreSQL as migrações pendentes em `drizzle/`. |
| `pnpm db:push` | Sincroniza o schema diretamente no banco sem criar arquivo de migração (usar apenas em prototipação). |
| `pnpm db:studio` | Abre o painel visual do Drizzle Studio no navegador para inspecionar registros e tabelas. |
