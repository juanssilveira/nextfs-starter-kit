# ARCHITECTURE.MD - VISÃO GERAL DO SISTEMA E DIRETRIZES MACRO

Este documento define a arquitetura sistêmica de alto nível da aplicação, as responsabilidades de cada camada do projeto, o fluxo de dados e os princípios fundamentais que guiam desenvolvedores e agentes de IA.

---

## 1. Stack Tecnológica Central

* **Framework:** Next.js (App Router, Turbopack, React Server Components)
* **Linguagem:** TypeScript (Strict mode ativado)
* **Estilização:** Tailwind CSS v4 com `@tailwindcss/turbopack`
* **Banco de Dados & ORM:** PostgreSQL com Drizzle ORM
* **Autenticação:** Better Auth (Modularizado em `src/modules/auth`)
* **Validação de Dados:** Zod (Tipagem estrita e fail-fast)
* **Gerenciador de Pacotes:** `pnpm`

---

## 2. As 4 Camadas da Aplicação

A arquitetura do projeto é dividida estritamente em quatro camadas com fronteiras claras:

```
src/
├── app/          ➔ Camada de Transporte e Montagem (Thin Routing)
├── modules/      ➔ Camada de Negócio e Domínio (Vertical Slices)
├── db/           ➔ Camada de Persistência e Modelagem SQL (Drizzle ORM)
└── shared/       ➔ Camada de Fundação Agnóstica (Infraestrutura neutra)
```

### Responsabilidades de Cada Camada:

| Camada | Papel Primário | O que faz | O que NUNCA deve fazer |
| :--- | :--- | :--- | :--- |
| **`src/app/`** | Entrega & Roteamento | Define rotas, resolve URLs, orquestra permissões e delega para módulos. | **Nunca** executa queries de banco (`db.select()`) nem regras de negócio. |
| **`src/modules/`** | Domínio de Negócio | Concentra 100% da lógica, mutações, queries e telas de cada funcionalidade. | **Nunca** permite *deep imports* externos; expõe tudo via `index.ts`. |
| **`src/db/`** | Persistência | Modela schemas do PostgreSQL, conexões singleton e gerencia migrações. | **Nunca** acumula regras de negócio ou validações de formulários da UI. |
| **`src/shared/`** | Fundação Neutra | Primitivos do Design System, validação de `env`, helpers agnósticos. | **Nunca** deve conter termos ou lógicas de negócio (usuários, pedidos, etc.). |

---

## 3. Matriz de Decisão para Agentes de IA ("Onde Coloco Meu Código?")

Ao receber uma tarefa de criação ou modificação de código, avalie as perguntas abaixo nesta ordem estrita:

```
1. É uma rota, layout ou endpoint de API HTTP?
   └─ SIM ➔ Crie em `src/app/` (apenas como orquestrador fino).

2. É uma tabela do banco de dados, relação ou migração?
   └─ SIM ➔ Crie em `src/db/schema/<dominio>.ts` (consulte .docs/03-DATABASE.md).

3. Contém lógica de negócio, regras, ações de usuário ou telas da funcionalidade?
   └─ SIM ➔ Crie em `src/modules/<dominio>/` (consulte .docs/02-MODULES.md).

4. É um componente de UI primitivo genérico (ex: Button, Dialog) ou utilitário matemático/puro (ex: cn)?
   └─ SIM ➔ Crie em `src/shared/` (consulte .docs/04-SHARED.md).
```

---

## 4. Ciclo de Vida de uma Requisição (Fluxo Unidirecional de Dados)

Toda mutação ou leitura de dados segue este pipeline obrigatório:

```
┌───────────────────────────────────────────────────────────────┐
│ 1. Cliente (Browser / Client Component)                       │
│    Usuário submete formulário ou interage com a interface     │
└──────────────────────────────┬────────────────────────────────┘
                               │ Dispara Server Action ou navega para rota
                               ▼
┌───────────────────────────────────────────────────────────────┐
│ 2. Transporte (src/app/ ou src/modules/<dominio>/actions/)     │
│    • Valida input recebido com schema Zod correspondente      │
│    • Valida sessão através de requireAuth()                   │
└──────────────────────────────┬────────────────────────────────┘
                               │ Invoca serviço do domínio
                               ▼
┌───────────────────────────────────────────────────────────────┐
│ 3. Domínio de Negócio (src/modules/<dominio>/server/)         │
│    • Aplica regras de negócio e invariantes                   │
│    • Executa queries/mutations através do cliente Drizzle     │
└──────────────────────────────┬────────────────────────────────┘
                               │ Acessa camada de dados
                               ▼
┌───────────────────────────────────────────────────────────────┐
│ 4. Persistência (src/db/ com PostgreSQL)                      │
│    • Retorna dados tipados via inferência do Drizzle          │
└───────────────────────────────────────────────────────────────┘
```

---

## 5. Regras Globais Invioláveis

1. **Imports com alias `@/`**: Todos os imports devem apontar para `@/` (ex: `@/modules/auth`, `@/db`, `@/shared/env`), exceto irmãos no mesmo diretório imediato.
2. **Public API Estrita em Módulos**: Proibido deep imports de pastas internas de módulos. O ESLint bloqueia automaticamente qualquer violação (`no-restricted-imports`).
3. **Variáveis de Ambiente Tipadas**: Nenhuma variável deve ser consumida via `process.env`. Todas passam pelo Zod em `src/shared/env/index.ts`.
4. **Modelagem Modular de Schemas**: Novos schemas de banco residem em `src/db/schema/<dominio>.ts` e são re-exportados em `src/db/index.ts`.
5. **Convenções de Git**: Commits simples em linha única e sempre em inglês, estritamente sem prefixos de conventional commits (ex: não usar `feat:`, `fix:`) e sem descrição longa. Todo desenvolvimento ocorre obrigatoriamente na branch `development`, sendo mesclado para a `main` apenas quando testado e validado.

---

## 6. Guias Especializados Complementares

Para o passo a passo detalhado de cada camada, consulte:

* **[02-MODULES.md](./02-MODULES.md)**: Guia completo de Vertical Slices, anatomia de pastas, Public API e convenções de módulos.
* **[03-DATABASE.md](./03-DATABASE.md)**: Modelagem de schemas, Drizzle ORM, convenções SQL e fluxo de migrações.
* **[04-SHARED.md](./04-SHARED.md)**: Diretrizes da camada de fundação, estilos, componentes genéricos e env.
* **Planejamento & Specs (`.specs/`)**: Para engenharia de novas features via especificações e decisões arquiteturais (ADRs), consulte a skill **Spec-Craft** em `.agents/skills/spec-craft/` e o estado em `.specs/STATE.md`.
