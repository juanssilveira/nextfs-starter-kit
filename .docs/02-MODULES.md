# 02-MODULES.MD - GUIA DE ARQUITETURA MODULAR (VERTICAL SLICE)

Este documento define o padrão arquitetural de **Vertical Slice Architecture** (arquitetura modular por domínio) para a aplicação. Ele dita como as funcionalidades devem ser organizadas, isoladas, consumidas e documentadas.

---

## 1. Filosofia e Princípios

1. **Domínio como Fronteira Primária (Alta Coesão):**
   Em vez de separar a aplicação por tipo técnico (`src/components/`, `src/services/`, `src/actions/`), todo o código relacionado a um recurso de negócio específico (UI, validações, serviços, regras e mutações) reside agrupado no seu módulo em `src/modules/<dominio>/`.
2. **Encapsulamento Estrito (Baixo Acoplamento):**
   O módulo funciona como uma "mini-biblioteca" interna. Detalhes de implementação internos não vazam para o restante da aplicação. Apenas o que é exportado em `index.ts` (Public API) pode ser consumido externamente.
3. **Thin Routing (Rotas Finas no Next.js):**
   As rotas do Next.js App Router (`src/app/`) são apenas orquestradores de montagem e transporte. Elas nunca executam queries diretas no banco de dados nem acumulam lógica de negócio complexa.
4. **Neutros Compartilhados em `src/shared/`:**
   Primitivos visuais universais (Design System base), validação de variáveis de ambiente e utilitários agnósticos de domínio pertencem a `src/shared/`.

---

## 2. Estrutura de Diretórios & Anatomia de um Módulo

Ao criar ou expandir uma funcionalidade em `src/modules/<dominio>/`, siga esta árvore padrão:

```text
src/modules/<dominio>/
├── README.md             # Contrato do módulo: responsabilidades, regras de negócio e Public API
├── index.ts              # Public API: O ÚNICO ponto de exportação do módulo para o restante do app
├── components/           # Componentes React de UI exclusivos do domínio (máx. 200-250 linhas cada)
├── actions/              # Server Actions chamadas pelo cliente ("use server")
├── server/               # Lógica de negócio server-only, serviços e queries de banco
│   └── commands/         # (Opcional) Casos de uso atômicos compartilhados entre Actions, APIs e Cron jobs
├── schemas/              # Schemas Zod de validação de formulários e inputs
└── types/                # Tipos e interfaces TypeScript específicos do domínio
```

### O que vai em cada subdiretório?

| Diretório / Arquivo | Responsabilidade | O que NÃO colocar |
| :--- | :--- | :--- |
| **`README.md`** | Documentação concisa (< 40 linhas) descrevendo regras e listando a Public API. | Código ou tutoriais longos. |
| **`index.ts`** | Exporta componentes, ações, schemas e queries autorizados para uso externo. | Lógica de negócio ou implementações diretas. |
| **`components/`** | Telas, formulários, cards e modais focados neste domínio. | Botões e inputs genéricos (use `@/shared/components`). |
| **`actions/`** | Server Actions que recebem input do cliente, validam sessão e chamam o `server/`. | Queries SQL diretas ou lógica de infraestrutura. |
| **`server/`** | Funções assíncronas que interagem com o banco (Drizzle/ORM), APIs externas e cache. | Hooks do React ou diretivas `"use client"`. |
| **`schemas/`** | Schemas Zod reutilizáveis para forms e validações de input. | Schemas globais do sistema (ex: `env.ts`). |
| **`types/`** | Tipos do domínio (DTOs, ViewModels e estados de UI). | Tipos inferidos de tabelas que pertencem a `src/db`. |

---

## 3. A Regra Inviolável: Public API (`index.ts`)

Toda e qualquer importação vinda de fora do módulo (seja de uma rota em `src/app/` ou de outro módulo) **deve passar obrigatoriamente** pela raiz do módulo (`@/modules/<dominio>`).

### Exemplos:

* ❌ **PROIBIDO (Deep Import viola o encapsulamento e acopla a estrutura interna):**
  ```typescript
  import { UserProfileCard } from "@/modules/users/components/user-profile-card";
  import { getUserById } from "@/modules/users/server/queries";
  import { updateUserSchema } from "@/modules/users/schemas/update-user";
  ```

* ✅ **CORRETO (Apenas via Public API):**
  ```typescript
  import { UserProfileCard, getUserById, updateUserSchema } from "@/modules/users";
  ```

### Garantindo o Isolamento via ESLint

Para impedir automaticamente que desenvolvedores ou agentes violem essa barreira, adicione no `eslint.config.mjs`:

```javascript
// eslint.config.mjs
export default [
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/modules/*/*"],
              message: "Deep imports em módulos são proibidos. Importe sempre através da Public API: '@/modules/<dominio>'."
            }
          ]
        }
      ]
    }
  }
];
```

---

## 4. Padrão "Thin Routing" (`src/app/`)

As páginas (`page.tsx`) e layouts (`layout.tsx`) devem ser enxutos e declarativos.

### O que uma rota DEVE fazer:
1. Extrair parâmetros da rota (`params`, `searchParams`).
2. Resolver autenticação / autorização do usuário ou tenant.
3. Chamar as queries/serviços necessários expostos pelo módulo.
4. Renderizar o componente de visualização do módulo correspondente.

### O que uma rota NUNCA deve fazer:
* ❌ Executar `db.select()` ou queries do ORM diretamente.
* ❌ Implementar regras de negócio ou mutações no banco.
* ❌ Definir schemas de validação Zod locais.

### Exemplo Comparativo:

```tsx
// ❌ ERRADO: Página inchada com banco e regra de negócio
// src/app/(dashboard)/organizations/[id]/page.tsx
import { db } from "@/db";
import { organizations } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function OrgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [org] = await db.select().from(organizations).where(eq(organizations.id, id));
  // ... lógicas e JSX misturados
}
```

```tsx
// ✅ CORRETO: Thin route delegando para o módulo
// src/app/(dashboard)/organizations/[id]/page.tsx
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/modules/auth";
import { getOrganizationById, OrganizationDashboardView } from "@/modules/organizations";

export default async function OrgPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getCurrentUser();

  const org = await getOrganizationById(user.id, id);
  if (!org) notFound();

  return <OrganizationDashboardView organization={org} />;
}
```

---

## 5. Padrão de Server Actions e Respostas

Para garantir consistência na interface e evitar quebras de execução:

1. **Nunca use `throw new Error()` solto para o cliente.**
2. Retorne sempre uma **união discriminada tipada**:
   ```typescript
   export type ActionResult<T = void> =
     | { success: true; data: T }
     | { success: false; error: string; fieldErrors?: Record<string, string[]> };
   ```

3. **Exemplo canônico de Server Action (`src/modules/<dominio>/actions/`):**
   ```typescript
   "use server";

   import { revalidatePath } from "next/cache";
   import { requireAuth } from "@/modules/auth";
   import { updateProfileSchema } from "../schemas";
   import { updateProfileService } from "../server";

   export async function updateProfileAction(rawInput: unknown) {
     const user = await requireAuth();
     
     const parsed = updateProfileSchema.safeParse(rawInput);
     if (!parsed.success) {
       return {
         success: false as const,
         error: "Dados inválidos.",
         fieldErrors: parsed.error.flatten().fieldErrors,
       };
     }

     try {
       const updated = await updateProfileService(user.id, parsed.data);
       revalidatePath("/settings/profile");
       return { success: true as const, data: updated };
     } catch (error) {
       return {
         success: false as const,
         error: "Ocorreu um erro ao atualizar seu perfil. Tente novamente.",
       };
     }
   }
   ```

---

## 6. O que pertence a `src/shared/` vs `src/modules/`

* **Pertence a `src/shared/`:**
  * Componentes do Design System agnósticos (Botões, Modais, Tooltips, Toasts, Inputs).
  * `src/shared/env/` (Validação de variáveis de ambiente com Zod).
  * Helpers universais de formatação (data, moeda, strings).
  * Clientes de SDKs agnósticos (ex: cliente de e-mail transacional genérico).

* **Pertence a `src/modules/<dominio>/`:**
  * Componentes que contêm regras ou layouts de um contexto de negócio (ex: `BillingCard`, `UserTable`).
  * Server Actions e mutations de dados.
  * Queries específicas daquele contexto.
  * Schemas Zod de formulários daquele domínio.

---

## 7. Template Padrão de `README.md` para Novos Módulos

Todo novo módulo criado em `src/modules/<dominio>/` **deve obrigatoriamente** conter um arquivo `README.md` documentando seu contrato. Copie o template abaixo ao inicializar um módulo:

```markdown
# Módulo: <Nome do Módulo> (<Subtítulo do Domínio>)

> **Status:** [Ativo | Em Desenvolvimento | Rascunho]  
> **Domínio:** Descrição objetiva de 1 a 2 linhas sobre o escopo de negócio deste módulo.

---

## 1. Responsabilidades & Invariantes

* **Responsabilidade Principal:** O que este módulo gerencia e resolve na aplicação.
* **Invariante 1:** Regra de negócio obrigatória (ex: Apenas o dono da organização pode alterar o nome).
* **Invariante 2:** Regra de integridade (ex: Todo registro criado deve pertencer a um tenant válido).
* **Isolamento:** Quais recursos deste módulo são de uso estritamente interno e quais são públicos.

---

## 2. Public API

### Server (`@/modules/<dominio>`)
* **Queries & Services:** `get<Recurso>ById()`, `list<Recursos>()`
* **Server Actions:** `create<Recurso>Action()`, `delete<Recurso>Action()`
* **Schemas:** `<recurso>Schema`, `create<Recurso>Schema`
* **Types:** `type <Recurso>ViewModel`, `type <Recurso>ActionResult`

### Client (`@/modules/<dominio>/client`) - *(Se houver)*
* **Componentes de UI / Hooks:** `<RecursoForm />`, `<RecursoCard />`, `use<Recurso>State()`

---

## 3. Exemplos Canônicos de Consumo

### Exemplo em Thin Route (`src/app/<rota>/page.tsx`):
```tsx
import { get<Recurso>ById, <RecursoView> } from "@/modules/<dominio>";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await get<Recurso>ById(id);
  if (!data) notFound();

  return <<RecursoView> data={data} />;
}
```

---

## 4. Integração com Banco de Dados

Schemas em `src/db/schema/` consumidos ou gerenciados por este módulo:
* `<tabela_1>`: Descrição da relação com este módulo.
* `<tabela_2>`: Descrição da relação com este módulo.
```
