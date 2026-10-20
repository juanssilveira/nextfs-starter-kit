# Checks: <Nome da Feature>

> **Feature:** `<NNN-slug-da-feature>`  
> **Status:** Congelado  
> **Data:** YYYY-MM-DD  
> **Regra de Ouro:** Cada check é uma afirmação observável com valor concreto atrelada a uma prova executável (código de saída 0). O escopo é congelado uma vez aprovado.

---

## 1. Contrato de Checks & Provas Executáveis

| ID | Claim Observável (O que deve ser verdade) | Prova Executável (Comando / Verificação Estática) |
| :--- | :--- | :--- |
| **CHK-01** | Schema Zod rejeita payloads malformados ou incompletos | Checagem estática de tipagem e validação de schema |
| **CHK-02** | Tentativa de acesso sem autenticação válida é bloqueada no servidor | Checagem de fluxo de autorização no service/action |
| **CHK-03** | Mutação persiste no banco via Drizzle e retorna dados tipados inferidos | Tipagem estrita `$inferSelect` / `$inferInsert` |
| **CHK-04** | Public API do módulo expõe apenas os contratos necessários via `index.ts` | Regra ESLint `no-restricted-imports` validada |
| **CHK-05** | Nenhuma variável de ambiente é consumida sem validação em `@/shared/env` | Compilação estática sem erros |

---

## 2. Invariantes de Isolamento, Arquitetura & Qualidade

- [ ] **CHK-06:** Nenhuma query Drizzle é chamada diretamente em `src/app/` (Thin Routing preservado).
- [ ] **CHK-07:** Nenhum arquivo de componente excede o limite de 250 linhas e a estilização segue o design system compartilhado.
- [ ] **CHK-08:** A suíte de validação geral passa sem regressões (`pnpm lint && pnpm build`).
- [ ] **CHK-09:** O módulo contém documentação atualizada em `src/modules/<modulo>/README.md`.
