# Módulo: Auth (Autenticação, Sessões & Integração Better Auth)

> **Status:** Ativo (Start-Ready)  
> **Domínio:** Autenticação de usuários, emissão e validação de sessões, persistência de contas e credenciais via Better Auth integrado ao PostgreSQL (Drizzle ORM).

---

## 1. Responsabilidades & Invariantes

* **Autenticação Centralizada**: Gestão do ciclo de vida de credenciais (e-mail e senha ativados por padrão, expansível para provedores OAuth como Google/GitHub).
* **Gestão de Sessões**: Validação de cookies de sessão no servidor via headers HTTP e persistência nas tabelas `session` e `user` do Drizzle.
* **Isolamento Rígido de Ambientes (Server vs Client)**:
  * O servidor possui acesso ao banco de dados e segredos (`auth`, `getSession`, `getCurrentUser`, `requireAuth`).
  * O cliente web (`"use client"`) consome unicamente o cliente reativo do Better Auth (`authClient`), sem carregar drivers de banco ou segredos para o navegador.
* **Controle de Acesso em Rotas e Actions**:
  * Chamadas protegidas no servidor devem invocar `requireAuth()` para garantir identidade antes de executar regras de negócio.

---

## 2. Public API

### Server (`@/modules/auth`)
* `auth`: Instância principal do Better Auth configurada com Drizzle adapter e segredos validados pelo Zod.
* `getSession()`: Retorna a sessão ativa e o usuário autenticado a partir dos headers da requisição, ou `null`.
* `getCurrentUser()`: Retorna exclusivamente o objeto do usuário logado, ou `null`.
* `requireAuth()`: Garante autenticação; retorna o usuário logado ou lança erro/redirecionamento se a sessão for inválida.

### Client (`@/modules/auth/client`)
* `authClient`: Instância do cliente React do Better Auth (`createAuthClient()`) para executar login, cadastro, logout e hooks reativos de sessão no navegador.

---

## 3. Exemplos Canônicos de Consumo

### A. Protegendo um Server Component ou Página (`src/app/`):
```tsx
import { getCurrentUser } from "@/modules/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return <div>Bem-vindo, {user.name}!</div>;
}
```

### B. Protegendo uma Server Action (`src/modules/<dominio>/actions/`):
```ts
"use server";
import { requireAuth } from "@/modules/auth";

export async function createPostAction(data: unknown) {
  const user = await requireAuth();
  // user.id garantido e validado
}
```

### C. Consumindo no Navegador (`"use client"`):
```tsx
"use client";
import { authClient } from "@/modules/auth/client";

export function UserButton() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) return <span>Carregando...</span>;
  if (!session) {
    return <button onClick={() => authClient.signIn.email({ email: "", password: "" })}>Entrar</button>;
  }

  return <button onClick={() => authClient.signOut()}>Sair ({session.user.name})</button>;
}
```

---

## 4. Integração com Banco de Dados

Este módulo gerencia e consome os seguintes schemas declarados em `src/db/schema/auth.ts`:
* `user`: Registro principal do usuário (`id`, `name`, `email`, `emailVerified`, `image`).
* `session`: Sessões ativas e tokens (`token`, `expiresAt`, `ipAddress`, `userAgent`).
* `account`: Provedores de login e senhas com hash (`providerId`, `password`, `accessToken`).
* `verification`: Tokens temporários de validação e redefinição.
