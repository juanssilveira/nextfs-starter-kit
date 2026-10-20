# 04-SHARED.MD - DIRETRIZES DA CAMADA COMPARTILHADA (ORIENTADO A AGENTES)

Este documento foi projetado especificamente para agentes de IA. Ele contém regras estritas de contenção e decisões binárias para impedir a poluição da pasta `src/shared/`.

---

## 1. O Teste de Decisão Binária para Agentes

Antes de criar qualquer arquivo em `src/shared/`, o agente **DEVE** executar este teste:

```
┌────────────────────────────────────────────────────────────────────────┐
│ TESTE: O recurso possui QUALQUER termo de negócio da aplicação         │
│ (ex: user, account, order, payment, dashboard, profile, product)?      │
├────────────────────────────────────────────────────────────────────────┤
│ [SIM] ➔ TERMINANTEMENTE PROIBIDO EM SHARED.                           │
│        Deve residir obrigatoriamente em `src/modules/<dominio>/`.      │
├────────────────────────────────────────────────────────────────────────┤
│ [NÃO] ➔ O recurso é 100% agnóstico e reutilizável em QUALQUER projeto  │
│        (ex: botão genérico, helper de classes 'cn', validador de env)? │
│        └─ Se SIM ➔ Permitido em `src/shared/`.                         │
└────────────────────────────────────────────────────────────────────────┘
```

> **Atenção**: Na dúvida entre colocar em `modules/` ou `shared/`, a escolha padrão **SEMPRE É `modules/`**.

---

## 2. Subdiretórios Permitidos em `src/shared/`

A raiz de `src/shared/` é estritamente modular. Apenas estes 4 subdiretórios são autorizados:

```
src/shared/
├── components/   ➔ Primitivos de UI 100% agnósticos (Button, Input, Modal, Dropdown)
├── env/          ➔ Validação estrita de variáveis de ambiente com Zod (index.ts)
├── lib/          ➔ Utilitários universais e puros (ex: cn(), formatCurrency())
└── styles/       ➔ Estilos globais e tokens CSS (globals.css)
```

### O que cada pasta aceita:

| Pasta | Pode conter | NUNCA pode conter |
| :--- | :--- | :--- |
| **`components/`** | Botões, inputs, cards genéricos (estilo shadcn/ui). | `UserAvatar`, `ProductCard`, `LoginForm`. |
| **`env/`** | Schema de validação Zod e tipagem de `process.env`. | Configurações ou regras de negócio. |
| **`lib/`** | Funções puras sem efeitos colaterais (`utils.ts`, `cn`). | Chamadas de banco (`db`), APIs de terceiros. |
| **`styles/`** | `globals.css` e diretivas do Tailwind CSS v4. | Estilos inline ou específicos de módulos. |

---

## 3. Regras Invioláveis de Código para Agentes

1. **Raiz 100% Limpa**: É proibido criar arquivos `.ts` ou `.tsx` soltos na raiz de `src/shared/`.
2. **Proibido Barrels Globais em Shared**: Não crie um `src/shared/index.ts`. O agente deve importar diretamente da pasta do recurso para garantir *tree-shaking* e isolamento:
   * ✅ `import { env } from "@/shared/env";`
   * ✅ `import { Button } from "@/shared/components/button";`
   * ❌ `import { Button, env } from "@/shared";`
3. **Proibido Acesso ao Banco em Shared**: Nenhum arquivo dentro de `src/shared/` tem permissão de importar `@/db`. Código que fala com o banco pertence exclusivamente a `src/modules/<dominio>/server/` ou `src/db/`.
