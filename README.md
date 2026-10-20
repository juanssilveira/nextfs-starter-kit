# Next.js Modular Starter Kit

Starter kit pronto para produção construído sobre **Next.js 16** (App Router, Turbopack e React 19), **Drizzle ORM** com **PostgreSQL**, **Better Auth**, **Tailwind CSS v4** e uma arquitetura estritamente modular orientada a domínios e desenvolvimento com agentes de IA.

---

## 🚀 Stack Tecnológica

* **Framework:** [Next.js](https://nextjs.org/) 16 (App Router, Turbopack, React Server Components)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/) (Strict mode)
* **Biblioteca UI:** [React](https://react.dev/) 19
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/) v4 com tokens semânticos e tipografia Geist
* **Banco de Dados & ORM:** [PostgreSQL](https://www.postgresql.org/) 17 via Docker + [Drizzle ORM](https://orm.drizzle.team/)
* **Autenticação:** [Better Auth](https://www.better-auth.com/) modularizado com suporte a Client e Server
* **Validação de Dados & Env:** [Zod](https://zod.dev/) com validação estrita e mensagens de erro coloridas no terminal
* **Linter:** [ESLint](https://eslint.org/) 9 com regras de contenção arquitetural (`no-restricted-imports`)
* **Gerenciador de Pacotes:** [pnpm](https://pnpm.io/)

---

## 🏛️ As 4 Camadas da Arquitetura

O projeto adota uma separação rígida de responsabilidades em 4 camadas:

```
src/
├── app/          ➔ Roteamento Fino (Thin Routing), layouts e APIs HTTP
├── modules/      ➔ Domínios de negócio isolados (Vertical Slices com Public API)
├── db/           ➔ Persistência SQL, schemas modulares Drizzle e migrações
└── shared/       ➔ Fundação agnóstica reutilizável (lib, env, styles, components)
```

Para detalhes sobre cada camada, consulte os guias em [`.docs/`](./.docs/):
* **[01-ARCHITECTURE.md](./.docs/01-ARCHITECTURE.md)**: Visão macro, fluxo unidirecional e matriz de decisão.
* **[02-MODULES.md](./.docs/02-MODULES.md)**: Padrão de Vertical Slices, Public API (`index.ts`) e Thin Routing.
* **[03-DATABASE.md](./.docs/03-DATABASE.md)**: Modelagem modular Drizzle, convenções SQL e migrações.
* **[04-SHARED.md](./.docs/04-SHARED.md)**: Utilitários agnósticos, tokens de design e validação de `env`.

---

## ⚡ Início Rápido

### Pré-requisitos
* [Node.js](https://nodejs.org/) (versão 20 ou superior)
* [pnpm](https://pnpm.io/) (`corepack enable` ou `npm i -g pnpm`)
* [Docker](https://www.docker.com/) & Docker Compose

### Passo a Passo

1. **Instalar dependências:**
   ```bash
   pnpm install
   ```

2. **Subir o banco de dados PostgreSQL:**
   ```bash
   docker compose up -d
   ```

3. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   *(Gere um secret aleatório para `BETTER_AUTH_SECRET` se for autenticar em produção).*

4. **Aplicar migrações no banco de dados:**
   ```bash
   pnpm db:migrate
   ```

5. **Iniciar o servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```

A aplicação estará disponível em `http://localhost:3000`.

---

## 📜 Scripts Disponíveis

| Script | Descrição |
| :--- | :--- |
| `pnpm dev` | Inicia o servidor local Next.js com Turbopack |
| `pnpm build` | Valida tipagens TypeScript e compila o bundle de produção |
| `pnpm start` | Executa a build de produção localmente |
| `pnpm lint` | Executa o ESLint verificando regras de qualidade e Public API |
| `pnpm db:generate` | Gera novos arquivos de migração SQL a partir dos schemas Drizzle |
| `pnpm db:migrate` | Executa as migrações SQL pendentes no banco PostgreSQL |
| `pnpm db:push` | Sincroniza schemas diretamente com o banco de desenvolvimento |
| `pnpm db:studio` | Abre o painel visual Drizzle Studio no navegador |

---

## 🤖 Desenvolvimento com Agentes de IA

Este repositório foi construído com regras canônicas voltadas para agentes autônomos e pair programming:

* **[AGENTS.md](./AGENTS.md)**: 9 regras canônicas invioláveis (imports `@/`, isolamento server vs client em auth, proibição de commits prematuros, política sem navegador).
* **Skill Spec-Craft (`.agents/skills/spec-craft/`)**: Metodologia de planejamento Spec-Lean com One-Way Doors, contratos congelados (`checks.md`) e política de **Zero-Acúmulo no Git**.
* **Controle de Estado (`.specs/STATE.md`)**: Rastreamento de ADRs, próximo ID e histórico de features imutáveis no Git.
