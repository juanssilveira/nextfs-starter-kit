# Plan: <Nome da Feature>

> **Feature:** `<NNN-slug-da-feature>`  
> **Status:** Em Revisão | Aprovado  
> **Data:** YYYY-MM-DD  
> **Módulos Afetados:** `src/modules/<modulo>`  
> **Branch:** `development`  

---

## 1. Problema & Contexto
*Descreva em 1-2 parágrafos o problema real, quem sofre com ele hoje e qual o objetivo concreto desta entrega.*

---

## 2. Jornada & Fluxo da Rota Crítica (`Flow`)
*Uma linha por etapa da jornada de ponta a ponta.*
1. Usuário acessa `<rota>` e visualiza `<estado-inicial>`.
2. Usuário submete `<ação>` com os dados `<input>`.
3. Server Action ou Service `<actionName>` valida sessão de autenticação e payload com schema Zod.
4. Mutação é persistida no PostgreSQL via Drizzle ORM e dispara revalidação de rota (`revalidatePath`).
5. UI reflete a alteração com feedback visual (Toast, atualização de estado ou redirecionamento).

---

## 3. Impacto no Sistema & Dados Existentes (`Impact`)
* **Termos & Domínio:** Novos conceitos introduzidos ou termos alterados no modelo mental do sistema.
* **Migração de Dados:** Necessita migração no banco de dados (`pnpm db:generate` / `pnpm db:migrate`)?
* **Client Cache:** Quais rotas devem ser invalidadas com `revalidatePath`?
* **Variáveis de Ambiente:** Necessita novas chaves validadas em `src/shared/env/index.ts`?

---

## 4. Entidades & Banco de Dados (`Relations`)
*Tabelas Drizzle em `src/db/schema/<dominio>.ts` (omitir se a feature não alterar banco).*

```typescript
export const minhaTabela = pgTable("minha_tabela", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  // ... campos do domínio
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  index("minha_tabela_user_id_idx").on(table.userId),
]);

export type MinhaTabela = typeof minhaTabela.$inferSelect;
export type NewMinhaTabela = typeof minhaTabela.$inferInsert;
```

---

## 5. Superfície de Interface & Contratos (`Surface`)
* **Public API (`src/modules/<modulo>/index.ts`):** Componentes, Server Actions, Services e tipos exportados para o restante do app.
* **Server Actions / Services (`src/modules/<modulo>/server/`):**
  * `<actionName>(rawInput: unknown)` com autenticação obrigatória e validação Zod.
* **Thin Route (`src/app/...`):** `page.tsx` apenas orquestrando parâmetros, metadados e delegando para o módulo.
* **Componentes UI (`src/modules/<modulo>/components/`):** Componentes coesos, menores que 250 linhas, utilizando primitivos de `@/shared/components`.

---

## 6. Decisões Irreversíveis (`Landing / One-Way Doors`)

| Decisão | Alternativa Rejeitada | Motivação & Trade-off |
| :--- | :--- | :--- |
| **[Ex.: Server Action em módulo]** | Endpoint REST em `/api/...` | Tipagem end-to-end direta, revalidação nativa e menor boilerplate. |
| **[Ex.: Validação via Zod no shared/env]** | Leitura de `process.env` direta | Fail-fast em tempo de boot e garantia de tipagem estrita. |

---

## 7. Critérios de Aceite

* **CA-01:** Dado que o usuário logado submete o formulário com dados válidos, o registro é persistido e a tela atualizada com sucesso.
* **CA-02:** Dado que o usuário não está autenticado ou tenta acessar recurso de outro usuário, a operação deve ser rejeitada com erro apropriado.
* **CA-03:** Dado payload com dados inválidos, o schema Zod deve falhar e retornar erro de validação claro.
