# Estado Global de Especificações & Features

> **Próximo `<NNN>` Disponível:** `001`  
> **Status:** Ativo  
> **Última Atualização:** 2026-10-20  

Este arquivo é a fonte da verdade para o controle de features, decisões arquiteturais (*ADRs*) e fila de trabalho (*WIP*) do projeto.

---

## 1. Features em Andamento (WIP)

| ID | Slug | Status | Data de Início | Módulos Afetados | Responsável |
| :--- | :--- | :--- | :--- | :--- | :--- |
| - | *Nenhuma feature em andamento no momento* | - | - | - | - |

---

## 2. Histórico de Features Concluídas & Imutáveis no Git

| ID | Slug | Data de Conclusão | Commit de Entrega | Status |
| :--- | :--- | :--- | :--- | :--- |
| - | *Nenhuma feature concluída até o momento* | - | - | - |

---

## 3. Decisões Arquiteturais Globais (ADRs)

| ADR ID | Decisão | Contexto & Trade-off Principal |
| :--- | :--- | :--- |
| **ADR-001** | Arquitetura Modular em 4 Camadas | `src/app` (Thin Routing), `src/modules` (Domínio), `src/db` (Persistência) e `src/shared` (Fundação). |
| **ADR-002** | Better Auth em `src/modules/auth` | Autenticação isolada como módulo de negócio com separação estrita de runtime (`client.ts` vs server). |
| **ADR-003** | Validação Centralizada de Env via Zod | Proibição de acesso a `process.env` direto; garantia de fail-fast no boot em `@/shared/env`. |
| **ADR-004** | Metodologia Spec-Lean para Features | Planejamento orientado a specs em `.specs/`, checks congelados e verificação independente. |
