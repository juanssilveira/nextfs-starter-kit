# Lições Aprendidas & Armadilhas de Runtime

> Este documento é mantido continuamente por desenvolvedores e agentes.  
> **Regra:** Sempre que um bug não trivial, armadilha de runtime ou comportamento inesperado for superado, registre aqui para prevenir reincidência.

---

## 1. Autenticação & Next.js Server Components
* **Isolamento de Bundling em Client Components:** Nunca importe `@/modules/auth` (servidor) dentro de arquivos marcados com `"use client"`. O Better Auth com adapter Drizzle importa dependências de banco (`pg`, `crypto`, etc.) que causam erro em runtime no navegador. Em Client Components, importe estritamente de `@/modules/auth/client`.
* **API Route Catch-all:** A rota de autenticação deve permanecer como Thin Route em `src/app/api/auth/[...all]/route.ts`, apenas delegando `toNextJsHandler(auth.handler)`.

---

## 2. Drizzle ORM & PostgreSQL
* **Exportação Obrigatória de Tipos:** Todo schema de tabela deve exportar `$inferSelect` e `$inferInsert` para garantir tipagem uniforme e evitar discrepâncias em mutations e queries.
* **Migrações Modulares:** Toda nova modelagem requer `pnpm db:generate` seguido de `pnpm db:migrate`. Schemas devem ser agregados em `src/db/index.ts`.

---

## 3. Variáveis de Ambiente & Boot
* **Zod Env:** Variáveis devem ser validadas no schema Zod em `src/shared/env/index.ts`. Acesso direto via `process.env` em código de aplicação é terminantemente proibido.
