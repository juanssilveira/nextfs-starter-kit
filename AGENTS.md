<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Regras Canônicas do Projeto

### 1. Prioridade de Imports com Alias `@/`
- Imports utilizando o alias `@/` (apontando para `./src/*`) devem **SEMPRE ter prioridade de uso**.
- A única exceção é quando o arquivo importado for um irmão direto ou estiver no mesmo diretório imediato (ex: `./schema` dentro de `src/db/`).

### 2. Criação e Validação de Variáveis de Ambiente (`env`)
- Ao criar qualquer nova variável de ambiente (no `.env` ou `.env.example`), ela **DEVE** ser obrigatoriamente adicionada e devidamente validada no schema do Zod em `src/shared/env/index.ts`.
- **Nunca acesse variáveis diretamente via `process.env`** no código da aplicação; consuma sempre através do objeto tipado: `import { env } from "@/shared/env"`.

### 3. Modelagem e Evolução de Schemas do Banco (`src/db`)
- Novos schemas do banco de dados devem obrigatoriamente ser criados em arquivos modulares em `src/db/schema/<dominio>.ts` e agregados/re-exportados em `src/db/index.ts`.
- Todo schema deve exportar seus tipos inferidos (`$inferSelect` e `$inferInsert`).
- Toda adição ou alteração de schema requer a geração e aplicação das migrações (`pnpm db:generate` seguido de `pnpm db:migrate`).
- Consulte e siga as diretrizes completas de modelagem e relações em `.docs/03-DATABASE.md`.

### 4. Organização e Evolução da Pasta `src/shared`
- A pasta `src/shared` é exclusiva para código transversal e reutilizável por múltiplos domínios ou rotas.
- **Proibido criar arquivos soltos na raiz de `src/shared/`**: todo recurso reside obrigatoriamente dentro de seu subdiretório temático (`components/`, `lib/`, `styles/`, `env/`).
- **Proibido acesso ao banco em `shared`**: Arquivos em `src/shared/` nunca importam `@/db`.
- Consulte e siga as diretrizes completas em `.docs/04-SHARED.md`.

### 5. Arquitetura Modular e Isolamento de Domínios (`src/modules`)
- Funcionalidades e domínios de negócio devem residir em `src/modules/<dominio>/` (incluindo autenticação em `src/modules/auth/`).
- **Public API Obrigatória:** É proibido fazer deep imports de pastas internas de módulos. Toda comunicação externa passa exclusivamente por `@/modules/<dominio>` (`index.ts`).
- **Isolamento Server vs Client no Auth:** No servidor (Server Actions / Server Components / APIs), importe exclusivamente de `@/modules/auth`. Em Client Components (`"use client"`), importe obrigatoriamente de `@/modules/auth/client` para não vazar código de banco para o navegador.
- **Thin Routing:** Páginas em `src/app/` apenas resolvem parâmetros, autorização e delegam para o módulo. Proibido executar queries de banco diretas (`db.select()`) em `page.tsx`.
- **README do Módulo Obrigatório:** Todo módulo em `src/modules/<dominio>/` deve conter obrigatoriamente um `README.md` documentando status, invariantes e o catálogo de sua Public API, seguindo o template em `.docs/02-MODULES.md`.
- Consulte a visão macro em `.docs/01-ARCHITECTURE.md` e as diretrizes modulares em `.docs/02-MODULES.md`.

### 6. Padrão de Nomenclatura e Hierarquia da Documentação (`.docs/`)
- Arquivos em `.docs/` devem obrigatoriamente seguir o padrão `XX-NOME.md` (com prefixo de dois dígitos e nome em maiúsculas), organizados por nível de importância:
  1. `01-ARCHITECTURE.md` (Visão macro, fluxo sistêmico e matriz de decisão)
  2. `02-MODULES.md` (Vertical Slices, regras de Public API e Thin Routing)
  3. `03-DATABASE.md` (Modelagem, Drizzle ORM e migrações)
  4. `04-SHARED.md` (Fundação agnóstica e heurísticas de contenção)
- **Recálculo Obrigatório**: Caso um novo documento seja criado ou removido em `.docs/`, os níveis de importância e numerações de todos os arquivos afetados devem ser imediatamente recalculados e sincronizados neste arquivo de regras.

### 7. Convenções de Git (Commits e Branches)
- **Commits Simples em Inglês (Sem Conventional Commits)**: Mensagens de commit devem ser sempre em inglês, descritivas e em linha única, sem corpo/descrição longa para evitar poluição no histórico.
  - **Proibido Conventional Commits**: Não use prefixos como `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, etc. Use apenas uma frase descritiva em inglês (ex: `configure better-auth with drizzle adapter`, `update env validation error format`, `add agent workflow rule forbidding browser and manual tests`).
- **Fluxo de Branches (`development` ➔ `main`)**: O padrão do projeto opera com duas branches principais: `development` e `main`. **Toda e qualquer alteração é feita obrigatoriamente na branch `development`**. A branch `main` só recebe código validado, testado e aprovado através de merge da `development`.

### 8. Fluxo de Trabalho do Agente (Sem Navegador / Sem Testes Manuais)
- **Proibido Abrir Navegador:** O agente **NUNCA deve abrir o navegador** (ferramentas de browser ou subagents de navegação) nem tentar realizar testes visuais ou manuais de interface.
- **Ciclo Obrigatório de Execução:** O fluxo de trabalho do agente opera estritamente em 3 etapas:
  1. **Implementar**: Escrever o código seguindo as regras canônicas e validar estaticamente no terminal (`pnpm lint` e `pnpm build`).
  2. **Entregar Resumo**: Apresentar um resumo conciso, claro e objetivo das alterações realizadas.
  3. **Aguardar Feedback**: Parar a execução e aguardar a validação e o direcionamento do usuário antes de qualquer nova ação.


